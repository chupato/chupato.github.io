import { Fragment, h, render } from 'preact'
import { Home, Server, Users, LayoutGrid } from 'lucide-preact'
import logoUrl from '../launcher/logo.avif'
import bgUrl from '../launcher/background.avif'

import styles from './class-button.module.css'
import { wowClasses } from './wow.ts'

Object.assign(globalThis, { h, Fragment })

const mockPlayers = [
  { id: '1', name: 'Alice', race: 'Human', cls: 'Paladin', level: 19, lastActive: '2m ago' },
  { id: '2', name: 'Bob', race: 'Orc', cls: 'Warrior', level: 18, lastActive: '5m ago' },
  { id: '3', name: 'Carolina', race: 'Night Elf', cls: 'Druid', level: 19, lastActive: '7m ago' },
  { id: '4', name: 'Darius', race: 'Dwarf', cls: 'Hunter', level: 18, lastActive: '10m ago' },
  { id: '5', name: 'Eliza', race: 'Troll', cls: 'Mage', level: 19, lastActive: '12m ago' },
  { id: '6', name: 'Frodo', race: 'Gnome', cls: 'Warlock', level: 18, lastActive: '15m ago' },
  { id: '7', name: 'Gandalf', race: 'Human', cls: 'Priest', level: 19, lastActive: '18m ago' },
  { id: '8', name: 'Hermione', race: 'Human', cls: 'Mage', level: 18, lastActive: '20m ago' },
  { id: '9', name: 'Icarus', race: 'Night Elf', cls: 'Rogue', level: 19, lastActive: '22m ago' },
  { id: '10', name: 'Jaina', race: 'Human', cls: 'Mage', level: 18, lastActive: '25m ago' },
]

const mockWarsongCount = 7
const mockArena2v2Count = 3
const mockArena3v3Count = 2
const mockArena5v5Count = 1
// positive = online since that timestamp; negative = offline since abs(timestamp)
const mockServerSince = Date.now() - 5 * 60 * 1000

function App() {
  // compute server status
  const online = mockServerSince > 0
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
    <div class="p-4 space-y-6 bg-base-200 min-h-screen">
      <div
        class="relative h-48 bg-cover bg-center rounded-lg overflow-hidden"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <h1
          class="absolute inset-x-0 top-4 text-center text-3xl font-bold text-warning flex items-center justify-center gap-2 drop-shadow-lg"
        >
          <Home size={24}/> CHUPATO Server Activity
        </h1>
        <img
          src={logoUrl}
          alt="CHUPATO Logo"
          class="h-32 mx-auto absolute inset-x-0 bottom-2"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2 items-start">
        <div class="space-y-4">
          <div class="card card-compact bg-base-100 shadow">
            <div class="card-body p-2 space-y-1">
              <h2 class="card-title flex items-center gap-2 drop-shadow">
                <Server size={20}/> Server Status
              </h2>
              <div class="stats stats-vertical shadow">
                <div class="stat">
                  <div class="stat-title">{online ? 'Online since' : 'Offline since'}</div>
                  <div class="stat-value">{fmt(sinceMs)}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="card card-compact bg-base-100 shadow">
            <div class="card-body p-2 space-y-1">
              <h2 class="card-title flex items-center gap-2 drop-shadow">
                <Users size={20}/> Recent Active Players
              </h2>
              <ul class="divide-y divide-base-200">
                {mockPlayers.map(p => (
                  <li key={p.id} class="flex justify-between items-center py-1">
                    <div class="flex items-center gap-1">
                      <span
                        role="img"
                        aria-label={p.cls}
                        class={`${styles.classButton} ${styles[p.cls.toUpperCase()]} w-6 h-6 rounded-full border-2`}
                        style={{ borderColor: wowClasses[p.cls.toUpperCase()].color }}
                      />
                      <span class="font-medium">{p.name}</span>
                    </div>
                    <span class="text-xs opacity-70">{p.lastActive}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div class="card card-compact bg-base-100 shadow">
          <div class="card-body p-2 space-y-1">
            <h2 class="card-title flex items-center gap-2 drop-shadow">
              <LayoutGrid size={20}/> Queue Status
            </h2>
            <div class="stats stats-vertical shadow">
              <div class="stat">
                <div class="stat-title">Warsong Queue</div>
                <div class="stat-value text-4xl">{mockWarsongCount}</div>
                <div class="stat-desc">players waiting</div>
              </div>
              <div class="stat">
                <div class="stat-title">Arena Queues</div>
                <div class="flex gap-2 justify-center">
                  <div class="text-center">
                    <div class="font-semibold">2v2</div>
                    <div class="text-xl">{mockArena2v2Count}</div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold">3v3</div>
                    <div class="text-xl">{mockArena3v3Count}</div>
                  </div>
                  <div class="text-center">
                    <div class="font-semibold">5v5</div>
                    <div class="text-xl">{mockArena5v5Count}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)
