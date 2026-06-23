import { useEffect, useState } from 'react';
import type { useGame } from '../game/useGame';
import AnswerInput, { type CellFeedback } from './AnswerInput';
import Keyboard from './Keyboard';
import Icon from './Icon';
import { useTyping } from './useTyping';
import { computeFeedback } from './wordleFeedback';
import { enumerationText } from '../game/bridges';

interface Props {
  game: ReturnType<typeof useGame>;
  onClose: () => void;
  assistWrongLetters?: boolean;
}

const empty = (n: number) => Array.from({ length: n }, () => '');

export default function MetaView({ game, onClose, assistWrongLetters = false }: Props) {
  const meta = game.resolved.meta;
  const L = meta.answer.length;
  const alreadySolved = game.progress.metaSolved;
  const [cells, setCells] = useState<string[]>(
    alreadySolved ? meta.answer.split('') : empty(L),
  );
  const [caret, setCaret] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>(
    alreadySolved ? 'correct' : 'idle',
  );
  const [feedback, setFeedback] = useState<(CellFeedback | undefined)[] | undefined>();
  const [showHint, setShowHint] = useState(false);

  // Start the meta timer when the puzzle is opened.
  useEffect(() => {
    game.startMeta();
  }, [game]);

  const solved = status === 'correct';
  const collected = game.progress.collected;
  const totalBlue = game.rooms.filter((r) => r.metaLetterIndex !== undefined).length;
  const filled = cells.every((c) => c !== '');

  const handleSubmit = () => {
    if (solved || !filled) return;
    if (game.submitMeta(cells.join(''))) {
      setCells(meta.answer.split(''));
      setStatus('correct');
      setFeedback(undefined);
    } else {
      setStatus('wrong');
      if (assistWrongLetters) setFeedback(computeFeedback(cells, meta.answer));
    }
  };

  const press = useTyping({
    length: L,
    disabled: solved,
    onLetter: (k) => {
      setStatus((s) => (s === 'wrong' ? 'idle' : s));
      setFeedback(undefined);
      setCells((prev) => {
        if (caret >= L) return prev;
        const next = [...prev];
        next[caret] = k;
        let c = caret + 1;
        while (c < L && next[c] !== '') c++;
        setCaret(c);
        return next;
      });
    },
    onBackspace: () => {
      setStatus((s) => (s === 'wrong' ? 'idle' : s));
      setFeedback(undefined);
      setCells((prev) => {
        const next = [...prev];
        if (caret < L && next[caret] !== '') {
          next[caret] = '';
        } else {
          const i = Math.max(0, caret - 1);
          next[i] = '';
          setCaret(i);
        }
        return next;
      });
    },
    onEnter: handleSubmit,
  });

  return (
    <div className="fixed inset-0 z-30 flex animate-fadeIn items-stretch justify-center bg-ink/55 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-lg animate-riseIn flex-col border-gold bg-panel shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl sm:border-2">
        <div className="flex shrink-0 items-center justify-between p-4 pb-2">
          <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 font-display text-xs font-semibold tracking-wide text-gold">
            <Icon name="star" size={14} /> Meta Puzzle
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 leading-none text-ink/50 hover:bg-panel2 hover:text-ink"
            aria-label="Back to map"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-base leading-snug text-ink/90">{meta.prompt}</p>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-ink/40">
              Blue letters collected — {collected.length} of {totalBlue}
            </p>
            {collected.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {collected.map((c) => (
                  <span
                    key={c.roomId}
                    className="flex h-8 w-8 animate-pop items-center justify-center rounded-md border-2 border-meta bg-meta/20 font-display text-lg font-bold text-ink"
                  >
                    {c.letter}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/40">
                You haven&apos;t collected any blue letters yet — explore the maze to gather them.
              </p>
            )}
            {collected.length < totalBlue && (
              <p className="mt-2 text-xs text-ink/40">
                {totalBlue - collected.length} still hidden on other paths. The answer uses every
                blue letter.
              </p>
            )}
          </div>

          <div className="my-4">
            <p className="mb-2 text-center text-xs text-ink/40">
              {enumerationText(meta.answer, meta.enumeration)}
            </p>
            <AnswerInput
              cells={cells}
              enumeration={meta.enumeration}
              caret={solved ? undefined : caret}
              onCellClick={solved ? undefined : setCaret}
              feedback={feedback}
              status={status}
            />
          </div>

          {status === 'wrong' && (
            <p className="text-center text-sm text-bad">Not the treasure — keep thinking.</p>
          )}

          {solved && (
            <div className="space-y-3 pb-2 text-center">
              <div className="mx-auto flex h-16 w-16 animate-stampIn items-center justify-center rounded-full border-2 border-gold bg-gold/10 text-gold">
                <Icon name="chest" size={34} />
              </div>
              <p className="font-display text-xl font-bold text-gold">Level complete!</p>
              <p className="text-sm text-ink/60">
                You uncovered <span className="font-bold text-ink">{meta.answer}</span> and
                conquered the labyrinth.
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 p-3 pt-2">
          {!solved ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={!filled}
                className="w-full rounded-xl bg-gold px-4 py-2.5 font-semibold text-cream transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                Solve the meta
              </button>
              {meta.hint && (
                <button
                  onClick={() => setShowHint((s) => !s)}
                  className="w-full text-center text-xs text-ink/40 hover:text-ink/70"
                >
                  {showHint ? meta.hint : 'Need a hint?'}
                </button>
              )}
              <Keyboard onKey={press} enterLabel="Enter" />
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-cream hover:brightness-110"
            >
              Back to the map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
