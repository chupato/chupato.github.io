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
/*
type GameEventHandler<T> = (data: GameEvent<T>) => void | Promise<void>
type GameEventRegister<T> = 
*/