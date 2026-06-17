import { computed } from '@preact/signals'
import type { JSX } from 'preact'
import talents from './talent.json' with { type: 'json' }
import styles from './class-button.module.css'
import { A, navigate, url } from './router.tsx'
import { setTipData } from './tooltip.tsx'
import { wowClasses } from './wow.ts'

// Custom talent preview

const CLASS_BY_MASK = {
  1: { name: 'Warrior', icon: 'WARRIOR' },
  2: { name: 'Paladin', icon: 'PALADIN' },
  4: { name: 'Hunter', icon: 'HUNTER' },
  8: { name: 'Rogue', icon: 'ROGUE' },
  16: { name: 'Priest', icon: 'PRIEST' },
  64: { name: 'Shaman', icon: 'SHAMAN' },
  128: { name: 'Mage', icon: 'MAGE' },
  256: { name: 'Warlock', icon: 'WARLOCK' },
  1024: { name: 'Druid', icon: 'DRUID' },
  32: { name: 'Death Knight', icon: 'DEATHKNIGHT' },
} as const

const classIds = Object.values(CLASS_BY_MASK).map((v) => v.icon)

type Values<T> = T[keyof T]
type TalentData = typeof talents
type TalentSpecs = Values<TalentData>
type TalentRows = TalentSpecs extends Record<string, infer Rows> ? Rows : never
type TalentRow = TalentRows extends Array<infer Row> ? Row : never
type Spell = TalentRow extends Array<infer Talent> ? NonNullable<Talent> : never
type SpecState = {
  total: number
  talents: number[]
}
type ClassState = {
  total: number
  specs: SpecState[]
}
type TalentState = Record<string, ClassState>

const rawTalentState = computed(() => url.params.talents || '')
const talentState = computed(() => {
  const newState = Object.fromEntries(classIds.map((classId) => [classId, {
    total: 0,
    specs: Array(3).fill(0).map(() => ({
      total: 0,
      talents: Array(7).fill(0),
    })),
  }])) as TalentState
  for (const classes of rawTalentState.value.split('-')) {
    const [classId, specsState] = classes.split('_')
    const classState = newState[classId]
    if (!classState) continue
    const specs = specsState.split('.')
    for (const [specIndex, spec] of specs.entries()) {
      const specState = classState.specs[specIndex]
      if (!specState) continue
      for (const [talentIndexStr, countStr] of Object.entries(spec)) {
        const talentIndex = Number(talentIndexStr)
        if (classState.total > 9) continue
        if (talentIndex > 3 && specState.total < 5) continue
        // TODO: ensure this spell can have this many ranks, max the count to the actual max value
        const count = Number(countStr) || 0
        specState.talents[talentIndex] = count
        specState.total += count
        classState.total = Math.min(classState.total + count, 10)
      }
    }
  }

  return newState
})

const getTalentAtIndex = (rows: TalentRow[], talentIndex: number) =>
  rows[Math.floor(talentIndex / 4)]?.[talentIndex % 4]

const getUnlocksByIndex = (rows: TalentRow[]) => {
  const unlocks = new Map<number, number[]>()
  for (const [rowIndex, row] of rows.entries()) {
    for (const [spellIndex, spell] of row.entries()) {
      if (spell.requires == null) continue
      const requirementIndex = Number(spell.requires)
      const talentIndex = rowIndex * 4 + spellIndex
      unlocks.set(
        requirementIndex,
        [...(unlocks.get(requirementIndex) || []), talentIndex],
      )
    }
  }
  return unlocks
}

