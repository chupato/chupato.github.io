import { Flag, Globe, MapPin, Swords, Users } from 'lucide-preact'
import { Card } from './card.tsx'
import { STATE } from './state.ts'
import type { Player } from './state.ts'
import { rtfFormat } from './utils.ts'
import { wowClasses } from './wow.ts'
import styles from './class-button.module.css'

const classNameById = Object.fromEntries(
  Object.entries(wowClasses).map(([name, cls]) => [cls.id, name]),
) as Record<number, keyof typeof wowClasses>

const statusIcons = {
  Gurubashi: [MapPin, 'text-error'],
  Dungeons: [Users, 'text-primary'],
  Warsong: [Flag, 'text-warning'],
  Arena: [Swords, 'text-info'],
  World: [Globe, 'text-success'],
} as const

function PlayerRow({ player }: { player: Player & { since: number } }) {
  const clsName = classNameById[player.class]
  const clsDef = wowClasses[clsName]
  const lastActive = rtfFormat(STATE.now - player.since)
  const statusKey = 'World'
  const [Icon, color] = statusIcons[statusKey] || statusIcons.World
  return (
    <tr class='border-b border-base-200'>
      <td class='py-1 px-2'>
        <span
          role='img'
          aria-label={clsName}
          class={`${styles.classButton} ${
            styles[clsName]
          } inline-block w-6 h-6 rounded-full`}
          style={{
            outline: `2px solid ${clsDef.color}`,
            outlineOffset: '2px',
          }}
        />
      </td>
      <td class='py-1 px-2 font-medium'>{player.name}</td>
      <td class='py-1 px-2 text-xs opacity-70 text-right font-mono'>{lastActive}</td>
      <td class='py-1 px-2 text-xs uppercase'>
        <div class='flex items-center gap-1'>
          <Icon size={16} class={color} />
          <span class={color}>{statusKey}</span>
        </div>
      </td>
    </tr>
  )
}

export const RecentActivePlayers = () => (
  <Card>
    <Card.Title>
      <Users size={20} /> Recent Active Players
    </Card.Title>
    <table class='table-auto w-full border-collapse'>
      <tbody>
        {STATE.players.values().toArray()
          .sort((a, b) => b.since - a.since)
          .slice(0, 10)
          .map((p) => <PlayerRow player={p} key={p.id} />)}
      </tbody>
    </table>
  </Card>
)
