import { Fragment, h, render } from 'preact'
import {
  CheckCircle,
  CloudDownload,
  Flag,
  Globe,
  Hourglass,
  Info,
  Link,
  Map,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Server,
  Settings,
  Swords,
  Users,
  XCircle,
} from 'lucide-preact'
import logoUrl from './logo.avif'
import bgUrl from './background.avif'
import chupatoSoundUrl from './chupato-cute.ogg'

import styles from './class-button.module.css'
import { wowClasses } from './wow.ts'
import { Card } from './card.tsx'

Object.assign(globalThis, { h, Fragment })

const audioContext = new AudioContext()
const audioBuffer = fetch(chupatoSoundUrl)
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))

const timings = [
  0, // Challenge
  0.92, // Heroes
  1.62, // Ultimate
  2.432, // Private
  2.95, // Adventure
  3.65, // Twink
  4.15, // Online
  4.7, // Chupato
]

const play = async (...args) => {
  const source = audioContext.createBufferSource()
  source.buffer = await audioBuffer
  source.connect(audioContext.destination)
  source.start(0, ...args)
}

const mockPlayers = [
  {
    id: '1',
    name: 'Alice',
    cls: 'Paladin',
    lastActive: '2m ago',
    status: 'World',
  },
  {
    id: '2',
    name: 'Bob',
    cls: 'Warrior',
    lastActive: '5m ago',
    status: 'Warsong',
  },
  {
    id: '3',
    name: 'Carolina',
    cls: 'Druid',
    lastActive: '7m ago',
    status: 'Dungeon',
  },
  {
    id: '4',
    name: 'Darius',
    cls: 'Hunter',
    lastActive: '10m ago',
    status: 'Gurubashi',
  },
  {
    id: '5',
    name: 'Eliza',
    cls: 'Mage',
    lastActive: '12m ago',
    status: 'Warsong',
  },
  {
    id: '6',
    name: 'Frodo',
    cls: 'Warlock',
    lastActive: '15m ago',
    status: 'Arena',
  },
  {
    id: '7',
    name: 'Gandalf',
    cls: 'Priest',
    lastActive: '18m ago',
    status: 'World',
  },
  {
    id: '8',
    name: 'Hermione',
    cls: 'Mage',
    lastActive: '20m ago',
    status: 'Warsong',
  },
  {
    id: '9',
    name: 'Icarus',
    cls: 'Rogue',
    lastActive: '22m ago',
    status: 'Arena',
  },
  {
    id: '10',
    name: 'Jaina',
    cls: 'Mage',
    lastActive: '25m ago',
    status: 'World',
  },
]

const mockWarsongCount = 11
const mockWarsongAvgWait = '2m 15s'
const mockArena3v3Count = 2
const mockArena3v3AvgWait = '4m 30s'
// current server connection status
const mockServerState: 'online' | 'pending' | 'offline' = 'online'
// positive = online since that timestamp; negative = offline since abs(timestamp)
const mockServerSince = Date.now() - 5 * 60 * 1000

type Player = typeof mockPlayers[number]

const statusIcons = {
  Warsong: { icon: Flag, color: 'text-warning' },
  Arena: { icon: Swords, color: 'text-info' },
  Gurubashi: { icon: MapPin, color: 'text-error' },
  Dungeons: { icon: Map, color: 'text-primary' },
  World: { icon: Globe, color: 'text-success' },
} as const

const serverStatusIcons = {
  online:  { icon: CheckCircle, color: 'text-success' },
  pending: { icon: RefreshCcw,  color: 'text-warning' },
  offline: { icon: XCircle,     color: 'text-error' },
} as const

function PlayerRow({ player }: { player: Player }) {
  const def = statusIcons[player.status] ?? statusIcons.World
  const Icon = def.icon
  const color = def.color
  return (
    <tr class='border-b border-base-200'>
      <td class='py-1 px-2'>
        <span
          role='img'
          aria-label={player.cls}
          class={`${styles.classButton} ${
            styles[player.cls.toUpperCase()]
          } inline-block w-6 h-6 rounded-full`}
          style={{
            outline: `2px solid ${wowClasses[player.cls.toUpperCase()].color}`,
            outlineOffset: '2px',
          }}
        />
      </td>
      <td class='py-1 px-2 font-medium'>{player.name}</td>
      <td class='py-1 px-2 text-xs opacity-70 text-right'>{player.lastActive}</td>
      <td class='py-1 px-2 text-xs uppercase'>
        <div class='flex items-center gap-1'>
          <Icon size={16} class={color} />
          <span class={color}>{player.status}</span>
        </div>
      </td>
    </tr>
  )
}

