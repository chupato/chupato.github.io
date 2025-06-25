import { effect, Signal } from '@preact/signals'
import { url } from './router.tsx'
import type { WoWClasses, WoWRaces } from './wow.ts'

const SOURCE_URL = 'https://wow.devazuka.com'

export const sourceDisconnectedAt = new Signal(Date.now())

const source = new EventSource(sourceUrl)
const setDisconnected = () => {
  startAt.value = 0
  sourceDisconnectedAt.peek() || (sourceDisconnectedAt.value = Date.now())
}

export const version = new Signal('')
export const startAt = new Signal(0)

let timeout = setTimeout(setDisconnected, 20_000)
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

type Player = {
  id: number
  name: string
  account: number
  class: WoWClasses[keyof WoWClasses]['id']
  race: WoWRaces[keyof WoWRaces]
}

type BattlegroundType = 'arena' | 'warsong'
type Battleground = {
  id: number
  type: BattlegroundType
  participants: Map<Player['id'], { at: number; team: number }>
}

type Queue = {
  at: number
  source: Player['id'] // leader of the group
}

type Queues = Map<Player['id'], Queue>

export const warsongQueue = new Signal<Queue[]>()
export const arenaQueue = new Signal<Queue[]>()
export const players = new Signal<Map<Player['id'], Player>>()
export const battlegrounds = new Map<Battleground['id'], Battleground>()

const listen = (type: string, handler: (data: any) => void) => {
  source.addEventListener(type, (event) => {
    handler(JSON.parse(event.data))
  })
}

listen('INIT', (data: {
  version: string
  startAt: number
  players: Record<number, Player>
  arenaQueue: Record<number, Queue>
  warsongQueue: Record<number, Queue>
  battlegrounds: Record<number, Battleground>
}) => {

  console.log('server state initialized', init)
  version.value = init.version
  startAt.value = init.startAt
  const toIntEntry = ([k, v]) => [Number(k), v]
  players.value = new Map(Object.entries(init.players).map(toIntEntry))
  arenaQueue.value = new Map(Object.entries(init.arenaQueue).map(toIntEntry))
  warsongQueue.value = new Map(Object.entries(init.warsongQueue).map(toIntEntry))
  battlegrounds.value = new Map(Object.entries(init.battlegrounds).map(toIntEntry))
})

listen('SHUTDOWN', ({ at }: { at: number }) => {
  //
})

listen('LOGIN', ({ player, at }: { player: Player; at: number }) => {
  //
})

listen('LOGOUT', ({ id }: { id: Player['id'] }) => {
  //
})

listen('STARTUP', ({ at }: { at: number }) => {
  //
})

listen('SHUTDOWN', ({ at }: { at: number }) => {
  //
})

listen('QUEUE_STATE', ({ type, queue }: {
  type: BattlegroundType
  queue: { id: Player['id']; at: number; source: number }[]
}) => {
  //
})

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
