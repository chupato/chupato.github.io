import { Fragment, h, render } from 'preact'
import {
  CheckCircle,
  CloudDownload,
  Flag,
  Globe,
  Home,
  Hourglass,
  Info,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Server,
  Swords,
  Users,
  XCircle,
} from 'lucide-preact'
import logoUrl from './logo.avif'
import bgUrl from './background.avif'
import chupatoSoundUrl from './chupato-cute.ogg'

import styles from './class-button.module.css'
import { wowClasses } from './wow.ts'

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
    status: 'Arena',
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

const mockWarsongCount = 7
const mockWarsongAvgWait = '2m 15s'
const mockArena3v3Count = 2
const mockArena3v3AvgWait = '4m 30s'
// current server connection status
const mockServerState: 'online' | 'pending' | 'offline' = 'online'
// positive = online since that timestamp; negative = offline since abs(timestamp)
const mockServerSince = Date.now() - 5 * 60 * 1000

function App() {
  // compute server status
  const online = mockServerSince > 0
  const pending = mockServerState === 'pending'
  const offline = mockServerState === 'offline'
  const sinceMs = online
    ? Date.now() - mockServerSince
    : Date.now() + mockServerSince
  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    const ss = s % 60
    const mm = m % 60
    return `${h}h ${mm}m ${ss}s`
  }
  return (
    <div class='p-4 pt-20 space-y-6 bg-base-200 min-h-screen'>
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
        class='relative h-48 bg-cover bg-center rounded-lg overflow-visible'
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <img
          src={logoUrl}
          alt='CHUPATO Logo'
          onClick={() => play()}
          class='h-40 mx-auto absolute inset-x-0 -translate-y-1/3 cursor-pointer hover:wiggle'
        />
        <h1 class='absolute inset-x-0 top-28 text-center text-3xl font-bold text-warning filter-outline-lg flex items-center justify-center gap-2'>
          a WoW 19 Twink Private Server
        </h1>
        <p class='absolute inset-x-0 top-36 text-center text-sm text-success drop-shadow-sm filter-outline-lg'>
          Challenge Heroes Ultimate Private Arena Twink Online
        </p>
      </div>

      <div class='grid gap-4 md:grid-cols-2 items-start'>
        <div class='space-y-4'>
          <div class='card card-compact bg-base-100 shadow'>
            <div class='card-body p-2 space-y-1'>
              <h2 class='card-title justify-center flex items-center drop-shadow'>
                <Server size={20} /> Server Status
              </h2>
              <div class='flex items-center justify-evenly p-3'>
                <div class='space-y-2'>
                  <div class='flex items-center gap-2'>
                    {online
                      ? <CheckCircle size={20} class='text-success' />
                      : pending
                      ? <RefreshCcw size={20} class='text-warning' />
                      : <XCircle size={20} class='text-error' />}
                    <span
                      className={online
                        ? 'text-success text-lg'
                        : pending
                        ? 'text-warning text-lg'
                        : 'text-error text-lg'}
                    >
                      {online ? 'Online' : pending ? 'Pending' : 'Offline'}
                    </span>
                  </div>
                  <div class='flex items-center gap-2'>
                    <span class='stat-value font-semibold'>{fmt(sinceMs)}</span>
                  </div>
                </div>
                <div class='divider divider-horizontal'></div>
                <div class='flex items-center justify-center flex-col'>
                  <span class='text-lg font-semibold'>Active Players</span>
                  <span class='text-6xl font-bold'>{mockPlayers.length}</span>
                </div>
              </div>
            </div>
          </div>
          <div class='card card-compact bg-base-100 shadow'>
            <div class='card-body p-2 space-y-1'>
              <h2 class='card-title justify-center flex items-center gap-2 drop-shadow'>
                <Users size={20} /> Recent Active Players
              </h2>
              <table class='table-auto w-full border-collapse'>
                <tbody>
                  {mockPlayers.map((p) => (
                    <tr key={p.id} class='border-b border-base-200'>
                      <td class='py-1 px-2'>
                        <span
                          role='img'
                          aria-label={p.cls}
                          class={`${styles.classButton} ${
                            styles[p.cls.toUpperCase()]
                          } inline-block w-6 h-6 rounded-full`}
                          style={{
                            outline: `2px solid ${
                              wowClasses[p.cls.toUpperCase()].color
                            }`,
                            outlineOffset: '2px',
                          }}
                        />
                      </td>
                      <td class='py-1 px-2 font-medium'>{p.name}</td>
                      <td class='py-1 px-2 text-xs opacity-70'>
                        {p.lastActive}
                      </td>
                      <td class='py-1 px-2 text-xs uppercase flex items-center gap-1'>
                        {p.status === 'Warsong'
                          ? <Flag size={16} class='text-warning' />
                          : p.status === 'Arena'
                          ? <Swords size={16} class='text-info' />
                          : p.status === 'Gurubashi'
                          ? <MapPin size={16} class='text-error' />
                          : <Globe size={16} class='text-success' />}
                        {p.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class='card card-compact bg-base-100 shadow'>
          <div class='card-body p-2 space-y-1'>
            <h2 class='card-title justify-center flex items-center gap-2 drop-shadow'>
              <Hourglass size={20} /> Queue Status
            </h2>
            <div class='flex items-center justify-evenly p-2'>
              <div class='flex flex-col items-center gap-1'>
                <div class='flex items-center gap-1 text-warning'>
                  <Flag size={20} />
                  <span class='font-semibold text-xl'>Warsong</span>
                </div>
                <div class='text-center'>
                  <div class='stat-value text-xxl'>{mockWarsongCount}</div>
                  <div class='stat-desc text-sm'>
                    ~{mockWarsongAvgWait} wait
                  </div>
                </div>
              </div>
              <div class='divider divider-horizontal'></div>
              <div class='flex flex-col items-center gap-1'>
                <div class='flex items-center gap-1 text-info'>
                  <Swords size={20} />
                  <span class='font-semibold text-xl'>3v3</span>
                </div>
                <div class='text-center'>
                  <div class='stat-value text-xxl'>{mockArena3v3Count}</div>
                  <div class='stat-desc text-sm'>
                    ~{mockArena3v3AvgWait} wait
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class='card bg-base-100 shadow'>
          <div class='card-body p-6 space-y-6'>
            <h2 class='card-title text-lg font-semibold flex items-center gap-3'>
              <Info size={24} />
              About Chupato
            </h2>
            <p class='text-base leading-relaxed'>
              Chupato is a <strong>3.3.5 WoW private server</strong>{' '}
              crafted for twink arena enthusiasts. Join us for{' '}
              <strong>
                balanced PvP battles
              </strong>, immersive <strong>custom events</strong>, and an
              <strong>active community</strong> that keeps the action alive.
            </p>
            <p class='text-base leading-relaxed'>
              Adventure awaits—dive in today! Download our launcher to connect
              instantly, or hop on Discord to chat, report issues, and stay up
              to speed on all server happenings.
            </p>
            <div class='flex gap-3'>
              <a
                href='https://github.com/chupato/chupato.github.io/releases/download/2025-06-02.1/chupato.exe'
                class='btn btn-primary flex items-center gap-2'
                target='_blank'
                rel='noopener'
              >
                <CloudDownload size={18} />
                Download Launcher
              </a>
              <a
                href='https://discord.gg/uHGR3rB'
                class='btn btn-secondary flex items-center gap-2'
                target='_blank'
                rel='noopener'
              >
                <MessageCircle size={18} />
                Join Discord
              </a>
            </div>
          </div>
        </div>

        <div class='card bg-base-100 shadow'>
          <div class='card-body p-6 space-y-6'>
            <h2 class='card-title text-lg font-semibold flex items-center gap-3'>
              <Home size={24} />
              Features
            </h2>
            <ul class='list-disc list-inside space-y-4 text-base leading-relaxed'>
              <li>
                <strong>Pre-patch 3.2</strong> (before the big twink nerf):
                <ul class='list-disc list-inside ml-6 space-y-2 text-sm'>
                  <li>High level legs & head enchants available</li>
                  <li>No speed forms (cheetah, ghost wolf, travel)</li>
                </ul>
              </li>
              <li>Improved talent trees for fresh class balance</li>
              <li>No custom spells; AGM remains undispellable</li>
              <li>
                <strong>8v8 cross-faction Warsong</strong> with arena rules
                <span class='italic'>(no consumables except Warsong buff)</span>
              </li>
              <li>
                <strong>Fast progression</strong>:
                <ul class='list-disc list-inside ml-6 space-y-2 text-sm'>
                  <li>Level 18 → 19</li>
                  <li>BoE crafted items for useful professions</li>
                  <li>Plans via rare drops & PvP rewards</li>
                  <li>Max-level gathering from day one</li>
                  <li>Classic Booty Bay quest items</li>
                  <li>LFG dungeons for BoP gear</li>
                  <li>Weekly heirloom quests at 19</li>
                  <li>Daily Fishing Tournament rewards</li>
                  <li>Direct AGM trinket from the chest</li>
                </ul>
              </li>
              <li class='italic'>…and more cosmetic touches to explore!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)
