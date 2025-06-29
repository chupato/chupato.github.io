import {
  Flag,
  Globe,
  MapPin,
  Maximize,
  Minimize,
  PowerOff,
  Swords,
  Users,
} from 'lucide-preact'

import { Card } from './card.tsx'
import { STATE } from './state.ts'
import type { PlayerWithStatus } from './state.ts'
import { Duration } from './utils.tsx'
import { wowClasses } from './wow.ts'
import { A, url } from './router.tsx'
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
  Offline: [PowerOff, 'text-neutral'],
} as const

function PlayerRow({ player }: { player: PlayerWithStatus }) {
  const clsName = classNameById[player.class]
  const clsDef = wowClasses[clsName]
  const statusKey = player.loginAt ? player.location : 'Offline'
  const [Icon, color] = statusIcons[statusKey]
  return (
    <tr
      class='odd:bg-gradient-to-r odd:from-transparent odd:via-[var(--color-base-200)] odd:to-transparent'
      style={{ viewTransitionName: `player-row-${player.id}` }}
    >
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
            viewTransitionName: `class-icon-${player.id}`,
          }}
        />
      </td>
      <td class='py-1 px-2 font-medium'>
        <A
          params={{ player: player.id }}
          class='border-b-2 border-dotted hover:border-solid'
          style={{
            borderColor: clsDef.color,
            viewTransitionName: `name-${player.id}`,
          }}
        >
          {player.name}
        </A>
      </td>
      <td class='py-1 px-2 text-xs opacity-70 text-right font-mono'>
        <Duration duration={player.loginAt || player.logoutAt} />
      </td>
      <td class='py-1 px-2 text-xs uppercase'>
        <div
          class='flex items-center gap-1'
          style={{ viewTransitionName: `map-${player.id}` }}
        >
          <Icon size={16} class={color} />
          <span class={color}>{statusKey}</span>
        </div>
      </td>
    </tr>
  )
}

export const RecentActivePlayers = () => {
  const isFullScreen = url.params.card === 'active-players'

  const toggleFullScreenParams = isFullScreen
    ? { card: null }
    : { card: 'active-players' }

  return (
    <Card
      class={isFullScreen ? 'full-screen-card' : ''}
      style={{ viewTransitionName: 'active-players-card' }}
    >
      <Card.Title style={{ viewTransitionName: 'active-players-title' }}>
        <Users
          size={20}
          style={{ viewTransitionName: 'active-players-title-icon' }}
        />{' '}
        <span style={{ viewTransitionName: 'active-players-title-text' }}>
          Recent Active Players
        </span>
        <A
          params={toggleFullScreenParams}
          class='btn btn-sm btn-ghost'
          style={{ viewTransitionName: 'active-players-title-link' }}
        >
          {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </A>
      </Card.Title>
      <table class='table-auto w-full border-collapse'>
        <tbody>
          {STATE.last10Active.map((p) => (
            <PlayerRow player={p} key={p.id} />
          ))}
        </tbody>
      </table>
    </Card>
  )
}
