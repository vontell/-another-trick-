# Cryptic Maze

A word/trivia maze game. Instead of a static crossword, you navigate a
Slay-the-Spire-style **map of rooms** — each room is a single crossword (or
cryptic) clue. Solve a room's clue to open the rooms ahead, and carve a path
from the entrances to the final chamber.

Works on desktop and mobile (responsive, touch-friendly, tap a square to type).

## Gameplay

- **30 rooms** form a branching map. You don't have to clear every room — any
  path from a start room to the final chamber wins the level.
- **Bridges.** Every room's answer hides a guaranteed 2-letter pair that is
  certain to appear in *all* of the rooms it leads into. After you solve a
  room, that pair is outlined — a head start on what's ahead. (Multiple rooms
  can feed one room, so tougher clues often have more ways in.)
- **Reveal-letter tokens (⚡).** Some rooms award a token if you answer
  correctly on the **first try**. Spend a token in any room to reveal one
  letter.
- **Meta letters (◆).** Some rooms have a single blue square. Solve them to
  collect that letter into a bank for the **meta puzzle**.
- **Meta puzzle.** After the final (hardest) room, attempt the meta — it has no
  clue of its own, only a theme tying the level together. Every blue letter you
  collected appears in the answer.

Progress is saved locally in the browser, so you can close the tab and return.

## Tech

- **Vite + React + TypeScript + Tailwind CSS** — a static single-page app, no
  backend required.
- Level content lives in [`src/game/levels.ts`](src/game/levels.ts). Bridges are
  *derived* from the answers + map graph at load time
  ([`src/game/bridges.ts`](src/game/bridges.ts)), so authoring a level just means
  writing good clues and a valid graph.

## Scripts

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build
npm run validate   # validate every level (bridges, reachability, etc.)
```

### Authoring levels

`npm run validate` checks each level for:

- answers that are uppercase letters only,
- every `next` edge pointing at a real room,
- a valid final room (reachable, no successors) and reachable start rooms,
- no unreachable rooms,
- and — the important one — that **every non-final room shares at least one
  2-letter bridge with all of its successors**.

If a room has no valid bridge, the script tells you exactly which answers are in
conflict so you can tweak a word.
