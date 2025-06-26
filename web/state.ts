import { Signal } from '@preact/signals'
// import { url } from './router.tsx'
import type { WoWClasses, WoWRaces } from './wow.ts'

// allows switching between local proxy (dev) and production.
const SOURCE_URL = import.meta.env.VITE_API_URL

export const sourceDisconnectedAt = new Signal(Date.now())
const version = new Signal('')
const startAt = new Signal(0)
const setDisconnected = () => {
  startAt.value = 0
  sourceDisconnectedAt.peek() || (sourceDisconnectedAt.value = Date.now())
}

let timeout = setTimeout(setDisconnected, 20_000)
const source = new EventSource(`${SOURCE_URL}/events`)
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

const signalMap = <K, V>() => {
  const version = new Signal(0)
  const map = new Map<K, V>()
  return {
    get: () => (version.value, map),
    from(entries: [K, V][]) {
      map.clear()
      for (const [k, v] of entries) map.set(k, v)
      version.value++
    },
    set(k: K, v: V) {
      map.set(k, v)
      version.value++
    },
    delete(k: K) {
      map.delete(k)
      version.value++
    },
    clear() {
      map.clear()
      version.value = 0
    },
  }
}

const warsongQueue = signalMap<Player['id'], Queue>()
const arenaQueue = signalMap<Player['id'], Queue>()
const players = signalMap<Player['id'], Player & { since: number }>()
const battlegrounds = signalMap<Battleground['id'], Battleground>()

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
    return battlegrounds.get()
  },
  get players() {
    return players.get()
  },
  get warsongQueue() {
    return warsongQueue.get()
  },
  get arenaQueue() {
    return arenaQueue.get()
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
listen('init', (init: {
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
  players.from(Object.entries(init.players || {}).map(toIntEntry))
  arenaQueue.from(Object.entries(init.arenaQueue || {}).map(toIntEntry))
  warsongQueue.from(Object.entries(init.warsongQueue || {}).map(toIntEntry))
  battlegrounds.from(Object.entries(init.battlegrounds || {}).map(toIntEntry))
})

listen('STARTUP', ({ at }: { at: number }) => {
  players.clear()
  arenaQueue.clear()
  warsongQueue.clear()
  battlegrounds.clear()
  startAt.value = at
})

listen('SHUTDOWN', ({ at }: { at: number }) => {
  startAt.value = -at
})

listen('LOGIN', ({ player, at }: { player: Player; at: number }) => {
  players.set(player.id, { ...player, since: at })
})

listen('LOGOUT', ({ id }: { id: Player['id'] }) => {
  players.delete(id)
})

const toQueueEntry = (
  { id, at, source }: { id: Player['id']; at: number; source: number },
) => [id, { at: at + startAt.peek(), source }] as [number, Queue]

listen('QUEUE_STATE', ({ type: bgType, queue }: {
  type: BattlegroundType
  queue: { id: Player['id']; at: number; source: number }[]
}) => {
  if (bgType === 'warsong') {
    warsongQueue.from(queue.map(toQueueEntry))
  } else if (bgType === 'arena') {
    arenaQueue.from(queue.map(toQueueEntry))
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
