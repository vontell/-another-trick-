import type { CellFeedback } from './AnswerInput';

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
