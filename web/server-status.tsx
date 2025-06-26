import { h } from 'preact'
import { CheckCircle, RefreshCcw, Server, XCircle } from 'lucide-preact'
import { Card } from './card.tsx'
import { STATE } from './state.ts'
import { rtfFormat } from './utils.ts'

const serverStates = {
  online: [CheckCircle, 'text-success', ''],
  offline: [XCircle, 'text-error', ''],
  pending: [
    RefreshCcw,
    'text-warning',
    'animate-[spin_4s_linear_infinite_reverse]',
  ],
} as const

export function ServerStatus() {
  const { startAt, players } = STATE
  const state = (!startAt && 'pending') ||
    (startAt > 0 ? 'online' : 'offline')
  const [Icon, color, iconAnim] = serverStates[state]
  const wrapperAnim = state !== 'pending' ? 'animate-fade-in' : ''
  return (
    <Card>
      <Card.Title>
        <Server size={20} /> Server Status
      </Card.Title>
      <div class='flex items-center justify-evenly p-3'>
        <div key={state} class={`space-y-2 ${wrapperAnim}`}>
          <div class='flex items-center gap-2'>
            <Icon size={20} class={`${color} ${iconAnim}`} />
            <span class={`${color} text-lg capitalize`}>
              {state}
            </span>
          </div>
          <div
            class={`stat-value font-semibold text-center ${color} font-mono`}
          >
            {state === 'pending'
              ? (
                <button
                  type='button'
                  class='btn btn-outline btn-sm'
                  onClick={location.reload}
                >
                  Reload
                </button>
              )
              : rtfFormat(STATE.now - Math.abs(startAt))}
          </div>
        </div>
        <div class='divider divider-horizontal' />
        <div class='flex items-center justify-center flex-col text-secondary'>
          <span class='font-semibold opacity-70'>Active Players</span>
          <span class='text-6xl font-bold'>{players.size}</span>
        </div>
      </div>
    </Card>
  )
}
