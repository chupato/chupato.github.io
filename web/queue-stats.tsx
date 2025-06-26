import { Flag, Hourglass, Swords } from 'lucide-preact'
import { Card } from './card.tsx'
import { STATE } from './state.ts'
import { rtfFormat } from './utils.ts'

const queueAvgWait = (queue: Map<number, { at: number }>) => {
  const totalTime = queue
    .values()
    .reduce((sum, { at }) => sum + (STATE.now - at), 0)
  return totalTime && Math.floor(totalTime / queue.size)
}

export function QueueStats() {
  const { warsongQueue, arenaQueue } = STATE
  return (
    <Card>
      <Card.Title>
        <Hourglass size={20} /> Queue Status
      </Card.Title>
      <div class='flex items-center justify-evenly p-2'>
        <div class='flex flex-col items-center text-warning'>
          <div class='flex items-center gap-1'>
            <Flag size={20} />
            <span class='font-semibold text-xl'>Warsong</span>
          </div>
          <div class='text-center'>
            <div class='stat-value text-6xl'>{warsongQueue.size}</div>
            <div class='stat-desc text-sm font-mono'>
              {rtfFormat(-queueAvgWait(warsongQueue))}
            </div>
          </div>
        </div>
        <div class='divider divider-horizontal' />
        <div class='flex flex-col items-center text-info'>
          <div class='flex items-center gap-1'>
            <Swords size={20} />
            <span class='font-semibold text-xl'>3v3</span>
          </div>
          <div class='text-center'>
            <div class='stat-value text-6xl'>{arenaQueue.size}</div>
            <div class='stat-desc text-sm font-mono'>
              {rtfFormat(-queueAvgWait(arenaQueue))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
