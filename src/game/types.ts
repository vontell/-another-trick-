export type PowerUp = 'reveal' | 'vowel';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Extra Hard';

/**
 * A single room in the maze. A room is one crossword/cryptic clue.
 * Answers are stored uppercase with no spaces (length = number of squares).
 */
export interface Room {
  id: string;
  /** The clue shown to the player, e.g. "19th century inventor of the lightbulb". */
  clue: string;
  /** The answer, uppercase, letters only. Its length is the number of squares. */
  answer: string;
  /**
   * Word lengths for a multi-word answer, e.g. [3, 3] for "ICE AGE" (whose
   * answer is stored as "ICEAGE"). Must sum to answer.length. Drives the gaps
   * in the grid and the "(3,3)" enumeration. Omit for a single word.
   */
  enumeration?: number[];
  /** IDs of rooms that open when this room is solved. */
  next: string[];
  /** Layout: column index (for map rendering). */
  col: number;
  /** Layout: row / depth index (for map rendering). */
  row: number;
  /** Power-up awarded if solved on the first try. */
  powerUp?: PowerUp;
  /**
   * Index of a letter collected into the meta-puzzle bank when solved.
   * Rendered as a blue square.
   */
  metaLetterIndex?: number;
  /** Marks the final (hardest) room of the level. */
  isFinal?: boolean;
}

/** A room with its derived bridge attached (computed at load time). */
export interface ResolvedRoom extends Room {
  /**
   * The guaranteed 2-letter bridge: a [startIndex, length=2] window into this
   * room's answer. Every successor room's answer is guaranteed to contain this
   * exact bigram. Revealed (outlined) to the player after the room is solved.
   * Undefined for the final room (no successors).
   */
  bridge?: { start: number; text: string };
}

export interface Level {
  id: string;
  /** ISO date (YYYY-MM-DD) for a daily puzzle. */
  date?: string;
  title: string;
  subtitle: string;
  /** Overall maze difficulty, NYT-crossword style. */
  difficulty: Difficulty;
  rooms: Room[];
  /** Rooms unlocked from the start. */
  startRoomIds: string[];
  finalRoomId: string;
  meta: {
    /** The meta answer, uppercase, letters only. */
    answer: string;
    /** Word lengths for a multi-word meta answer (sums to answer.length). */
    enumeration?: number[];
    /** Prompt/theme shown for the meta puzzle (it has no clue of its own). */
    prompt: string;
    /** Optional softer hint. */
    hint?: string;
  };
}

export interface ResolvedLevel extends Omit<Level, 'rooms'> {
  rooms: ResolvedRoom[];
}
