import type { Level, ResolvedLevel, ResolvedRoom, Room } from './types';

export function normalize(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, '');
}

/** Crossword-style enumeration, e.g. [3,3] -> "(3,3)", undefined -> "(6)". */
export function enumerationText(answer: string, enumeration?: number[]): string {
  return `(${(enumeration ?? [answer.length]).join(',')})`;
}

interface Bigram {
  start: number;
  text: string;
}

function bigrams(answer: string): Bigram[] {
  const out: Bigram[] = [];
  for (let i = 0; i < answer.length - 1; i++) {
    out.push({ start: i, text: answer.slice(i, i + 2) });
  }
  return out;
}

/**
 * Pick the guaranteed 2-letter bridge for a room: the first bigram of its
 * answer that also appears in every successor's answer. Returns undefined if
 * no such bigram exists (a content error — caught by validateLevel).
 */
export function pickBridge(
  room: Room,
  successors: Room[],
): { start: number; text: string } | undefined {
  if (successors.length === 0) return undefined;
  for (const bg of bigrams(room.answer)) {
    if (successors.every((s) => s.answer.includes(bg.text))) {
      return { start: bg.start, text: bg.text };
    }
  }
  return undefined;
}

/** Resolve a level: normalize answers and attach derived bridges. */
export function resolveLevel(level: Level): ResolvedLevel {
  const byId = new Map(level.rooms.map((r) => [r.id, r]));
  const rooms: ResolvedRoom[] = level.rooms.map((room) => {
    const successors = room.next.map((id) => byId.get(id)).filter(Boolean) as Room[];
    return { ...room, bridge: pickBridge(room, successors) };
  });
  return { ...level, rooms };
}

