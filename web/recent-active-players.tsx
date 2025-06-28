import { Flag, Globe, MapPin, Swords, Users } from 'lucide-preact'

import { Card } from './card.tsx'
import { STATE } from './state.ts'
import type { PlayerWithStatus } from './state.ts'
import { Duration } from './utils.tsx'
import { wowClasses } from './wow.ts'
import { A } from './router.tsx'
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

function PlayerRow({ player }: { player: PlayerWithStatus }) {
  const clsName = classNameById[player.class]
  const clsDef = wowClasses[clsName]
  const statusKey = 'World'
  const [Icon, color] = statusIcons[statusKey] || statusIcons.World
  const mapColor = player.loginAt ? color : 'text-neutral'
  return (
    <tr class='odd:bg-gradient-to-r odd:from-transparent odd:via-[var(--color-base-200)] odd:to-transparent'>
      <td class="pr-2">
        <div class={`h-3 w-3 ${player.loginAt ? 'bg-success' : 'bg-neutral'} rounded-full`} />
      </td>
      <td class='py-1 px-2 flex items-center pb-2 pt-2'>
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
      <td class='py-1 px-2 font-medium'>
        <A
          params={{ player: player.id }}
          class='border-b-2 border-dotted hover:border-solid'
          style={{ borderColor: clsDef.color }}
        >
          {player.name}
        </A>
      </td>
      <td class='py-1 px-2 text-xs opacity-70 text-right font-mono'>
        <Duration duration={player.loginAt || player.logoutAt} />
      </td>
      <td class='py-1 px-2 text-xs uppercase'>
        <div class='flex items-center gap-1'>
          <Icon size={16} class={mapColor} />
          <span class={mapColor}>{statusKey}</span>
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
        {STATE.last10Active
          .map((p) => <PlayerRow player={p} key={p.id} />)}
      </tbody>
    </table>
  </Card>
)
