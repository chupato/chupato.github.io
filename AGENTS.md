# CHUPATO Private server website

> This is a dynamic front page for a low population World of Warcraft private server (3.3.5 wotlk version)

This is a single page app, the API is a stream of events from an `EventSource` (see @web/state.ts) that reduce into our app state to reflect what is happening on the game server, things like:

- A player killed another player in world PVP
- A battleground started
- Someone joined the battleground queue
- etc...

It's all to highlight the activity of the server even though it's low population.

Game Accounts are link to discord accounts, all authentication will be using discord OAuth (not implemented yet)

For now we need to work on showing the game state.

Later we will implement more features like:
- A Custom Talent calculator
- An armory to visualize players items & talent
- A tool to plan for upgrade for your gear (maybe if you are looking at one of your own character armory page)
- A database to see the items, quests and npcs
  - If possible, the db could see what character you have active
    and show the list of quests / items you have

## 1. Tasks

deno task vite        │ deno run -A npm:vite   │ Alias for “run the Vite CLI under Deno with all permissions.”
deno task web:dev     │ deno task vite dev     │ Launches the Vite dev‐server for local development (HMR, fast rebuilds).
deno task web:build   │ deno task vite build   │ Produces an optimized production build (minification, code‑splitting, asset fingerprinting).
deno task web:preview │ deno task vite preview │ Serves the production build locally so you can smoke‑test the optimized output.

## 2. Stack

│ UI framework    │ Preact                                │ React‐compatible, tiny runtime
│ JSX support     │ react-jsx + jsxImportSource: "preact" │ Use the built‑in React‑style JSX transform pointed at Preact
│ Reactivity      │ @preact/signals                       │ Fine‑grained reactive primitives
│ Build system    │ Vite                                  │ Lightning‑fast dev server + build tooling
│ Vite preset     │ @preact/preset-vite                   │ Preact support plugin for Vite
│ Styling         │ Tailwind CSS + @tailwindcss/vite      │ Utility‑first CSS framework (first‑class Vite plugin)
│ Component theme │ DaisyUI                               │ Pre‑styled Tailwind UI components
│ Icons           │ Lucide‑Preact                         │ Tree‑shakable SVG icon components for Preact

## 3. Guidelines

- Attempt to favor signals over hooks whenever possible
- Avoid adding state and hooks, try to focus on UI only element
- When nescessary, state should be held in the URL using search params see @web/router.tsx for the implem
- no useless wrapper function `onclick={() => handleClick()}` should be `onclick={handleClick}`
- Never use `.forEach` unless the function called in the loop already exists, use `for .. of` instead
- Never use `for .. in`, use `for .. of` with `Object.keys` / `Object.entries` or `Object.values`
- `.reduce` is to be avoided aside from very simple accumulation that do not imply re-spreading / object creation. Valid cases are total, descending a tree, chaining promises .then, suggest `for .. of` instead, if the goal was to recreate an object, suggest to `.map` to entries and use `Object.fromEntries` like so: `Object.fromEntries(xx.map(x => [x.k, x.v]))` instead.
- In switch cases over enums, make sure we have an exhaustive check in the `default` case:
    ```
      switch (e /* enum value*/ ) {
       case (E.A): break;
       case (E.B): break;
       default: {
         const _: never = e; // Ensure all cases are handled
       }
    ```
    or require a comment justifying why all the case are not needed.

### 3.1 Format Rules
- indent: 2 spaces
- line width: 80 chars
- no semi-colons
- favor single quote

Never use `Array.from(x)` either spread `[...x]` or if its an iterator use `.toArray()`
