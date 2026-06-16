import { computed } from '@preact/signals'
import type { JSX } from 'preact'
import talents from './talent.json' with { type: 'json' }
import styles from './class-button.module.css'
import { A, navigate, url } from './router.tsx'

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

const getRequirementMarkerClass = (from: number, to: number) => {
  const fromRow = Math.floor(from / 4)
  const fromColumn = from % 4
  const toRow = Math.floor(to / 4)
  const toColumn = to % 4
  const top = toRow < fromRow
    ? '-top-3'
    : toRow > fromRow
    ? '-bottom-3'
    : 'top-1/2 -translate-y-1/2'
  const left = toColumn < fromColumn
    ? '-left-3.5'
    : toColumn > fromColumn
    ? '-right-3.5'
    : 'left-1/2 -translate-x-1/2'
  const rotation = toRow < fromRow
    ? 'rotate-0'
    : toRow > fromRow
    ? 'rotate-180'
    : toColumn < fromColumn
    ? '-rotate-90'
    : 'rotate-90'

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

  return Object.entries(nextState)
    .filter(([, classState]) => classState.total > 0)
    .map(([classId, classState]) => {
      const specs = classState.specs
        .map((spec) => spec.talents.join('').replace(/0+$/, ''))
        .join('.')

      return `${classId}_${specs}`
    })
    .join('-')
}

const Talent = ({
  spell,
  specIndex,
  classId,
  classState,
  rows,
  talentIndex,
}: {
  spell: Spell
  specIndex: number
  classId: string
  classState: ClassState
  rows: TalentRow[]
  talentIndex: number
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
  let color = 'border-zinc-700 saturate-15 opacity-80'
  if (maxRank) {
    color = 'border-warning'
  } else if (canAdd) {
    color = 'border-primary-content hover:border-primary'
  } else if (count > 0) {
    color = 'border-primary-content'
  }
  const image = (
    <>
      <img
        src={`/assets/icon/${spell.icon}.jpg`}
        title={spell.name}
        alt={spell.name}
        class='size-full rounded object-cover'
      />
      <span class='pointer-events-none absolute inset-0 rounded shadow-[inset_0_0_2px_1px_black]' />
      <span class='absolute -right-1.5 -bottom-1.5 rounded-full bg-black px-1.5 py-0.5 text-xs leading-none font-bold text-white opacity-80 shadow'>
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
    <span class='relative block aspect-square size-16 shrink-0'>
      {requirementIndex != null && (
        <span
          class={[
            'pointer-events-none absolute z-0 size-0 border-x-6 border-t-8 border-x-transparent',
            meetRequirement ? 'border-t-warning' : 'border-t-zinc-500',
            getRequirementMarkerClass(talentIndex, requirementIndex),
          ].join(' ')}
        />
      )}
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
        const classState = state[wowClass.icon]
        return (
          <section class='mx-auto w-fit max-w-full rounded-lg border border-base-300 bg-base-100/70 shadow-lg shadow-black/20'>
            <header class='flex items-center gap-3 border-b border-base-300 bg-base-200/70 px-3 py-2'>
              <span
                class={[
                  styles.classButton,
                  styles[wowClass.icon],
                  'block size-9 shrink-0 rounded border border-base-content/30',
                ].join(' ')}
              />
              <h2 class='text-lg font-bold leading-tight text-base-content'>
                {wowClass.name}
              </h2>
            </header>

            <div class='mx-auto grid w-fit max-w-full gap-3 p-3 lg:grid-cols-3'>
              {Object.entries(specs).map(([specName, rows], specIndex) => (
                <section class='min-w-0 rounded-md border border-base-300 bg-base-200/40'>
                  <h3 class='border-b border-base-300 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary'>
                    {specName}
                  </h3>

                  <div class='flex w-fit max-w-full flex-col gap-3 p-3'>
                    {rows.map((row, rowIndex) => (
                      <div class='grid w-fit grid-cols-4 gap-3'>
                        {row.map((spell, spellIndex) => (
                          <Talent
                            spell={spell}
                            specIndex={specIndex}
                            classId={wowClass.icon}
                            classState={classState}
                            rows={rows}
                            talentIndex={rowIndex * 4 + spellIndex}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )
      })}
    </section>
  )
}