const getUnlockMarkerClass = (from: number, to: number) => {
  const fromRow = Math.floor(from / 4)
  const fromColumn = from % 4
  const toRow = Math.floor(to / 4)
  const toColumn = to % 4
  const top = toRow < fromRow
    ? '-top-2'
    : toRow > fromRow
    ? '-bottom-2'
    : 'top-1/2 -translate-y-1/2'
  const left = toColumn < fromColumn
    ? '-left-2.5'
    : toColumn > fromColumn
    ? '-right-2.5'
    : 'left-1/2 -translate-x-1/2'
  const rotation = toRow < fromRow
    ? 'rotate-180'
    : toRow > fromRow
    ? 'rotate-0'
    : toColumn < fromColumn
    ? 'rotate-90'
    : '-rotate-90'

  return `${top} ${left} ${rotation}`
}

const addTalentRank = (
  classId: string,
  specIndex: number,
  talentIndex: number,
  amount: number,
) => {
  const nextState = structuredClone(talentState.value)
  const spec = nextState[classId].specs[specIndex]
  spec.talents[talentIndex] += amount
  spec.total += amount
  nextState[classId].total += amount
  return stringifyTalentState(nextState)
}

const resetClassTalents = (classId: string) => {
  const nextState = structuredClone(talentState.value)
  nextState[classId].total = 0
  nextState[classId].specs = nextState[classId].specs.map(() => ({
    total: 0,
    talents: Array(7).fill(0),
  }))
  return stringifyTalentState(nextState)
}

const stringifyTalentState = (state: TalentState) =>
  Object.entries(state)
    .filter(([, classState]) => classState.total > 0)
    .map(([classId, classState]) => {
      const specs = classState.specs
        .map((spec) => spec.talents.join('').replace(/0+$/, ''))
        .join('.')

      return `${classId}_${specs}`
    })
    .join('-')

const Talent = ({
  spell,
  specIndex,
  classId,
  classState,
  rows,
  talentIndex,
  unlocks,
}: {
  spell: Spell
  specIndex: number
  classId: string
  classState: ClassState
  rows: TalentRow[]
  talentIndex: number
  unlocks: number[]
}) => {
  const spec = classState.specs[specIndex]
  const count = spec.talents[talentIndex]
  const maxRank = count >= spell.ranks.length
  const hasTalentLeft = classState.total < 10
  const requirementIndex = spell.requires != null
    ? Number(spell.requires)
    : null
  const requiredTalent = requirementIndex != null &&
    getTalentAtIndex(rows, requirementIndex)
  const meetRequirement = requirementIndex != null && requiredTalent
    ? spec.talents[requirementIndex] >= requiredTalent.ranks.length
    : true
  const canAdd = hasTalentLeft &&
    (talentIndex < 4 || spec.total >= 5) &&
    meetRequirement &&
    !maxRank
  let borderColor = 'border-zinc-700'
  let arrowColor = 'border-t-zinc-700'
  let color = `${borderColor} saturate-15 opacity-80`
  if (maxRank) {
    borderColor = 'border-warning'
    arrowColor = 'border-t-warning'
    color = borderColor
  } else if (canAdd) {
    borderColor = 'border-primary-content'
    arrowColor = 'border-t-primary-content'
    color = `${borderColor} hover:border-primary`
  } else if (count > 0) {
    borderColor = 'border-primary-content'
    arrowColor = 'border-t-primary-content'
    color = borderColor
  }
  const image = (
    <>
      <img
        src={`/assets/icon/${spell.icon}.jpg`}
        title={spell.name}
        alt={spell.name}
        class='size-full rounded object-cover'
        data-tip='1'
        ref={setTipData({
          title: spell.name,
          icon: spell.icon,
          description: spell.ranks[count] || spell.ranks[0],
        })}
      />
      <span class='pointer-events-none absolute inset-0 rounded shadow-[inset_0_0_2px_1px_black]' />
      <span class='absolute right-0.5 bottom-0.5 rounded-sm bg-black px-0.5 py-px text-xs leading-none font-bold text-white opacity-80 shadow'>
        {count}/{spell.ranks.length}
      </span>
    </>
  )
  const tw =
    `relative z-10 block aspect-square size-16 shrink-0 rounded border-2 bg-base-300 ${color} cursor-default`
  const decrement = (
    e: JSX.TargetedMouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    e.preventDefault()
    count > 0 &&
      navigate({
        params: { talents: addTalentRank(classId, specIndex, talentIndex, -1) },
      })
  }
  const control = canAdd
    ? (
      <A
        class={tw}
        onContextMenu={decrement}
        params={{ talents: addTalentRank(classId, specIndex, talentIndex, 1) }}
      >
        {image}
      </A>
    )
    : (
      <button class={tw} onContextMenu={decrement}>
        {image}
      </button>
    )
  return (
    <span class='group relative block aspect-square size-16 shrink-0'>
      {unlocks.map((unlockIndex) => (
        <span
          class={[
            'pointer-events-none absolute z-0 size-0 border-x-6 border-t-8 border-x-transparent',
            arrowColor,
            canAdd ? 'group-hover:border-t-primary' : '',
            getUnlockMarkerClass(talentIndex, unlockIndex),
          ].join(' ')}
        />
      ))}
      {control}
    </span>
  )
}

