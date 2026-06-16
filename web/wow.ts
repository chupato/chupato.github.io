// Stats blacklist per class
const magical = ['Intellect', 'Spirit']
const physical = ['Agility', 'Strength']
const none: string[] = []

export const wowClasses = {
  DRUID: {
    id: 11,
    excludeStats: none,
    color: '#ff7c0a', // Orange
  },
  HUNTER: {
    id: 3,
    excludeStats: magical,
    color: '#aad372', // Pistachio
  },
  MAGE: {
    id: 8,
    excludeStats: physical,
    color: '#3fc7eb', // Light Blue
  },
  PALADIN: {
    id: 2,
    excludeStats: none,
    color: '#f48cba', // Pink
  },
  PRIEST: {
    id: 5,
    excludeStats: physical,
    color: '#ffffff', // White*
  },
  ROGUE: {
    id: 4,
    excludeStats: magical,
    color: '#fff468', // Yellow*
  },
  SHAMAN: {
    id: 7,
    excludeStats: none,
    color: '#0070dd', // Blue
  },
  WARLOCK: {
    id: 9,
    excludeStats: physical,
    color: '#8788ee', // Purple
  },
  WARRIOR: {
    id: 1,
    excludeStats: magical,
    color: '#c69b6d', // Tan
  },
  DEATHKNIGHT: {
    id: 6,
    excludeStats: magical,
    color: '#c41e3a', // Red
  },
  /*
  DEMONHUNTER: {
    excludeStats: magical,
    color: '#a330c9', // Dark Magenta
  },
  MONK: {
    id: 10
    excludeStats: none,
    color: '#00ff98', // Spring Green
  },
  */
} as const

export const wowRaces = {
  HUMAN: 1,
  ORC: 2,
  DWARF: 3,
  NIGHTELF: 4,
  UNDEAD: 5,
  TAUREN: 6,
  GNOME: 7,
  TROLL: 8,
  GOBLIN: 9,
  BLOODELF: 10,
  DRAENEI: 11,
} as const

export const wowSlots = {
  HEAD: 0,
  NECK: 1,
  SHOULDERS: 2,
  BODY: 3,
  CHEST: 4,
  WAIST: 5,
  LEGS: 6,
  FEET: 7,
  WRISTS: 8,
  HANDS: 9,
  FINGER1: 10,
  FINGER2: 11,
  TRINKET1: 12,
  TRINKET2: 13,
  BACK: 14,
  MAINHAND: 15,
  OFFHAND: 16,
  RANGED: 17,
  TABARD: 18,
  NONE: 19,
} as const

export type WoWRaces = typeof wowRaces
export type WoWClasses = typeof wowClasses
