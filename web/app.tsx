import { Fragment, h, render } from 'preact'
import { Home } from 'lucide-preact'

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
const mockArenaCount = 3

function App() {
  return (
    <div class="p-4 space-y-6">
      <h1 class="text-2xl font-bold flex items-center gap-2">
        <Home size={24}/> CHUPATO Server Activity
      </h1>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="card bg-base-100 shadow">
          <div class="card-body space-y-2">
            <h2 class="card-title">Recent Active Players</h2>
            <ul class="menu menu-compact">
              {mockPlayers.map(p => (
                <li key={p.id} class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{p.name}</span>
                    <span
                      role="img"
                      aria-label={p.cls}
                      class={`${styles.classButton} ${styles[p.cls.toUpperCase()]} w-6 h-6`}
                      style={{ color: wowClasses[p.cls.toUpperCase()].color }}
                    />
                    <span class="px-2 py-0.5 rounded-full text-xs uppercase bg-base-200 text-base-content">
                      {p.race}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold">{p.level}</span>
                    <span class="text-xs opacity-70">{p.lastActive}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-2">Queue Status</h2>
          <div class="stats shadow">
            <div class="stat">
              <div class="stat-title">Warsong Queue</div>
              <div class="stat-value">{mockWarsongCount}</div>
              <div class="stat-desc">players waiting</div>
            </div>
            <div class="stat">
              <div class="stat-title">Arena Queue</div>
              <div class="stat-value">{mockArenaCount}</div>
              <div class="stat-desc">players waiting</div>
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