/** Returns a list of human-readable validation errors (empty = valid). */
export function validateLevel(level: Level): string[] {
  const errors: string[] = [];
  const byId = new Map(level.rooms.map((r) => [r.id, r]));

  if (level.rooms.length === 0) errors.push('level has no rooms');

  // Every answer must be distinct — no reusing the same word to pad the maze.
  const seen = new Map<string, string>();
  for (const r of level.rooms) {
    const prev = seen.get(r.answer);
    if (prev) errors.push(`answer "${r.answer}" is reused by rooms ${prev} and ${r.id}`);
    else seen.set(r.answer, r.id);
  }

  for (const r of level.rooms) {
    if (r.answer !== normalize(r.answer)) {
      errors.push(`room ${r.id}: answer "${r.answer}" must be uppercase letters only`);
    }
    if (r.answer.length < 2) {
      errors.push(`room ${r.id}: answer too short`);
    }
    if (r.enumeration) {
      if (r.enumeration.some((n) => n < 1)) {
        errors.push(`room ${r.id}: enumeration parts must be >= 1`);
      }
      const sum = r.enumeration.reduce((a, b) => a + b, 0);
      if (sum !== r.answer.length) {
        errors.push(
          `room ${r.id}: enumeration [${r.enumeration}] sums to ${sum}, but answer has ${r.answer.length} letters`,
        );
      }
    }
    for (const n of r.next) {
      if (!byId.has(n)) errors.push(`room ${r.id}: next "${n}" does not exist`);
    }
    if (r.metaLetterIndex !== undefined) {
      if (r.metaLetterIndex < 0 || r.metaLetterIndex >= r.answer.length) {
        errors.push(`room ${r.id}: metaLetterIndex out of range`);
      }
    }
    const isFinal = r.id === level.finalRoomId;
    if (isFinal && r.next.length > 0) {
      errors.push(`final room ${r.id} must have no successors`);
    }
    if (!isFinal && r.next.length === 0) {
      errors.push(`room ${r.id}: non-final room must have at least one successor`);
    }
    if (!isFinal) {
      const successors = r.next.map((id) => byId.get(id)).filter(Boolean) as Room[];
      if (!pickBridge(r, successors)) {
        errors.push(
          `room ${r.id} ("${r.answer}"): no 2-letter bridge shared with all successors ` +
            `[${successors.map((s) => s.answer).join(', ')}]`,
        );
      }
    }
  }

  for (const id of level.startRoomIds) {
    if (!byId.has(id)) errors.push(`startRoomId "${id}" does not exist`);
  }
  if (!byId.has(level.finalRoomId)) {
    errors.push(`finalRoomId "${level.finalRoomId}" does not exist`);
  }

  // Reachability: at least one path start -> final, and no unreachable rooms.
  const reachable = new Set<string>();
  const stack = [...level.startRoomIds];
  while (stack.length) {
    const id = stack.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    const r = byId.get(id);
    if (r) stack.push(...r.next);
  }
  if (!reachable.has(level.finalRoomId)) {
    errors.push('final room is not reachable from any start room');
  }
  for (const r of level.rooms) {
    if (!reachable.has(r.id)) errors.push(`room ${r.id} is unreachable from start`);
  }

  if (level.meta.answer !== normalize(level.meta.answer)) {
    errors.push('meta answer must be uppercase letters only');
  }
  if (level.meta.enumeration) {
    const sum = level.meta.enumeration.reduce((a, b) => a + b, 0);
    if (sum !== level.meta.answer.length) {
      errors.push(`meta enumeration [${level.meta.enumeration}] does not sum to meta answer length`);
    }
  }

  // The meta answer must be exactly an anagram of every blue (meta) letter.
  const blueRooms = level.rooms.filter((r) => r.metaLetterIndex !== undefined);
  const blueLetters = blueRooms.map((r) => r.answer[r.metaLetterIndex!]);
  const sortChars = (s: string) => s.split('').sort().join('');
  if (sortChars(blueLetters.join('')) !== sortChars(level.meta.answer)) {
    errors.push(
      `meta answer "${level.meta.answer}" is not an anagram of the blue letters ` +
        `[${blueLetters.sort().join(', ')}]`,
    );
  }

  // ── Structural rules ──────────────────────────────────────────────
  const maxRow = Math.max(...level.rooms.map((r) => r.row));

  // Layered: every edge must step exactly one depth up.
  for (const r of level.rooms) {
    for (const n of r.next) {
      const child = byId.get(n);
      if (child && child.row !== r.row + 1) {
        errors.push(`edge ${r.id}->${n}: must connect adjacent depths (got rows ${r.row}->${child.row})`);
      }
    }
  }

  // At most 3 rooms per depth.
  const perRow = new Map<number, number>();
  for (const r of level.rooms) perRow.set(r.row, (perRow.get(r.row) ?? 0) + 1);
  for (const [row, count] of perRow) {
    if (count > 3) errors.push(`depth ${row} has ${count} rooms (max 3)`);
  }

  // Start rooms at depth 0; the final room alone at the top.
  for (const id of level.startRoomIds) {
    const r = byId.get(id);
    if (r && r.row !== 0) errors.push(`start room ${id} must be at depth 0`);
  }
  const finalRoom = byId.get(level.finalRoomId);
  if (finalRoom && finalRoom.row !== maxRow) {
    errors.push('final room must be at the top (max depth)');
  }
  if ((perRow.get(maxRow) ?? 0) !== 1) {
    errors.push('the top depth must contain only the final room');
  }

  // Since edges are layered (one room per depth on any path), two blue rooms
  // sharing a depth guarantees no single path can collect every blue letter —
  // forcing the player to explore multiple routes for the meta puzzle.
  const blueByRow = new Map<number, number>();
  for (const r of blueRooms) blueByRow.set(r.row, (blueByRow.get(r.row) ?? 0) + 1);
  if (![...blueByRow.values()].some((c) => c >= 2)) {
    errors.push(
      'no two blue letters share a depth — a single path could collect them all; ' +
        'spread blue rooms so the meta requires exploring multiple routes',
    );
  }

  return errors;
}