export const Talents = () => {
  const state = talentState.value
  return (
    <section class='mx-auto flex w-fit max-w-full select-none flex-col gap-5 px-3 py-5 sm:px-5'>
      {Object.entries(talents).map(([classMask, specs]) => {
        const wowClass =
          CLASS_BY_MASK[Number(classMask) as keyof typeof CLASS_BY_MASK] ||
          CLASS_BY_MASK[1]
        const classColor = wowClasses[wowClass.icon]?.color
        const classState = state[wowClass.icon]
        return (
          <section class='mx-auto w-fit max-w-full rounded-lg border border-base-300 bg-base-100/70 shadow-lg shadow-black/20'>
            <header class='relative flex items-center gap-3 border-b border-base-300 bg-base-200/70 px-3 py-0.5'>
              <span
                class={[
                  styles.classIcon,
                  styles[wowClass.icon],
                  'block size-9 shrink-0 translate-y-2 rounded-full outline-2 outline-offset-1 outline-current',
                ].join(' ')}
                style={{ color: classColor }}
              />
              <h2
                class='text-lg font-bold leading-tight'
                style={{ color: classColor }}
              >
                {wowClass.name}
              </h2>
              {classState.total > 0 && (
                <A
                  class='ml-auto inline-flex h-5 items-center gap-1 px-1 text-xs leading-none text-base-content/70 hover:text-error'
                  params={{
                    talents: resetClassTalents(wowClass.icon) || null,
                  }}
                >
                  <span class='inline-flex size-4 items-center justify-center text-2xl leading-none font-bold text-error'>
                    ×
                  </span>
                  <span>Reset</span>
                </A>
              )}
            </header>

            <div class='mx-auto grid w-fit max-w-full gap-3 p-3 pt-4 lg:grid-cols-3'>
              {Object.entries(specs).map(([specName, rows], specIndex) => {
                const unlocksByIndex = getUnlocksByIndex(rows)
                return (
                  <section class='min-w-0 rounded-md border border-base-300 bg-base-200/40'>
                    <h3
                      class='border-b border-base-300 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide'
                      style={{ color: classColor }}
                    >
                      {specName}
                    </h3>

                    <div class='flex w-fit max-w-full flex-col gap-3 p-3'>
                      {rows.map((row, rowIndex) => (
                        <div class='grid w-fit grid-cols-4 gap-3'>
                          {row.map((spell, spellIndex) => {
                            const talentIndex = rowIndex * 4 + spellIndex
                            return (
                              <Talent
                                spell={spell}
                                specIndex={specIndex}
                                classId={wowClass.icon}
                                classState={classState}
                                rows={rows}
                                talentIndex={talentIndex}
                                unlocks={unlocksByIndex.get(talentIndex) ||
                                  []}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </section>
        )
      })}
    </section>
  )
}
