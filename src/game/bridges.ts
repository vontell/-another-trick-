import type { Level, ResolvedLevel, ResolvedRoom, Room } from './types';

export function normalize(s: string): string {
  return s.toUpperCase().replace(/[^A-Z]/g, '');
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

  for (const r of level.rooms) {
    if (r.answer !== normalize(r.answer)) {
      errors.push(`room ${r.id}: answer "${r.answer}" must be uppercase letters only`);
    }
    if (r.answer.length < 2) {
      errors.push(`room ${r.id}: answer too short`);
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

  // The meta answer must be exactly an anagram of every blue (meta) letter.
  const blueLetters = level.rooms
    .filter((r) => r.metaLetterIndex !== undefined)
    .map((r) => r.answer[r.metaLetterIndex!]);
  const sortChars = (s: string) => s.split('').sort().join('');
  if (sortChars(blueLetters.join('')) !== sortChars(level.meta.answer)) {
    errors.push(
      `meta answer "${level.meta.answer}" is not an anagram of the blue letters ` +
        `[${blueLetters.sort().join(', ')}]`,
    );
  }

  return errors;
}
