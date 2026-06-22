import type { Level, Room } from './types';

/**
 * Level 1 — "The Explorer's Labyrinth"
 *
 * 30 rooms laid out as a Slay-the-Spire-style DAG across 11 depths (rows
 * 0..10). Every non-final room shares a guaranteed 2-letter bridge with ALL of
 * its successors (validated by scripts/validateLevels.ts and
 * src/game/bridges.ts). Every answer in the level is distinct.
 *
 * Coordinates: `row` is depth (0 = start .. 10 = final). `col` is a 0..6
 * horizontal scale used only for map layout.
 *
 * The entire maze runs on the rich "-ON" word family, so each room always
 * shares the "ON" bigram with all of its successors while never repeating a
 * word. The blue letters scattered across the depths anagram to TREASURE.
 */

const rooms: Room[] = [
  // ── Depth 0 — starts ───────────────────────────────────────────────
  {
    id: 'r0',
    clue: 'Prolific inventor of the practical incandescent lightbulb',
    answer: 'EDISON',
    next: ['r3', 'r4'],
    row: 0,
    col: 1,
    metaLetterIndex: 0, // E
  },
  {
    id: 'r1',
    clue: 'Physicist who described universal gravitation',
    answer: 'NEWTON',
    next: ['r4', 'r5'],
    row: 0,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r2',
    clue: 'Elementary particle; a single quantum of light',
    answer: 'PHOTON',
    next: ['r4', 'r5'],
    row: 0,
    col: 5,
  },

  // ── Depth 1 ────────────────────────────────────────────────────────
  {
    id: 'r3',
    clue: 'Spring, for one — or to add salt and pepper',
    answer: 'SEASON',
    next: ['r6', 'r7'],
    row: 1,
    col: 1,
    metaLetterIndex: 0, // S
  },
  {
    id: 'r4',
    clue: 'Element no. 6 — the backbone of organic chemistry',
    answer: 'CARBON',
    next: ['r6', 'r7'],
    row: 1,
    col: 3,
    metaLetterIndex: 1, // A
  },
  {
    id: 'r5',
    clue: 'Guiding light or warning fire set on a hill',
    answer: 'BEACON',
    next: ['r7', 'r8'],
    row: 1,
    col: 5,
  },

  // ── Depth 2 ────────────────────────────────────────────────────────
  {
    id: 'r6',
    clue: 'Rational basis for a belief or action',
    answer: 'REASON',
    next: ['r9', 'r10'],
    row: 2,
    col: 1,
    metaLetterIndex: 0, // R
  },
  {
    id: 'r7',
    clue: 'Mythical fire-breathing beast',
    answer: 'DRAGON',
    next: ['r9', 'r10'],
    row: 2,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r8',
    clue: 'Deep river-cut gorge, like the Grand one',
    answer: 'CANYON',
    next: ['r10', 'r11'],
    row: 2,
    col: 5,
  },

  // ── Depth 3 ────────────────────────────────────────────────────────
  {
    id: 'r9',
    clue: 'Domed Roman temple dedicated to all the gods',
    answer: 'PANTHEON',
    next: ['r12', 'r13'],
    row: 3,
    col: 1,
  },
  {
    id: 'r10',
    clue: 'Two or more voices sounding the very same note',
    answer: 'UNISON',
    next: ['r12', 'r13'],
    row: 3,
    col: 3,
    metaLetterIndex: 0, // U
    powerUp: 'reveal',
  },
  {
    id: 'r11',
    clue: 'Capital city on the River Thames',
    answer: 'LONDON',
    next: ['r13', 'r14'],
    row: 3,
    col: 5,
  },

  // ── Depth 4 ────────────────────────────────────────────────────────
  {
    id: 'r12',
    clue: 'Soft fabric spun from a fluffy white boll',
    answer: 'COTTON',
    next: ['r15', 'r16'],
    row: 4,
    col: 1,
  },
  {
    id: 'r13',
    clue: 'Decorative strip of fabric tied in a bow',
    answer: 'RIBBON',
    next: ['r15', 'r16'],
    row: 4,
    col: 3,
  },
  {
    id: 'r14',
    clue: 'Coloured wax stick a child draws with',
    answer: 'CRAYON',
    next: ['r16', 'r17'],
    row: 4,
    col: 5,
  },

  // ── Depth 5 ────────────────────────────────────────────────────────
  {
    id: 'r15',
    clue: 'Pink-fleshed fish that swims upstream to spawn',
    answer: 'SALMON',
    next: ['r18', 'r19'],
    row: 5,
    col: 1,
  },
  {
    id: 'r16',
    clue: 'Synthetic fibre once prized for stockings',
    answer: 'NYLON',
    next: ['r18', 'r19'],
    row: 5,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r17',
    clue: 'Shaggy wild ox of the North American plains',
    answer: 'BISON',
    next: ['r19', 'r20'],
    row: 5,
    col: 5,
  },

  // ── Depth 6 ────────────────────────────────────────────────────────
  {
    id: 'r18',
    clue: "Garment tied on to protect a cook's clothes",
    answer: 'APRON',
    next: ['r21', 'r22'],
    row: 6,
    col: 1,
  },
  {
    id: 'r19',
    clue: 'Member of the nobility ranking just below a viscount',
    answer: 'BARON',
    next: ['r21', 'r22'],
    row: 6,
    col: 3,
  },
  {
    id: 'r20',
    clue: 'Person convicted of a serious crime',
    answer: 'FELON',
    next: ['r22', 'r23'],
    row: 6,
    col: 5,
  },

  // ── Depth 7 ────────────────────────────────────────────────────────
  {
    id: 'r21',
    clue: 'Bricklayer — or a member of a secretive fraternal order',
    answer: 'MASON',
    next: ['r24', 'r25'],
    row: 7,
    col: 1,
  },
  {
    id: 'r22',
    clue: 'Place of confinement for convicts',
    answer: 'PRISON',
    next: ['r24', 'r25'],
    row: 7,
    col: 3,
    metaLetterIndex: 1, // R
  },
  {
    id: 'r23',
    clue: 'Large non-venomous constricting snake',
    answer: 'PYTHON',
    next: ['r25', 'r26'],
    row: 7,
    col: 5,
  },

  // ── Depth 8 ────────────────────────────────────────────────────────
  {
    id: 'r24',
    clue: 'Seasonal wind that brings heavy rains to South Asia',
    answer: 'MONSOON',
    next: ['r27', 'r28'],
    row: 8,
    col: 1,
  },
  {
    id: 'r25',
    clue: 'Cord of fibrous tissue joining muscle to bone',
    answer: 'TENDON',
    next: ['r27', 'r28'],
    row: 8,
    col: 3,
    metaLetterIndex: 0, // T
  },
  {
    id: 'r26',
    clue: 'Sour yellow citrus fruit',
    answer: 'LEMON',
    next: ['r28'],
    row: 8,
    col: 5,
    metaLetterIndex: 1, // E
  },

  // ── Depth 9 ────────────────────────────────────────────────────────
  {
    id: 'r27',
    clue: 'Cured pork served in rashers at breakfast',
    answer: 'BACON',
    next: ['r29'],
    row: 9,
    col: 2,
  },
  {
    id: 'r28',
    clue: 'Four-wheeled cart pulled by a horse or ox',
    answer: 'WAGON',
    next: ['r29'],
    row: 9,
    col: 4,
  },

  // ── Depth 10 — final (hardest) ─────────────────────────────────────
  {
    id: 'r29',
    clue: 'Round green or orange fruit of a vine in the gourd family',
    answer: 'MELON',
    next: [],
    row: 10,
    col: 3,
    isFinal: true,
  },
];

