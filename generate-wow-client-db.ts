/// <reference lib="deno.ns" />

import { fromBytes } from './launcher/dbc.ts'
import { dbcSchema } from './launcher/dbc-schema.ts'

const spellOverride = await (await fetch(
  'https://gsheet.devazuka.com/11PVL9YA1lmCoqaIguKjwuDFX58e8hzAh6kzDXA4jBV4/SPELL.DBC',
)).json()

type DBCRow = Record<string, number | string | undefined>
type SheetRow = Record<string, number | string>
type DBCName = keyof typeof dbcSchema

const spellOverrideById = Object.fromEntries(
  spellOverride.map((spell: SheetRow) => [Number(spell.ID), spell]),
)

const EFFECT_VALUE = /\$(?:(\d+))?([mMsS])([1-3])/g
const EFFECT_FORMULA = /\$([/*+-])(\d+(?:\.\d+)?);(?:(\d+))?([mMsS])([1-3])/g
const BRACED_EXPRESSION = /\$\{([^}]+)\}/g
const BRACED_ARITHMETIC = /\$\{([\d\s.+\-*/()]+)\}/g
const PLURAL_CHOICE = /\$l([^:;]+):([^;]+);/g
const DURATION = /\$(?:(\d+))?d/g
const PROC_CHANCE = /\$(?:(\d+))?h/g
const STACK_COUNT = /\$(?:(\d+))?n/g
const AURA_PERIOD = /\$(?:(\d+))?t([1-3])/g
const COMBO_POINT_VALUE = /\$(?:(\d+))?b([1-3])/g

const openDBC = async (name: DBCName) => {
  const bytes = await Deno.readFile(`./${name}`)
  return fromBytes(dbcSchema[name], bytes.buffer)
}

const spells = await openDBC('Spell.dbc')
const tabs = await openDBC('TalentTab.dbc')
const spellIcons = await openDBC('SpellIcon.dbc')
const spellDurations = await openDBC('SpellDuration.dbc')

const dlIcon = async (iconName: string) => {
  const iconPath = `./web/assets/icon/${iconName}.jpg`
  try {
    Deno.statSync(`./web/assets/icon/${iconName}.jpg`)
  } catch {
    console.log('fetching', iconName)
    const res = await fetch(`https://wow.zamimg.com/images/wow/icons/large/${iconName.toLowerCase()}.jpg`)
    if (!res.ok) throw Error(`${iconName} not found`)
    const img = await res.arrayBuffer()
    await Deno.writeFile(iconPath, new Uint8Array(img))
  }
}

const asNumber = (value: number | string | undefined) => Number(value) || 0

