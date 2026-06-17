// Dependencies
import { Fragment, h, render } from 'preact'
import { Info, Settings } from 'lucide-preact'

// Local imports
import { toggleSound } from './sound.ts'
import { ServerStatus } from './server-status.tsx'
import { RecentActivePlayers } from './recent-active-players.tsx'
import { Links } from './links.tsx'
import { Talents } from './talents.tsx'
import { QueueStats } from './queue-stats.tsx'
import { ToolTip } from './tooltip.tsx'

// Assets
import styles from './app.module.css'
const logoUrl =
  'https://rawcdn.githack.com/chupato/chupato.github.io/d4b928bd955c26ca2ec10c7c6c90d188ca474563/launcher/logo.avif'

Object.assign(globalThis, { h, Fragment })

const Banner = () => (
  <div class={styles.banner}>
    <img
      src={logoUrl}
      alt='CHUPATO Logo'
      onClick={toggleSound}
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
)

const Features = () => (
  <section class='max-w-prose prose prose-invert prose-headings:text-primary prose-strong:text-secondary mx-auto'>
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
        <strong>Balances adjustements</strong>, AGM undispellable, Naaru gift
        nerfed, etc...
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
            <b>[Bind on Equipped]</b> items are now crafted by professions
          </li>
          <li>
            <b>[Bind on Pickup]</b>{' '}
            items still drop on the usual bosses, easily accessibile with LFG
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
            <strong>Legs enchants</strong> from Tailoring & Leatherworking
          </li>
        </ul>
      </li>
      <li class='italic'>
        …and much more cosmetic upgrades to explore!
      </li>
    </ul>
  </section>
)

const About = () => (
  <section class='max-w-prose prose prose-invert prose-headings:text-primary prose-strong:text-secondary mx-auto'>
    <h2 class='flex items-center gap-2'>
      <Info size={28} /> About Chupato
    </h2>
    <p>
      Chupato is a community‑driven <strong>3.3.5 WoW private server</strong>
      {' '}
      built and maintained by veteran players who’ve been adventuring together
      for years. It’s our passion project, fueled by countless late‑night
      sessions and shared memories.
    </p>
    <p>
      Join us for balanced PvP battles, recurring custom events, and an
      experienced community of players who can't let go of 19 twinking. Download
      the launcher to dive straight in, or hop on Discord to manage your
      account, chat, share feedback, and stay connected.
    </p>
    <p>
      We’re here for dedicated players who remember when it all began and
      appreciate a mature environment crafted with decades of know‑how.
    </p>
  </section>
)

const App = () => (
  <div class='mx-auto max-w-screen-xl p-4 pt-20 pb-20 space-y-6 bg-base-200 min-h-screen'>
    <Banner />
    <div class='relative z-10 -mt-2 lg:-mt-142 flex flex-col lg:flex-row gap-6'>
      <aside class='lg:w-80 flex-shrink-0 space-y-4'>
        <ServerStatus />
        <RecentActivePlayers />
      </aside>
      <main class='relative flex-1 space-y-8 py-10'>
        <About />
        <Features />
      </main>
      <aside class='lg:w-80 flex-shrink-0 space-y-4'>
        <Links />
        <QueueStats />
      </aside>
    </div>
    <Talents />
    <ToolTip />
  </div>
)

const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)
