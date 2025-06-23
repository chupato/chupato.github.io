import { effect, Signal } from '@preact/signals'
import { url } from './router.tsx'

const SOURCE_URL = 'https://wow.devazuka.com'

export const sourceDisconnectedAt = new Signal(Date.now())

const source = new EventSource(sourceUrl)
const setDisconnected = () =>
  sourceDisconnectedAt.peek() || (sourceDisconnectedAt.value = Date.now())

const STATE = {}
source.addEventListener('init', (event) => {
  const init = JSON.parse(event.data) as InitData
  console.log('server state initialized', init)
  Object.assign(STATE, init)
})

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

// type GameEvent<Type, Data> =

// emit('SHUTDOWN', { at: Date.now() })
// emit('LOGIN', { player, at })
// emit('LOGOUT', { id: player.id })
// emit('STARTUP', { at })
// emit('SHUTDOWN', { at })
// emit('QUEUE_STATE', { type, arena, queue })
// emit('BATTLEGROUND_JOIN', { playerId, id, team, at })
// emit('BATTLEGROUND_LEAVE', { player, id })
// emit('BATTLEGROUND_START', { id, type, start: at })
// emit('BATTLEGROUND_END', { id })