const formatNumber = (value: number) => {
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

const getEffectValue = (spell: DBCRow, kind: string, effectIndex: string) => {
  const base = asNumber(spell[`EffectBasePoints_${effectIndex}`])
  const dieSides = asNumber(spell[`EffectDieSides_${effectIndex}`])
  const value = base === 0 && dieSides === 0 ? 0 : base + 1

  switch (kind) {
    case 'm':
    case 's':
      return value
    case 'M':
      return base + Math.max(1, dieSides)
    case 'S':
      return Math.abs(value)
    default: {
      const _: never = kind as never
      return _
    }
  }
}

const calculate = (left: number, operator: string, right: number) => {
  switch (operator) {
    case '/':
      return right === 0 ? left : left / right
    case '*':
      return left * right
    case '+':
      return left + right
    case '-':
      return left - right
    default: {
      const _: never = operator as never
      return _
    }
  }
}

const formatFormula = (
  spell: DBCRow,
  operator: string,
  operand: string,
  spellId: string | undefined,
  kind: string,
  effectIndex: string,
) => {
  const source = getReferencedSpell(spell, spellId)
  const value = getEffectValue(source, kind, effectIndex)
  return formatNumber(calculate(value, operator, Number(operand)))
}

const getReferencedSpell = (spell: DBCRow, spellId: string | undefined) => {
  if (!spellId) return spell
  const referencedSpell = spells.byIds.get(Number(spellId)) as
    | DBCRow
    | undefined
  if (!referencedSpell) return spell
  Object.assign(referencedSpell, spellOverrideById[Number(spellId)])
  return referencedSpell
}

const formatDuration = (spell: DBCRow, spellId: string | undefined) => {
  const source = getReferencedSpell(spell, spellId)
  const durationIndex = asNumber(source.DurationIndex)
  const duration = spellDurations?.byIds.get(durationIndex) as
    | DBCRow
    | undefined
  if (!duration) {
    return `$${spellId || ''}d`
  }

  const milliseconds = asNumber(duration.Duration)
  if (milliseconds === -1) return 'until cancelled'
  if (milliseconds < 1000) return `${milliseconds} ms`

  return `${formatNumber(milliseconds / 1000)} sec`
}

const formatMilliseconds = (milliseconds: number) => {
  if (milliseconds < 1000) return `${milliseconds} ms`
  return formatNumber(milliseconds / 1000)
}

const formatExpression = (spell: DBCRow, expression: string) => {
  const jsExpression = expression
    .replace(/\$<[^>]+>/g, '1')
    .replace(
      /\$(?:(\d+))?([mMsS])([1-3])/g,
      (_, spellId, kind, effectIndex) => {
        const source = getReferencedSpell(spell, spellId)
        return String(getEffectValue(source, kind, effectIndex))
      },
    )

  if (!/^[\d\s.+\-*/()]+$/.test(jsExpression)) {
    return `\${${expression}}`
  }

  return formatNumber(Function(`return ${jsExpression}`)())
}

const formatSpellText = (spell: DBCRow, text: string) => {
  let lastEffectValue = 0

  return text
    .replace(
      BRACED_EXPRESSION,
      (_, expression) => formatExpression(spell, expression),
    )
    .replace(
      EFFECT_FORMULA,
      (_, operator, operand, spellId, kind, effectIndex) => {
        const value = formatFormula(
          spell,
          operator,
          operand,
          spellId,
          kind,
          effectIndex,
        )
        lastEffectValue = Number(value) || lastEffectValue
        return value
      },
    )
    .replace(EFFECT_VALUE, (_, spellId, kind, effectIndex) => {
      const source = getReferencedSpell(spell, spellId)
      const value = getEffectValue(source, kind, effectIndex)
      lastEffectValue = value
      return formatNumber(value)
    })
    .replace(DURATION, (_, spellId) => formatDuration(spell, spellId))
    .replace(PROC_CHANCE, (_, spellId) => {
      const source = getReferencedSpell(spell, spellId)
      return formatNumber(asNumber(source.ProcChance))
    })
    .replace(STACK_COUNT, (_, spellId) => {
      const source = getReferencedSpell(spell, spellId)
      return formatNumber(asNumber(source.ProcCharges))
    })
    .replace(AURA_PERIOD, (_, spellId, effectIndex) => {
      const source = getReferencedSpell(spell, spellId)
      return formatMilliseconds(
        asNumber(source[`EffectAuraPeriod_${effectIndex}`]),
      )
    })
    .replace(COMBO_POINT_VALUE, (_, spellId, effectIndex) => {
      const source = getReferencedSpell(spell, spellId)
      return formatNumber(
        asNumber(source[`EffectPointsPerCombo_${effectIndex}`]),
      )
    })
    .replace(
      PLURAL_CHOICE,
      (_, singular, plural) =>
        Math.abs(lastEffectValue) === 1 ? singular : plural,
    )
    .replace(
      BRACED_ARITHMETIC,
      (_, expression) => formatExpression(spell, expression),
    )
}

const getSpell = (rid: number | string) => {
  const id = Number(rid)
  const spell = spells.byIds.get(id) as DBCRow | undefined
  if (!spell) return
  Object.assign(spell, spellOverrideById[id])
  const icon = spellIcons.byIds.get(asNumber(spell.SpellIconID)) as
    | DBCRow
    | undefined
  const text = String(spell.Description_Lang_enUS || '')

  return {
    name: spell.Name_Lang_enUS,
    text: formatSpellText(spell, text),
    icon: String(icon?.File || '').split('\\').at(-1),
  }
}

const data = {}
const talents = await (await fetch(
  'https://gsheet.devazuka.com/11PVL9YA1lmCoqaIguKjwuDFX58e8hzAh6kzDXA4jBV4/TALENT.DBC',
)).json()
const talentById = new Map()
for (const talent of talents) {
  const r1 = getSpell(talent.SpellRank_1)
  const tab = tabs.byIds.get(Number(talent.TabID))
  const classm = data[tab.ClassMask] || (data[tab.ClassMask] = {})
  const rows = classm[tab.Name_Lang_enUS] || (classm[tab.Name_Lang_enUS] = [])
  const rid = Number(talent.TierID)
  const row = rows[rid] || (rows[rid] = [])
  const index = Number(talent.ColumnIndex)
  await dlIcon(r1.icon)
  const talentData = {
    name: r1.name,
    icon: r1.icon,
    index: index + rid*4,
    requires: [
      Number(talent.PrereqTalent_1),
      Number(talent.PrereqTalent_2),
      Number(talent.PrereqTalent_3),
    ].filter(Boolean)[0],
    ranks: [
      getSpell(talent.SpellRank_1)?.text,
      getSpell(talent.SpellRank_2)?.text,
      getSpell(talent.SpellRank_3)?.text,
    ].filter(Boolean),
  }
  talentById.set(Number(talent.ID), talentData)
  row[index] = talentData
}

for (const talent of talentById.values()) {
  if (!talent.requires) continue
  const req = talentById.get(talent.requires)
  talent.requires = req.index
}
for (const talent of talentById.values()) {
  talent.index = undefined
}

await Deno.writeTextFile('web/talent.json', JSON.stringify(data))
/*

const spellsOverride = await (await fetch('https://gsheet.devazuka.com/11PVL9YA1lmCoqaIguKjwuDFX58e8hzAh6kzDXA4jBV4/SPELL.DBC')).json()
import './launcher/dbc.dbc'

console.log(talents)

// Spell name / description
*/