function App() {
  // compute server status
  const online = mockServerSince > 0
  const pending = mockServerState === 'pending'
  const offline = mockServerState === 'offline'
  const sinceMs = online
    ? Date.now() - mockServerSince
    : Date.now() + mockServerSince
  const serverState = online ? 'online' : pending ? 'pending' : 'offline'
  const serverDef = serverStatusIcons[serverState]
  const ServerIcon = serverDef.icon
  const serverColor = serverDef.color
  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const ss = s % 60
    const mm = m % 60
    return `${h}h ${mm}m ${ss}s`
  }
  return (
    <div class='p-4 pt-20 pb-20 space-y-6 bg-base-200 min-h-screen'>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter
            id='text-outline'
            x='-50%'
            y='-50%'
            width='200%'
            height='200%'
          >
            <feMorphology
              in='SourceAlpha'
              operator='dilate'
              radius='20' 
              result='thicken'
            />
            <feFlood floodColor='black' result='outline' />
            <feComposite
              in='outline'
              in2='thicken'
              operator='in'
              result='outline'
            />
            <feComposite in='SourceGraphic' in2='outline' operator='over' />
          </filter>
        </defs>
      </svg>
      <div
        class='relative z-0 h-50 lg:h-90 bg-cover bg-center rounded-lg overflow-visible py-40 mx-auto lg:ml-20 lg:mr-20'
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div class='absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-base-200 to-transparent pointer-events-none' />
        <img
          src={logoUrl}
          alt='CHUPATO Logo'
          onClick={() => play()}
          class='absolute h-70 min-w-93 top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 cursor-pointer hover:wiggle'
        />
        <p class='text-center text-sm text-success drop-shadow-sm filter-outline-lg'>
          Challenge Heroes Ultimate Private Arena Twink Online
        </p>
        <svg
          class='absolute top-26 left-1/2 -translate-x-1/2 w-200 -z-10'
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          viewBox='0 0 497.4 99.9'
        >
          <path
            fill='#000B'
            d='M331 19h-9 9zm-40 2h4-4zM9 12c-4-2-7-1-9 4 0 3 0 5 3 7 4 4 9 3 10-2 2-4 1-7-4-9zm30-8c-1 0-2 3 0 4 1 2 3 1 3-1 1-2 1-2-1-3h-2zM28 36v-1l-1-1v1l1 1zm22 64c1-1 2-2 1-3l-2-1c-2 2-1 5 1 4M33 0c0 2 2 3 2 1m462 17v1m0 6v-1 1zm-2 4h1c0 1 0 0 0 0v-1l-1 1zm-1-2c1 1 2-1 1-3-1-1-1 0-1 1v2zm-11-2c-2 2 0 5 1 4 2-1 2-2 1-4h-2zm-13 1v1-1zm-4 6-1 1h1v-1zm-1 3 1-1-1 1zm6 10c-1 0-2-2-4-1h-1v-1h1l-1-1h-2l-1 1h-2l-4-1h-2l-2-1h-2c0-1 0 0 0 0l-1-1v2-1h-1v-1l-1 1-1-1-2-2h-9l1-1h5l2 1h3l-1-2h-5l-2-1-1 1-2-1h1l2-1h1l-1-1-2-1h-2l-5-1h-5l-1-1h-8l-4-1h-7v-1l-2 1h-7l-2-1-6 1h-16l-1-1h1-2c0 1 0 0 0 0l-2-1-1 1h-9l-1-1-1 1h-12l-8 1h-34l-2 1-1-1-2 1h-3v-1h-40l-10-1-5 1h-31l-6-1-5 1-1-1h-1l-2 1v-1h-1l-2 1h-4l-3-2-2 1-3 1h-11v1h-21l-1 1-2-2 1-2c0-1 0 0 0 0h-4v1h-2l-2-1h-1l-2 1-3 1-1-1h-1l-1 1h-2v-1h-2l-1 1v-1h-5l-3 1h2l1 1h-6v1h-4l-5 1h-7l-8 1h-2v-1l-1 1-1-1h-2l-1 1h-1l-5-1-5 1h-8l-2 1-3 1-1 1h-3c-2 0-2 0-1-1h2-3l-4 3-3 1-4 1-5 1-3 1h-2v-2l-3-1c-2 1-1 4 1 5l-1 1-3 2-3 3-1 1-1 2 1 2 2 1v3l-2 1-2 4v1l-1 3v3l1 1c1 1 0 0 0 0l2 1h1l1 1h1l3-1 3 1h1l-1 3-3 1-2 1h-2l-2 1 1 3 2 1h6l-1 1v1h3l2-1h2l2-2h5l5-1h6l4-1h2l1 1v-1h2l-1 1c-2 2-1 3 3 6 2 2 3 2 3 0 1-2 0-6-2-7h25l1-1 2 1h23l1-1h18l1-1 2 1 1-1h21l4-1h12v1h4l2-1h8l2-1 1 1 1-1h1l1 1h3c1 0 0 0 0 0l1-1 1 1 2 1 2-1h4-1v-1l-1-1-1 1-2-1h-2l-2-1 1 1h12l4-1 1 1h9l1 1 2-1h1l2 1h9l9 1h15l2 1h6l6-1 6 1h7l3-1 1 1h2l1-1 2 1 2-1h1l1 1h6l6-1h12l3-1h8l4-1h4l1-1h15v-1h10l4-1h4l3-1h16l1-1s1 0 0 0h-25l-2 1h-1l-2-1h-2l-5 1h-1l-1 1-2-1h-1l-2 1h-2l-5 1h-3l-1-1-6 1h-5l-4 1h-24l1-1 2 1v-1l1-1 3 1 2-1h1l1-1 3 1 2 1h5l1-1h1l3 1 2-1h2l1-1h3l3-1h8l2 1h1l3-1h5l1-1 3 1v-1h3l2-1h14l1-1 2 1 6-1h15l3-1 1 1h9l6 1h1-1v1h-1 1l2-1 1 1h3l1 1 1-1 2 1 2-1h-3l-2-1-3-1 1-1h5l2 1 2-1v-1h1v1h3l2-1h12l2-1v-1h-2l-4-1h-4l-2 1h-2l-2-1h-8l-3-2h-9l-3-1h-5l1 1h-1v1l-3 1h-2v-1h5l-1-1v-1h-2l-1-1h3l1-1h1v1h6l1-1 1-2 1 1h8v-1h-2l-2-1-3 1v-1l-1 1h-1l-3-1-3 1-11-1-1 1-1-1h-4l-6-1-1 1-2-1-1 1h-3l-1-1v2h2v1h1l1-1v1h1v-1 1l-6 1-2-1h1l1-1h-2v-1h1v-1h-1l-1-1-2 1h-3v1h4v2h1l-1 1h-9l-1 1-1-1h-1l-2 1-3-1 2-1h1l-1-1-2 1h-1l-1-1h5l1 1h1v-1h1v1h2l-1-1v-1l-1-1h-5l3-1 2 1c1 1 2-1 2-1l2-1h4l2-1h14l1 1 2-1h7l1-1 2 1h4l-1-2h-1l-2-1c0-1-1 0 0 0h5l12-1h3v-1h4l1-1c0-1 0 0 0 0h-2 4l2-1v1h-1l1 1 1-1h10l3-1h1l3-1h3l2 1h1l1-1 3 1 1-1v2z'
          />
        </svg>
        <h1 class='text-center text-3xl font-bold text-warning filter-outline-lg flex items-center justify-center gap-2'>
          The Ultimate WoW 19 Twink Experience
        </h1>
      </div>

      <div class='relative z-10 -mt-2 lg:-mt-32 flex flex-col lg:flex-row gap-6'>
        <aside class='lg:w-80 flex-shrink-0 space-y-4'>
          <Card>
            <Card.Title>
              <Server size={20} /> Server Status
            </Card.Title>
            <div class='flex items-center justify-evenly p-3'>
              <div class='space-y-2'>
                <div class='flex items-center gap-2'>
                  <ServerIcon size={20} class={serverColor} />
                  <span class={`${serverColor} text-lg capitalize`}>{serverState}</span>
                </div>
                <div class='flex items-center gap-2'>
                  <span class={`stat-value font-semibold ${serverColor}`}>{fmt(sinceMs)}</span>
                </div>
              </div>
              <div class='divider divider-horizontal'></div>
              <div class='flex items-center justify-center flex-col text-secondary'>
                <span class='font-semibold opacity-70'>Active Players</span>
                <span class='text-6xl font-bold'>{mockPlayers.length}</span>
              </div>
            </div>
          </Card>
          <Card>
            <Card.Title>
              <Users size={20} /> Recent Active Players
            </Card.Title>
            <table class='table-auto w-full border-collapse'>
              <tbody>
                {mockPlayers.map((p) => <PlayerRow player={p} key={p.id} />)}
              </tbody>
            </table>
          </Card>
        </aside>
        <main class='relative flex-1 space-y-8 py-10'>
          <section class='max-w-prose prose prose-invert prose-headings:text-primary prose-strong:text-secondary'>
            <h2 class='flex items-center gap-2'>
              <Info size={28} /> About Chupato
            </h2>
            <p>
              Chupato is a community‑driven{' '}
              <strong>3.3.5 WoW private server</strong>{' '}
              built and maintained by veteran players who’ve been adventuring
              together for years. It’s our passion project, fueled by countless
              late‑night sessions and shared memories.
            </p>
            <p>
              Join us for balanced PvP battles, recurring custom events, and an
              experienced community of players who can't let go of 19 twinking.
              Download the launcher to dive straight in, or hop on Discord to
              manage your account, chat, share feedback, and stay connected.
            </p>
            <p>
              We’re here for dedicated players who remember when it all began
              and appreciate a mature environment crafted with decades of
              know‑how.
            </p>
          </section>
          <section class='max-w-prose prose prose-invert prose-headings:text-primary prose-strong:text-secondary'>
            <h2 class='flex items-center gap-2'>
              <Settings size={28} /> Features
            </h2>
            <ul>
              <li>
                <strong>Pre-patch 3.2</strong> (before the big twink nerf)
                <ul>
                  <li>Legs & Head enchants available</li>
                  <li>No speed forms (cheetah, ghost wolf, travel)</li>
                </ul>
              </li>
              <li>
                <strong>Improved talent trees</strong> for fresh class balance
              </li>
              <li>
                <strong>Balances adjustements</strong>, AGM undispellable, Naaru
                gift nerfed, etc...
              </li>
              <li>
                Blizz like vibes, <strong>No new spells or custom gear</strong>
              </li>
              <li>
                <strong>8v8 cross-faction Warsong</strong> with arena rules{' '}
                <i>(no consumables except Warsong buff)</i>
              </li>
              <li>
                <strong>Clear gearing system</strong>
                <ul>
                  <li>
                    <b>[Quest Items]</b>{' '}
                    obtainable through adjusted classic Booty Bay quests
                  </li>
                  <li>
                    <b>[Bind on Equipped]</b>{' '}
                    items are now crafted by professions
                  </li>
                  <li>
                    <b>[Bind on Pickup]</b>{' '}
                    items still drop on the usual bosses, easily accessibile
                    with LFG
                  </li>
                  <li>
                    <b>[Heirlooms]</b> available by completing{' '}
                    <strong>weekly quests</strong> (level 19+)
                  </li>
                  <li>
                    <b>[Fishing Hat & Boots]</b> doing the{' '}
                    <strong>daily fishing tournament</strong>
                  </li>
                  <li>
                    <b>[Arena Grand Master]</b>{' '}
                    directly available in every gurubashi chest, no quest chain
                  </li>
                </ul>
              </li>
              <li>
                <strong>Fast progression</strong>
                <ul>
                  <li>Level 18 → 19 to grind</li>
                  <li>Profession Plans via rare enemies drops & PvP rewards</li>
                  <li>Max-level gathering from day one</li>
                  <li>All Enchants and glyphs usable at level 19 available</li>
                  <li>
                    <strong>Legs enchants</strong>{' '}
                    from Tailoring & Leatherworking
                  </li>
                </ul>
              </li>
              <li class='italic'>
                …and much more cosmetic upgrades to explore!
              </li>
            </ul>
          </section>
        </main>
        <aside class='lg:w-80 flex-shrink-0 space-y-4'>
          <Card>
            <Card.Title>
              <Link size={20} /> Links
            </Card.Title>
            <a
              href='https://discord.gg/uHGR3rB'
              target='_blank'
              class='btn btn-outline opacity-80 hover:opacity-100 btn-secondary w-full gap-2'
            >
              <MessageCircle size={16} /> Join Discord
            </a>
            <a
              href='https://github.com/chupato/chupato.github.io/releases/latest/download/chupato.exe'
              download='chupato.exe'
              class='hidden sm:flex btn btn-primary w-full justify-center gap-2 font-bold'
            >
              <CloudDownload size={16} /> Download Launcher
            </a>
          </Card>
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
                  <div class='stat-value text-6xl'>{mockWarsongCount}</div>
                  <div class='stat-desc text-sm'>
                    ~{mockWarsongAvgWait} wait
                  </div>
                </div>
              </div>
              <div class='divider divider-horizontal'></div>
              <div class='flex flex-col items-center text-info'>
                <div class='flex items-center gap-1'>
                  <Swords size={20} />
                  <span class='font-semibold text-xl'>3v3</span>
                </div>
                <div class='text-center'>
                  <div class='stat-value text-6xl'>{mockArena3v3Count}</div>
                  <div class='stat-desc text-sm'>
                    ~{mockArena3v3AvgWait} wait
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)
