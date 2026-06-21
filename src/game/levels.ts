import type { Level, Room } from './types';

/**
 * Level 1 — "The Explorer's Labyrinth"
 *
 * 30 rooms laid out as a Slay-the-Spire-style DAG across 8 depths. Every
 * non-final room shares a guaranteed 2-letter bridge with ALL of its
 * successors (validated by scripts/validateLevels.ts and src/game/bridges.ts).
 *
 * Coordinates: `row` is depth (0 = start .. 7 = final). `col` is a 0..6
 * horizontal scale used only for map layout.
 */

const rooms: Room[] = [
  // ── Depth 0 — starts ───────────────────────────────────────────────
  {
    id: 'r0',
    clue: 'Prolific inventor of the practical incandescent lightbulb',
    answer: 'EDISON',
    next: ['r2', 'r3', 'r4'],
    row: 0,
    col: 2,
  },
  {
    id: 'r1',
    clue: 'Physicist who described universal gravitation',
    answer: 'NEWTON',
    next: ['r3', 'r4', 'r5'],
    row: 0,
    col: 4,
  },

  // ── Depth 1 ────────────────────────────────────────────────────────
  {
    id: 'r2',
    clue: 'Element no. 6 — the backbone of organic chemistry',
    answer: 'CARBON',
    next: ['r6', 'r7'],
    row: 1,
    col: 1,
    metaLetterIndex: 2, // R
  },
  {
    id: 'r3',
    clue: 'Elementary particle; a single quantum of light',
    answer: 'PHOTON',
    next: ['r7', 'r8'],
    row: 1,
    col: 2.5,
    metaLetterIndex: 3, // T
  },
  {
    id: 'r4',
    clue: 'Guiding light or warning fire set on a hill',
    answer: 'BEACON',
    next: ['r8', 'r9'],
    row: 1,
    col: 3.5,
    powerUp: 'reveal',
  },
  {
    id: 'r5',
    clue: 'Spring, for one — or to add salt and pepper',
    answer: 'SEASON',
    next: ['r9', 'r10'],
    row: 1,
    col: 5,
  },

  // ── Depth 2 ────────────────────────────────────────────────────────
  {
    id: 'r6',
    clue: 'Radio-wave detection system (and a palindrome)',
    answer: 'RADAR',
    next: ['r11', 'r12'],
    row: 2,
    col: 1,
    metaLetterIndex: 1, // A
  },
  {
    id: 'r7',
    clue: 'Orange vegetable dangled as an incentive',
    answer: 'CARROT',
    next: ['r12', 'r13'],
    row: 2,
    col: 2,
  },
  {
    id: 'r8',
    clue: '"I\'m a little ___" (nursery-rhyme vessel)',
    answer: 'TEAPOT',
    next: ['r13', 'r14'],
    row: 2,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r9',
    clue: 'The Pacific or the Atlantic, e.g.',
    answer: 'OCEAN',
    next: ['r14', 'r15'],
    row: 2,
    col: 4,
    metaLetterIndex: 2, // E
  },
  {
    id: 'r10',
    clue: 'Rational basis for a belief or action',
    answer: 'REASON',
    next: ['r15', 'r16'],
    row: 2,
    col: 5,
  },

  // ── Depth 3 ────────────────────────────────────────────────────────
  {
    id: 'r11',
    clue: 'Showing courage in the face of danger',
    answer: 'BRAVE',
    next: ['r17'],
    row: 3,
    col: 0.5,
  },
  {
    id: 'r12',
    clue: 'Set of coded instructions run by a computer',
    answer: 'PROGRAM',
    next: ['r17', 'r18'],
    row: 3,
    col: 1.7,
    powerUp: 'reveal',
  },
  {
    id: 'r13',
    clue: 'Full of tiny holes; able to soak up liquid',
    answer: 'POROUS',
    next: ['r18', 'r19'],
    row: 3,
    col: 2.6,
    metaLetterIndex: 4, // U
  },
  {
    id: 'r14',
    clue: 'European country whose capital is Warsaw',
    answer: 'POLAND',
    next: ['r19', 'r20'],
    row: 3,
    col: 3.4,
  },
  {
    id: 'r15',
    clue: 'Deep river-cut gorge, like the Grand one',
    answer: 'CANYON',
    next: ['r20', 'r21'],
    row: 3,
    col: 4.3,
  },
  {
    id: 'r16',
    clue: 'Mythical fire-breathing beast',
    answer: 'DRAGON',
    next: ['r21'],
    row: 3,
    col: 5.5,
  },

  // ── Depth 4 ────────────────────────────────────────────────────────
  {
    id: 'r17',
    clue: 'Citrus fruit that shares its name with a colour',
    answer: 'ORANGE',
    next: ['r22'],
    row: 4,
    col: 1,
    metaLetterIndex: 5, // E
  },
  {
    id: 'r18',
    clue: 'Ancient prophet famously consulted at Delphi',
    answer: 'ORACLE',
    next: ['r22', 'r23'],
    row: 4,
    col: 2,
  },
  {
    id: 'r19',
    clue: 'Florida city, home to Walt Disney World',
    answer: 'ORLANDO',
    next: ['r23', 'r24'],
    row: 4,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r20',
    clue: 'Georgia capital that hosted the 1996 Olympics',
    answer: 'ATLANTA',
    next: ['r24', 'r25'],
    row: 4,
    col: 4,
  },
  {
    id: 'r21',
    clue: 'Domed Roman temple dedicated to all the gods',
    answer: 'PANTHEON',
    next: ['r25'],
    row: 4,
    col: 5,
  },

  // ── Depth 5 ────────────────────────────────────────────────────────
  {
    id: 'r22',
    clue: 'Large area densely covered with trees',
    answer: 'FOREST',
    next: ['r26'],
    row: 5,
    col: 1.5,
    metaLetterIndex: 4, // S
  },
  {
    id: 'r23',
    clue: 'Hard work — or a major UK political party',
    answer: 'LABOR',
    next: ['r26', 'r27'],
    row: 5,
    col: 2.7,
  },
  {
    id: 'r24',
    clue: 'Body of land entirely surrounded by water',
    answer: 'ISLAND',
    next: ['r27', 'r28'],
    row: 5,
    col: 3.6,
    powerUp: 'reveal',
  },
  {
    id: 'r25',
    clue: 'Mountain that may erupt with molten lava',
    answer: 'VOLCANO',
    next: ['r28'],
    row: 5,
    col: 4.8,
  },

  // ── Depth 6 ────────────────────────────────────────────────────────
  {
    id: 'r26',
    clue: 'Medical professional — or a certain Time Lord',
    answer: 'DOCTOR',
    next: ['r29'],
    row: 6,
    col: 2,
  },
  {
    id: 'r27',
    clue: 'Pipe instrument in a church — or the heart, e.g.',
    answer: 'ORGAN',
    next: ['r29'],
    row: 6,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r28',
    clue: 'Mercury, Venus, Earth... (a body orbiting a star)',
    answer: 'PLANET',
    next: ['r29'],
    row: 6,
    col: 4,
    metaLetterIndex: 5, // T
  },

  // ── Depth 7 — final (hardest) ──────────────────────────────────────
  {
    id: 'r29',
    clue: 'Parentless child — and a typesetter\'s lone line stranded at a page\'s foot',
    answer: 'ORPHAN',
    next: [],
    row: 7,
    col: 3,
    isFinal: true,
  },
];

export const LEVEL_1: Level = {
  id: 'level-1',
  title: "The Explorer's Labyrinth",
  subtitle: 'Solve a path of clues from the entrances to the final chamber.',
  rooms,
  startRoomIds: ['r0', 'r1'],
  finalRoomId: 'r29',
  meta: {
    answer: 'TREASURE',
    prompt:
      'The meta puzzle has no clue of its own. Every blue letter you collected on your journey appears in one word — the thing every explorer seeks at the end of the labyrinth. (8)',
    hint: 'Each letter you gathered is somewhere in the answer. X marks the spot.',
  },
};

export const LEVELS: Level[] = [LEVEL_1];