export const LEVEL_1: Level = {
  id: 'level-1',
  title: "The Explorer's Labyrinth",
  subtitle: 'Solve a path of clues from the entrances to the final chamber.',
  rooms,
  startRoomIds: ['r0', 'r1', 'r2'],
  finalRoomId: 'r29',
  meta: {
    answer: 'TREASURE',
    prompt:
      'No clue here — only the blue letters scattered through the maze. Gather every one (no single path holds them all) and rearrange them into one word: what every explorer seeks. (8)',
    hint: "It's an anagram of all eight blue letters. X marks the spot.",
  },
};

/**
 * Level 2 — "The Cryptographer's Vault"
 *
 * 30 rooms across 11 depths. The clues are genuine cryptic crossword clues:
 * each pairs a definition (at the start or end) with wordplay — anagrams,
 * charades, containers, hidden words, double definitions and homophones — and
 * closes with the enumeration in parentheses.
 *
 * The answers interlock on the "-AR-" / "-RA-" / "-AGE" letter families so
 * every room shares a guaranteed bridge with all of its successors, and every
 * answer in the level is distinct.
 *
 * The eight blue letters spell the theme of the whole level once unscrambled.
 */

const rooms2: Room[] = [
  // ── Depth 0 — starts ───────────────────────────────────────────────
  {
    id: 'q0',
    clue: "Traveller's home tucked inside masCARA VANity case (7)",
    answer: 'CARAVAN',
    next: ['q3', 'q4'],
    row: 0,
    col: 1,
    metaLetterIndex: 1, // A
  },
  {
    id: 'q1',
    clue: 'Trap drum (5)',
    answer: 'SNARE',
    next: ['q4', 'q5'],
    row: 0,
    col: 3,
    metaLetterIndex: 0, // S
  },
  {
    id: 'q2',
    clue: 'Magnificent piano (5)',
    answer: 'GRAND',
    next: ['q5'],
    row: 0,
    col: 5,
    metaLetterIndex: 0, // G
  },

  // ── Depth 1 ────────────────────────────────────────────────────────
  {
    id: 'q3',
    clue: 'Yellow bird — a singer, in slang (6)',
    answer: 'CANARY',
    next: ['q6', 'q7'],
    row: 1,
    col: 1,
    metaLetterIndex: 1, // A
  },
  {
    id: 'q4',
    clue: 'Surprise young actress, oddly cast (7)',
    answer: 'STARTLE',
    next: ['q7', 'q8'],
    row: 1,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'q5',
    clue: 'Tracking system that reads the same backwards (5)',
    answer: 'RADAR',
    next: ['q8'],
    row: 1,
    col: 5,
  },

  // ── Depth 2 ────────────────────────────────────────────────────────
  {
    id: 'q6',
    clue: "Car's home: a fury follows good (6)",
    answer: 'GARAGE',
    next: ['q9', 'q10'],
    row: 2,
    col: 1,
    metaLetterIndex: 1, // A
  },
  {
    id: 'q7',
    clue: 'Rush to bill the cavalry (6)',
    answer: 'CHARGE',
    next: ['q10', 'q11'],
    row: 2,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'q8',
    clue: 'Show off a drape, fluttering (6)',
    answer: 'PARADE',
    next: ['q11'],
    row: 2,
    col: 5,
  },

  // ── Depth 3 ────────────────────────────────────────────────────────
  {
    id: 'q9',
    clue: 'Defensive wall: butt joins role (7)',
    answer: 'RAMPART',
    next: ['q12', 'q13'],
    row: 3,
    col: 1,
    metaLetterIndex: 2, // M
  },
  {
    id: 'q10',
    clue: 'Bombardment from pub fury (7)',
    answer: 'BARRAGE',
    next: ['q13', 'q14'],
    row: 3,
    col: 3,
  },
  {
    id: 'q11',
    clue: 'Portion of stock (5)',
    answer: 'SHARE',
    next: ['q14'],
    row: 3,
    col: 5,
  },

  // ── Depth 4 ────────────────────────────────────────────────────────
  {
    id: 'q12',
    clue: "Guessing game: burnt remains framing a German 'the' (7)",
    answer: 'CHARADE',
    next: ['q15', 'q16'],
    row: 4,
    col: 1,
    powerUp: 'reveal',
  },
  {
    id: 'q13',
    clue: 'Extra pears, cooked (5)',
    answer: 'SPARE',
    next: ['q16', 'q17'],
    row: 4,
    col: 3,
  },
  {
    id: 'q14',
    clue: 'Covered walk built from a cadre, novel (6)',
    answer: 'ARCADE',
    next: ['q17'],
    row: 4,
    col: 5,
  },

  // ── Depth 5 ────────────────────────────────────────────────────────
  {
    id: 'q15',
    clue: "Flat-bottomed boat — or to shove one's way in (5)",
    answer: 'BARGE',
    next: ['q18', 'q19'],
    row: 5,
    col: 1,
  },
  {
    id: 'q16',
    clue: 'A weapon for a relative — quite a fleet (6)',
    answer: 'ARMADA',
    next: ['q19', 'q20'],
    row: 5,
    col: 3,
  },
  {
    id: 'q17',
    clue: 'Slaughter when gran, ace, runs amok (7)',
    answer: 'CARNAGE',
    next: ['q20'],
    row: 5,
    col: 5,
    metaLetterIndex: 3, // N
  },

  // ── Depth 6 ────────────────────────────────────────────────────────
  {
    id: 'q18',
    clue: 'Floral wreath — Judy of Oz fame (7)',
    answer: 'GARLAND',
    next: ['q21', 'q22'],
    row: 6,
    col: 1,
    powerUp: 'reveal',
  },
  {
    id: 'q19',
    clue: 'Bitter preserve a dram, ale and mixer turn into (9)',
    answer: 'MARMALADE',
    next: ['q22', 'q23'],
    row: 6,
    col: 3,
  },
  {
    id: 'q20',
    clue: 'Rinse the throat — good, large blend (6)',
    answer: 'GARGLE',
    next: ['q23'],
    row: 6,
    col: 5,
  },

  // ── Depth 7 ────────────────────────────────────────────────────────
  {
    id: 'q21',
    clue: 'Coronet from a Spanish aunt and sun god (5)',
    answer: 'TIARA',
    next: ['q24', 'q25'],
    row: 7,
    col: 1,
  },
  {
    id: 'q22',
    clue: 'Grain store where gran keeps a railway (7)',
    answer: 'GRANARY',
    next: ['q25', 'q26'],
    row: 7,
    col: 3,
  },
  {
    id: 'q23',
    clue: "Ship's-hull clinger from a scrubbed clean bar (8)",
    answer: 'BARNACLE',
    next: ['q26'],
    row: 7,
    col: 5,
  },

  // ── Depth 8 ────────────────────────────────────────────────────────
  {
    id: 'q24',
    clue: 'Bravery needed to free our cage, somehow (7)',
    answer: 'COURAGE',
    next: ['q27', 'q28'],
    row: 8,
    col: 1,
    powerUp: 'reveal',
  },
  {
    id: 'q25',
    clue: 'Make a mark on cattle (5)',
    answer: 'BRAND',
    next: ['q28'],
    row: 8,
    col: 3,
  },
  {
    id: 'q26',
    clue: 'Sunshade for a trooper following the sun (7)',
    answer: 'PARASOL',
    next: ['q28'],
    row: 8,
    col: 5,
  },

  // ── Depth 9 ────────────────────────────────────────────────────────
  {
    id: 'q27',
    clue: 'Union of aria and germ, oddly arranged (8)',
    answer: 'MARRIAGE',
    next: ['q29'],
    row: 9,
    col: 1,
    metaLetterIndex: 2, // R
  },
  {
    id: 'q28',
    clue: 'Fashionable fury (4)',
    answer: 'RAGE',
    next: ['q29'],
    row: 9,
    col: 3,
  },

  // ── Depth 10 — final (toughest) ────────────────────────────────────
  {
    id: 'q29',
    clue: 'Crossing the years, a permit grants time — and a way through (7)',
    answer: 'PASSAGE',
    next: [],
    row: 10,
    col: 2,
    isFinal: true,
  },
];

export const LEVEL_2: Level = {
  id: 'level-2',
  title: "The Cryptographer's Vault",
  subtitle: 'Crack the cryptic clues, then decode the eight blue letters.',
  rooms: rooms2,
  startRoomIds: ['q0', 'q1', 'q2'],
  finalRoomId: 'q29',
  meta: {
    answer: 'ANAGRAMS',
    prompt:
      "The vault's keyword is hidden, fittingly, in scrambled form. Collect every blue letter (no single route through the vault holds them all) and rearrange them — the device a setter loves best. (8)",
    hint: 'Eight letters, and the answer describes exactly what you must do to them.',
  },
};

export const LEVELS: Level[] = [LEVEL_1, LEVEL_2];
