import type { Level, Room } from './types';

/**
 * Level 1 — "The Explorer's Labyrinth"
 *
 * 30 rooms laid out as a Slay-the-Spire-style DAG across 11 depths (rows
 * 0..10). Every non-final room shares a guaranteed 2-letter bridge with ALL of
 * its successors (validated by scripts/validateLevels.ts and
 * src/game/bridges.ts). Every answer in the level is distinct.
 *
 * The level is built on a "bigram ladder": each depth transition d -> d+1 is
 * guaranteed by a DIFFERENT overlapping bigram, so the hinted pair changes as
 * you climb. The ladder is:
 *
 *   AR · RE · ED · DI · IN · NE · ER · RA · AN · ND
 *
 * Each interior depth's words contain the overlapping trigram of its incoming
 * and outgoing bigrams (e.g. between RE and ED -> "RED": HUNDRED, KINDRED…).
 *
 * The eight blue letters scattered across the depths anagram to MARINERS.
 */

const rooms: Room[] = [
  // ── Depth 0 — starts — bigram AR ───────────────────────────────────
  {
    id: 'r0',
    clue: 'Place where goods are bought and sold; a bazaar',
    answer: 'MARKET',
    next: ['r3', 'r4'],
    row: 0,
    col: 1,
    metaLetterIndex: 0, // M
  },
  {
    id: 'r1',
    clue: 'Cultivated plot for growing flowers or vegetables',
    answer: 'GARDEN',
    next: ['r4', 'r5'],
    row: 0,
    col: 3,
    metaLetterIndex: 1, // A
    powerUp: 'reveal',
  },
  {
    id: 'r2',
    clue: 'The gathering in of ripened crops at the end of summer',
    answer: 'HARVEST',
    next: ['r4', 'r5'],
    row: 0,
    col: 5,
  },

  // ── Depth 1 — trigram ARE (AR -> RE) ───────────────────────────────
  {
    id: 'r3',
    clue: 'Four-sided figure with equal sides and right angles',
    answer: 'SQUARE',
    next: ['r6', 'r7'],
    row: 1,
    col: 1,
    metaLetterIndex: 0, // S
  },
  {
    id: 'r4',
    clue: 'To examine two things to note likeness or difference',
    answer: 'COMPARE',
    next: ['r6', 'r7'],
    row: 1,
    col: 3,
  },
  {
    id: 'r5',
    clue: 'To make ready in advance',
    answer: 'PREPARE',
    next: ['r7', 'r8'],
    row: 1,
    col: 5,
    metaLetterIndex: 1, // R
  },

  // ── Depth 2 — trigram RED (RE -> ED) ───────────────────────────────
  {
    id: 'r6',
    clue: 'The number that follows ninety-nine',
    answer: 'HUNDRED',
    next: ['r9', 'r10'],
    row: 2,
    col: 1,
  },
  {
    id: 'r7',
    clue: "Related by blood; one's family and relatives",
    answer: 'KINDRED',
    next: ['r9', 'r10'],
    row: 2,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r8',
    clue: 'Intense dislike or loathing',
    answer: 'HATRED',
    next: ['r10', 'r11'],
    row: 2,
    col: 5,
  },

  // ── Depth 3 — trigram EDI (ED -> DI) ───────────────────────────────
  {
    id: 'r9',
    clue: 'A performer who makes audiences laugh',
    answer: 'COMEDIAN',
    next: ['r12', 'r13'],
    row: 3,
    col: 1,
  },
  {
    id: 'r10',
    clue: 'Of the Middle Ages, between antiquity and the Renaissance',
    answer: 'MEDIEVAL',
    next: ['r12', 'r13'],
    row: 3,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r11',
    clue: 'Dutifully doing as one is told',
    answer: 'OBEDIENT',
    next: ['r13', 'r14'],
    row: 3,
    col: 5,
  },

  // ── Depth 4 — trigram DIN (DI -> IN) ───────────────────────────────
  {
    id: 'r12',
    clue: 'A soft steamed or baked dessert, such as the Christmas kind',
    answer: 'PUDDING',
    next: ['r15', 'r16'],
    row: 4,
    col: 1,
  },
  {
    id: 'r13',
    clue: 'The act of taking in the meaning of written words',
    answer: 'READING',
    next: ['r15', 'r16'],
    row: 4,
    col: 3,
  },
  {
    id: 'r14',
    clue: 'A structure with walls and a roof, such as a house or office',
    answer: 'BUILDING',
    next: ['r16', 'r17'],
    row: 4,
    col: 5,
    metaLetterIndex: 2, // I
  },

  // ── Depth 5 — trigram INE (IN -> NE) ───────────────────────────────
  {
    id: 'r15',
    clue: 'A device that performs work, such as an engine',
    answer: 'MACHINE',
    next: ['r18', 'r19'],
    row: 5,
    col: 1,
  },
  {
    id: 'r16',
    clue: 'A small oily fish often packed in tins',
    answer: 'SARDINE',
    next: ['r18', 'r19'],
    row: 5,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'r17',
    clue: 'A drug or other substance taken to treat illness',
    answer: 'MEDICINE',
    next: ['r19', 'r20'],
    row: 5,
    col: 5,
  },

  // ── Depth 6 — trigram NER (NE -> ER) ───────────────────────────────
  {
    id: 'r18',
    clue: 'The main evening meal of the day',
    answer: 'DINNER',
    next: ['r21', 'r22'],
    row: 6,
    col: 1,
  },
  {
    id: 'r19',
    clue: 'A length of cloth bearing a slogan, flown or carried aloft',
    answer: 'BANNER',
    next: ['r21', 'r22'],
    row: 6,
    col: 3,
    metaLetterIndex: 2, // N
  },
  {
    id: 'r20',
    clue: 'The person who comes first in a contest',
    answer: 'WINNER',
    next: ['r22', 'r23'],
    row: 6,
    col: 5,
  },

  // ── Depth 7 — trigram ERA (ER -> RA) ───────────────────────────────
  {
    id: 'r21',
    clue: 'A high-ranking army officer, above a colonel',
    answer: 'GENERAL',
    next: ['r24', 'r25'],
    row: 7,
    col: 1,
  },
  {
    id: 'r22',
    clue: 'To carry out a task or run a machine',
    answer: 'OPERATE',
    next: ['r24', 'r25'],
    row: 7,
    col: 3,
    metaLetterIndex: 2, // E
  },
  {
    id: 'r23',
    clue: 'Taken word for word; the exact meaning of the text',
    answer: 'LITERAL',
    next: ['r25', 'r26'],
    row: 7,
    col: 5,
  },

  // ── Depth 8 — trigram RAN (RA -> AN) ───────────────────────────────
  {
    id: 'r24',
    clue: 'A round citrus fruit, and a colour between red and yellow',
    answer: 'ORANGE',
    next: ['r27', 'r28'],
    row: 8,
    col: 1,
  },
  {
    id: 'r25',
    clue: 'A very hard speckled rock used for kitchen worktops',
    answer: 'GRANITE',
    next: ['r27', 'r28'],
    row: 8,
    col: 3,
  },
  {
    id: 'r26',
    clue: 'European country whose capital is Paris',
    answer: 'FRANCE',
    next: ['r28'],
    row: 8,
    col: 5,
    metaLetterIndex: 1, // R
  },

  // ── Depth 9 — trigram AND (AN -> ND) ───────────────────────────────
  {
    id: 'r27',
    clue: 'Nordic island nation of volcanoes and geysers',
    answer: 'ICELAND',
    next: ['r29'],
    row: 9,
    col: 2,
  },
  {
    id: 'r28',
    clue: 'A wreath or string of flowers worn or hung as decoration',
    answer: 'GARLAND',
    next: ['r29'],
    row: 9,
    col: 4,
    powerUp: 'reveal',
  },

  // ── Depth 10 — final — bigram ND ───────────────────────────────────
  {
    id: 'r29',
    clue: 'A piece of land entirely surrounded by water',
    answer: 'ISLAND',
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
    answer: 'MARINERS',
    prompt:
      'No clue here — only the blue letters scattered through the maze. Gather every one (no single path holds them all) and rearrange them into one word: the seafarers who chart the unknown. (8)',
    hint: "It's an anagram of all eight blue letters — sailors who brave the open ocean.",
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
 * The vault runs on a bigram ladder so each depth guarantees a DIFFERENT pair:
 *
 *   RE · EA · AR · RA · AN · ND · DE · EN · NT · TE
 *
 * Each interior depth's answers carry the overlapping trigram of its incoming
 * and outgoing bigrams. Every answer in the level is distinct.
 *
 * The eight blue letters spell the theme of the whole level once unscrambled.
 */

const rooms2: Room[] = [
  // ── Depth 0 — starts — bigram RE ───────────────────────────────────
  {
    id: 'q0',
    clue: 'Go back, like a turner spinning around (6)',
    answer: 'RETURN',
    next: ['q3', 'q4'],
    row: 0,
    col: 1,
    metaLetterIndex: 1, // E
  },
  {
    id: 'q1',
    clue: 'Disclose a lever, broken apart (6)',
    answer: 'REVEAL',
    next: ['q4', 'q5'],
    row: 0,
    col: 3,
    metaLetterIndex: 0, // R
  },
  {
    id: 'q2',
    clue: 'Area of land one might ignore, surprisingly (6)',
    answer: 'REGION',
    next: ['q5'],
    row: 0,
    col: 5,
  },

  // ── Depth 1 — trigram REA (RE -> EA) ───────────────────────────────
  {
    id: 'q3',
    clue: 'Loaf shaped from a beard, oddly (5)',
    answer: 'BREAD',
    next: ['q6', 'q7'],
    row: 1,
    col: 1,
  },
  {
    id: 'q4',
    clue: 'Fantasy of being armed, riotously (5)',
    answer: 'DREAM',
    next: ['q7', 'q8'],
    row: 1,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'q5',
    clue: 'Bring into being a crate, rebuilt with energy (6)',
    answer: 'CREATE',
    next: ['q8'],
    row: 1,
    col: 5,
    metaLetterIndex: 0, // C
  },

  // ── Depth 2 — trigram EAR (EA -> AR) ───────────────────────────────
  {
    id: 'q6',
    clue: 'Centre of the matter, the seat of the emotions (5)',
    answer: 'HEART',
    next: ['q9', 'q10'],
    row: 2,
    col: 1,
    metaLetterIndex: 0, // H
  },
  {
    id: 'q7',
    clue: 'Come to know a nearly endless lane (5)',
    answer: 'LEARN',
    next: ['q10', 'q11'],
    row: 2,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'q8',
    clue: 'Hunt down a chaser running loose (6)',
    answer: 'SEARCH',
    next: ['q11'],
    row: 2,
    col: 5,
  },

  // ── Depth 3 — trigram ARA (AR -> RA) ───────────────────────────────
  {
    id: 'q9',
    clue: 'A drape, swirling, makes a procession (6)',
    answer: 'PARADE',
    next: ['q12', 'q13'],
    row: 3,
    col: 1,
    metaLetterIndex: 0, // P
  },
  {
    id: 'q10',
    clue: "Car's home: a fury follows good (6)",
    answer: 'GARAGE',
    next: ['q13', 'q14'],
    row: 3,
    col: 3,
  },
  {
    id: 'q11',
    clue: 'A van car, rebuilt for the travelling home (7)',
    answer: 'CARAVAN',
    next: ['q14'],
    row: 3,
    col: 5,
  },

  // ── Depth 4 — trigram RAN (RA -> AN) ───────────────────────────────
  {
    id: 'q12',
    clue: 'Magnificent piano (5)',
    answer: 'GRAND',
    next: ['q15', 'q16'],
    row: 4,
    col: 1,
    powerUp: 'reveal',
  },
  {
    id: 'q13',
    clue: 'Fruit from an onager, oddly mashed (6)',
    answer: 'ORANGE',
    next: ['q16', 'q17'],
    row: 4,
    col: 3,
  },
  {
    id: 'q14',
    clue: 'European country: fine crane, rebuilt (6)',
    answer: 'FRANCE',
    next: ['q17'],
    row: 4,
    col: 5,
  },

  // ── Depth 5 — trigram AND (AN -> ND) ───────────────────────────────
  {
    id: 'q15',
    clue: 'Land in the sea found within his landscape (6)',
    answer: 'ISLAND',
    next: ['q18', 'q19'],
    row: 5,
    col: 1,
    metaLetterIndex: 0, // I
  },
  {
    id: 'q16',
    clue: 'Floral wreath: a raglan, tailored, edged with depth (7)',
    answer: 'GARLAND',
    next: ['q19', 'q20'],
    row: 5,
    col: 3,
  },
  {
    id: 'q17',
    clue: 'Forcefully insist, fit to madden when upset (6)',
    answer: 'DEMAND',
    next: ['q20'],
    row: 5,
    col: 5,
    metaLetterIndex: 0, // D
  },

  // ── Depth 6 — trigram NDE (ND -> DE) ───────────────────────────────
  {
    id: 'q18',
    clue: 'Below, seen in run-derelict housing (5)',
    answer: 'UNDER',
    next: ['q21', 'q22'],
    row: 6,
    col: 1,
  },
  {
    id: 'q19',
    clue: 'Marvel at a real downer, surprisingly (6)',
    answer: 'WONDER',
    next: ['q22', 'q23'],
    row: 6,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'q20',
    clue: 'Slim and graceful son, a lender at sea (7)',
    answer: 'SLENDER',
    next: ['q23'],
    row: 6,
    col: 5,
  },

  // ── Depth 7 — trigram DEN (DE -> EN) ───────────────────────────────
  {
    id: 'q21',
    clue: 'Where flowers grow, in danger of being dug up (6)',
    answer: 'GARDEN',
    next: ['q24', 'q25'],
    row: 7,
    col: 1,
  },
  {
    id: 'q22',
    clue: 'Abrupt shift of dunes, then depth (6)',
    answer: 'SUDDEN',
    next: ['q24', 'q25'],
    row: 7,
    col: 3,
  },
  {
    id: 'q23',
    clue: 'Coloured like the precious metal, a lodge newly built (6)',
    answer: 'GOLDEN',
    next: ['q26'],
    row: 7,
    col: 5,
  },

  // ── Depth 8 — trigram ENT (EN -> NT) ───────────────────────────────
  {
    id: 'q24',
    clue: 'Kind and mild, a leg net reshaped (6)',
    answer: 'GENTLE',
    next: ['q27', 'q28'],
    row: 8,
    col: 1,
    metaLetterIndex: 1, // E
  },
  {
    id: 'q25',
    clue: 'Bond firmly, picked out in office men talking (6)',
    answer: 'CEMENT',
    next: ['q28'],
    row: 8,
    col: 3,
  },
  {
    id: 'q26',
    clue: 'A pet ran wild — mum or dad (6)',
    answer: 'PARENT',
    next: ['q28'],
    row: 8,
    col: 5,
  },

  // ── Depth 9 — trigram NTE (NT -> TE) ───────────────────────────────
  {
    id: 'q27',
    clue: 'Cold season hidden in a slow interval (6)',
    answer: 'WINTER',
    next: ['q29'],
    row: 9,
    col: 1,
  },
  {
    id: 'q28',
    clue: 'Plan to have tinned, oddly processed (6)',
    answer: 'INTEND',
    next: ['q29'],
    row: 9,
    col: 3,
  },

  // ── Depth 10 — final — bigram TE ───────────────────────────────────
  {
    id: 'q29',
    clue: 'Fearsome beast — mentors running riot (7)',
    answer: 'MONSTER',
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
    answer: 'CIPHERED',
    prompt:
      "The vault's keyword is itself encrypted. Collect every blue letter (no single route through the vault holds them all) and rearrange them — what a secret message has been. (8)",
    hint: 'Eight letters: a single word meaning encoded or enciphered.',
  },
};

/**
 * Level 3 — "The Wordsmith's Gauntlet"
 *
 * 30 rooms across 11 depths — a general-knowledge crossword with a mix of
 * single-word and multi-word answers (stored spaceless, with an `enumeration`
 * giving the word lengths). The clues are straight, definitional crossword
 * clues, not cryptic. There are ten multi-word answers.
 *
 * The grid runs on a bigram ladder so each depth guarantees a DIFFERENT pair:
 *
 *   EA · AT · TE · ER · RA · AN · ND · DE · EN · NT
 *
 * Each interior depth's answers carry the overlapping trigram of its incoming
 * and outgoing bigrams. Every answer in the grid is distinct.
 *
 * The eight blue letters scattered across the depths anagram to TEA HOUSE.
 */

const rooms3: Room[] = [
  // ── Depth 0 — starts — bigram EA ───────────────────────────────────
  {
    id: 'm0',
    clue: 'Tiny upright-swimming fish whose males carry the young',
    answer: 'SEAHORSE',
    next: ['m3', 'm4'],
    row: 0,
    col: 1,
    metaLetterIndex: 1, // E
  },
  {
    id: 'm1',
    clue: 'Glacial period when much of the Earth was frozen (3,3)',
    answer: 'ICEAGE',
    enumeration: [3, 3],
    next: ['m4', 'm5'],
    row: 0,
    col: 3,
    powerUp: 'reveal',
    metaLetterIndex: 3, // A
  },
  {
    id: 'm2',
    clue: 'Small porous sachet you steep in hot water for a brew (3,3)',
    answer: 'TEABAG',
    enumeration: [3, 3],
    next: ['m5'],
    row: 0,
    col: 5,
    metaLetterIndex: 0, // T
  },

  // ── Depth 1 — trigram EAT (EA -> AT) ───────────────────────────────
  {
    id: 'm3',
    clue: 'A knitted woollen pullover',
    answer: 'SWEATER',
    next: ['m6', 'm7'],
    row: 1,
    col: 1,
  },
  {
    id: 'm4',
    clue: 'A playhouse where dramas are staged',
    answer: 'THEATRE',
    next: ['m6', 'm7'],
    row: 1,
    col: 3,
  },
  {
    id: 'm5',
    clue: 'Long fortification winding across northern China (5,4)',
    answer: 'GREATWALL',
    enumeration: [5, 4],
    next: ['m7', 'm8'],
    row: 1,
    col: 5,
  },

  // ── Depth 2 — trigram ATE (AT -> TE) ───────────────────────────────
  {
    id: 'm6',
    clue: 'A flat dish from which food is eaten',
    answer: 'PLATE',
    next: ['m9', 'm10'],
    row: 2,
    col: 1,
  },
  {
    id: 'm7',
    clue: 'Sweet brown confection made from cocoa',
    answer: 'CHOCOLATE',
    next: ['m9', 'm10'],
    row: 2,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'm8',
    clue: 'A romantic evening out for a couple (4,5)',
    answer: 'DATENIGHT',
    enumeration: [4, 5],
    next: ['m10', 'm11'],
    row: 2,
    col: 5,
  },

  // ── Depth 3 — trigram TER (TE -> ER) ───────────────────────────────
  {
    id: 'm9',
    clue: 'The clear liquid that falls as rain and fills the seas',
    answer: 'WATER',
    next: ['m12', 'm13'],
    row: 3,
    col: 1,
  },
  {
    id: 'm10',
    clue: 'An electronic machine for storing and processing data',
    answer: 'COMPUTER',
    next: ['m12', 'm13'],
    row: 3,
    col: 3,
  },
  {
    id: 'm11',
    clue: 'A steep, slippery chute splashed down at a pool (5,5)',
    answer: 'WATERSLIDE',
    enumeration: [5, 5],
    next: ['m13', 'm14'],
    row: 3,
    col: 5,
  },

  // ── Depth 4 — trigram ERA (ER -> RA) ───────────────────────────────
  {
    id: 'm12',
    clue: 'A high-ranking army officer, above a colonel',
    answer: 'GENERAL',
    next: ['m15', 'm16'],
    row: 4,
    col: 1,
  },
  {
    id: 'm13',
    clue: 'A device for taking photographs',
    answer: 'CAMERA',
    next: ['m15', 'm16'],
    row: 4,
    col: 3,
    powerUp: 'reveal',
  },
  {
    id: 'm14',
    clue: 'A grand theatre where singers perform staged drama (5,5)',
    answer: 'OPERAHOUSE',
    enumeration: [5, 5],
    next: ['m16', 'm17'],
    row: 4,
    col: 5,
    metaLetterIndex: 5, // H
  },

  // ── Depth 5 — trigram RAN (RA -> AN) ───────────────────────────────
  {
    id: 'm15',
    clue: 'A round citrus fruit, and a colour between red and yellow',
    answer: 'ORANGE',
    next: ['m18', 'm19'],
    row: 5,
    col: 1,
  },
  {
    id: 'm16',
    clue: 'European country whose capital is Paris',
    answer: 'FRANCE',
    next: ['m18', 'm19'],
    row: 5,
    col: 3,
  },
  {
    id: 'm17',
    clue: 'A large keyboard instrument with a horizontal frame (5,5)',
    answer: 'GRANDPIANO',
    enumeration: [5, 5],
    next: ['m19', 'm20'],
    row: 5,
    col: 5,
  },

  // ── Depth 6 — trigram AND (AN -> ND) ───────────────────────────────
  {
    id: 'm18',
    clue: 'A piece of land entirely surrounded by water',
    answer: 'ISLAND',
    next: ['m21', 'm22'],
    row: 6,
    col: 1,
  },
  {
    id: 'm19',
    clue: 'To firmly insist on something as a right',
    answer: 'DEMAND',
    next: ['m21', 'm22'],
    row: 6,
    col: 3,
  },
  {
    id: 'm20',
    clue: 'A clean sweep of all four major tennis titles (5,4)',
    answer: 'GRANDSLAM',
    enumeration: [5, 4],
    next: ['m22', 'm23'],
    row: 6,
    col: 5,
  },

  // ── Depth 7 — trigram NDE (ND -> DE) ───────────────────────────────
  {
    id: 'm21',
    clue: 'Beneath; in a lower position than',
    answer: 'UNDER',
    next: ['m24', 'm25'],
    row: 7,
    col: 1,
    metaLetterIndex: 0, // U
  },
  {
    id: 'm22',
    clue: 'To feel curiosity or amazement',
    answer: 'WONDER',
    next: ['m24', 'm25'],
    row: 7,
    col: 3,
    metaLetterIndex: 1, // O
  },
  {
    id: 'm23',
    clue: 'A competitor not expected to win (5,3)',
    answer: 'UNDERDOG',
    enumeration: [5, 3],
    next: ['m25', 'm26'],
    row: 7,
    col: 5,
  },

  // ── Depth 8 — trigram DEN (DE -> EN) ───────────────────────────────
  {
    id: 'm24',
    clue: 'A cultivated plot for growing flowers or vegetables',
    answer: 'GARDEN',
    next: ['m27', 'm28'],
    row: 8,
    col: 1,
  },
  {
    id: 'm25',
    clue: 'Happening quickly and without warning',
    answer: 'SUDDEN',
    next: ['m27', 'm28'],
    row: 8,
    col: 3,
    metaLetterIndex: 0, // S
  },
  {
    id: 'm26',
    clue: 'A small ornamental figure placed among the flowerbeds (6,5)',
    answer: 'GARDENGNOME',
    enumeration: [6, 5],
    next: ['m28'],
    row: 8,
    col: 5,
  },

  // ── Depth 9 — trigram ENT (EN -> NT) ───────────────────────────────
  {
    id: 'm27',
    clue: 'A mother or father',
    answer: 'PARENT',
    next: ['m29'],
    row: 9,
    col: 2,
    metaLetterIndex: 3, // E
  },
  {
    id: 'm28',
    clue: 'Satisfied and at ease; happily untroubled',
    answer: 'CONTENT',
    next: ['m29'],
    row: 9,
    col: 4,
    powerUp: 'reveal',
  },

  // ── Depth 10 — final — bigram NT ───────────────────────────────────
  {
    id: 'm29',
    clue: 'The largest living land animal, with a trunk and tusks',
    answer: 'ELEPHANT',
    next: [],
    row: 10,
    col: 3,
    isFinal: true,
  },
];

export const LEVEL_3: Level = {
  id: 'level-3',
  title: "The Wordsmith's Gauntlet",
  subtitle: 'A full crossword of single and multi-word answers, then the meta.',
  rooms: rooms3,
  startRoomIds: ['m0', 'm1', 'm2'],
  finalRoomId: 'm29',
  meta: {
    answer: 'TEAHOUSE',
    enumeration: [3, 5],
    prompt:
      'Gather every blue letter (no single path holds them all) and rearrange the eight into a two-word phrase: an East Asian establishment where a hot brew is served. (3,5)',
    hint: 'An anagram of the blue letters — a place to sip a calming cup.',
  },
};

export const LEVELS: Level[] = [LEVEL_1, LEVEL_2, LEVEL_3];
