import { Signal } from '@preact/signals'
// import { url } from './router.tsx'
import type { WoWClasses, WoWRaces } from './wow.ts'

const SOURCE_URL = 'https://wow.devazuka.com'

export const sourceDisconnectedAt = new Signal(Date.now())
const version = new Signal('')
const startAt = new Signal(0)
const setDisconnected = () => {
  startAt.value = 0
  sourceDisconnectedAt.peek() || (sourceDisconnectedAt.value = Date.now())
}

let timeout = setTimeout(setDisconnected, 20_000)
const source = new EventSource(SOURCE_URL)
source.addEventListener('ack', () => {
  sourceDisconnectedAt.peek() && (sourceDisconnectedAt.value = 0)
  clearTimeout(timeout)
  timeout = setTimeout(setDisconnected, 20_000)
})

source.addEventListener('error', setDisconnected)
source.addEventListener('open', () => {
  sourceDisconnectedAt.value = 0
})

setDisconnected()

export type Player = {
  id: number
  name: string
  account: number
  class: WoWClasses[keyof WoWClasses]['id']
  race: WoWRaces[keyof WoWRaces]
}

export type Queue = { at: number; source: Player['id'] }
export type BattlegroundType = 'arena' | 'warsong'
export type Battleground = {
  id: number
  type: BattlegroundType
  participants: Map<Player['id'], { at: number; team: number }>
}

let warsongQueue = new Map<Player['id'], Queue>()
const warsongQueueVersion = new Signal(0)
let arenaQueue = new Map<Player['id'], Queue>()
const arenaQueueVersion = new Signal(0)
let players = new Map<Player['id'], Player & { since: number }>()
const playersVersion = new Signal(0)
let battlegrounds = new Map<Battleground['id'], Battleground>()
const battlegroundsVersion = new Signal(0)

const now = new Signal(Date.now())
setInterval(() => now.value = Date.now(), 990) // update at least once per second

export const STATE = {
  get version() {
    return version.value
  },
  get startAt() {
    return startAt.value
  },
  get battlegrounds() {
    battlegroundsVersion.value
    return battlegrounds
  },
  get players() {
    playersVersion.value
    return players
  },
  get warsongQueue() {
    warsongQueueVersion.value
    return warsongQueue
  },
  get arenaQueue() {
    arenaQueueVersion.value
    return arenaQueue
  },
  get now() {
    return now.value
  },
}

const listen = <T>(type: string, handler: (data: T) => void) => {
  source.addEventListener(type, (event) => {
    handler(JSON.parse(event.data))
  })
}

const toIntEntry = <T>([k, v]: [string, T]) => [Number(k), v] as [number, T]
listen('INIT', (init: {
  version: string
  startAt: number
  players: { [k: string]: Player & { since: number } }
  arenaQueue: { [k: string]: Queue }
  warsongQueue: { [k: string]: Queue }
  battlegrounds: { [k: string]: Battleground }
}) => {
  console.log('server state initialized', init)
  version.value = init.version
  startAt.value = init.startAt
  players = new Map(Object.entries(init.players).map(toIntEntry))
  playersVersion.value++
  arenaQueue = new Map(Object.entries(init.arenaQueue).map(toIntEntry))
  arenaQueueVersion.value++
  warsongQueue = new Map(Object.entries(init.warsongQueue).map(toIntEntry))
  warsongQueueVersion.value++
  battlegrounds = new Map(Object.entries(init.battlegrounds).map(toIntEntry))
  battlegroundsVersion.value++
})

listen('STARTUP', ({ at }: { at: number }) => {
  startAt.value = at
})

listen('SHUTDOWN', ({ at }: { at: number }) => {
  startAt.value = -at
})

listen('LOGIN', ({ player, at }: { player: Player; at: number }) => {
  players.set(player.id, { ...player, since: at })
  playersVersion.value++
})

listen('LOGOUT', ({ id }: { id: Player['id'] }) => {
  players.delete(id)
  playersVersion.value++
})

const toQueueEntry = (
  { id, at, source }: { id: Player['id']; at: number; source: number },
) => [id, { at, source }] as [number, Queue]

listen('QUEUE_STATE', ({ type: bgType, queue }: {
  type: BattlegroundType
  queue: { id: Player['id']; at: number; source: number }[]
}) => {
  if (bgType === 'warsong') {
    warsongQueue = new Map(queue.map(toQueueEntry))
    warsongQueueVersion.value++
  } else if (bgType === 'arena') {
    arenaQueue = new Map(queue.map(toQueueEntry))
    arenaQueueVersion.value++
  } else {
    // Should not happen
    bgType satisfies never
  }
})
/*
// Not implemented yet
listen('BATTLEGROUND_JOIN', ({ playerId, id, team, at }: {
  playerId: Player['id']
  id: number
  team: number
  at: number
}) => {
  // yo
})

listen(
  'BATTLEGROUND_LEAVE',
  ({ player, id }: { player: Player; id: number }) => {
  },
)

listen('BATTLEGROUND_START', ({ id, type, start }: {
  id: Battleground['id']
  type: BattlegroundType
  start: number
}) => {
  //
})

listen('BATTLEGROUND_END', ({ id }: { id: Battleground['id'] }) => {
})
*/
