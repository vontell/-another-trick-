import type { CellFeedback } from './AnswerInput';

const RANK: Record<CellFeedback, number> = { absent: 1, present: 2, correct: 3 };

/** Merge a guess's per-square feedback into an accumulated letter→status map
 *  (a better status for a letter always wins). */
export function accumulate(
  prev: Record<string, CellFeedback>,
  guess: string[],
  fb: CellFeedback[],
): Record<string, CellFeedback> {
  const next = { ...prev };
  guess.forEach((ch, i) => {
    if (!ch) return;
    const s = fb[i];
    if (!next[ch] || RANK[s] > RANK[next[ch]]) next[ch] = s;
  });
  return next;
}

/** Wordle-style per-square feedback comparing a guess to the answer. */
export function computeFeedback(guess: string[], answer: string): CellFeedback[] {
  const res: CellFeedback[] = answer.split('').map(() => 'absent');
  const counts: Record<string, number> = {};
  for (const ch of answer) counts[ch] = (counts[ch] ?? 0) + 1;
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      res[i] = 'correct';
      counts[guess[i]]--;
    }
  }
  for (let i = 0; i < answer.length; i++) {
    if (res[i] !== 'correct' && guess[i] && counts[guess[i]] > 0) {
      res[i] = 'present';
      counts[guess[i]]--;
    }
  }
  return res;
}
