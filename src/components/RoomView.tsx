import { useMemo, useState } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import AnswerInput from './AnswerInput';

interface Props {
  room: ResolvedRoom;
  game: ReturnType<typeof useGame>;
  onClose: () => void;
}

export default function RoomView({ room, game, onClose }: Props) {
  const alreadySolved = game.isSolved(room.id);
  const [value, setValue] = useState(alreadySolved ? room.answer : '');
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>(
    alreadySolved ? 'correct' : 'idle',
  );
  const [justEarnedToken, setJustEarnedToken] = useState(false);

  const solved = status === 'correct';
  const revealedIdx = game.progress.revealed[room.id] ?? [];
  const revealed = useMemo(() => {
    const m = new Map<number, string>();
    for (const i of revealedIdx) m.set(i, room.answer[i]);
    return m;
  }, [revealedIdx, room.answer]);

  const tries = game.progress.tries[room.id] ?? 0;
  const firstTryAvailable = tries === 0 && !alreadySolved;

  const handleSubmit = () => {
    if (solved || value.length !== room.answer.length) return;
    const wasFirstTry = (game.progress.tries[room.id] ?? 0) === 0;
    const ok = game.submit(room.id, value);
    if (ok) {
      setValue(room.answer);
      setStatus('correct');
      if (room.powerUp === 'reveal' && wasFirstTry) setJustEarnedToken(true);
    } else {
      setStatus('wrong');
    }
  };

  const handleReveal = () => {
    if (solved) return;
    game.revealLetter(room.id);
  };

  const newlyUnlocked = solved
    ? room.next.filter((id) => !game.isSolved(id))
    : [];

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-2xl border border-edge bg-panel p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-panel2 px-2.5 py-1 text-xs font-medium text-accent">
              {room.isFinal ? 'Final Chamber' : `Room ${room.id.slice(1)}`}
            </span>
            {room.powerUp === 'reveal' && (
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
                ⚡ Reveal token (first try)
              </span>
            )}
            {room.metaLetterIndex !== undefined && (
              <span className="rounded-full bg-meta/20 px-2.5 py-1 text-xs font-medium text-accent">
                ◆ Meta letter
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-white/50 hover:bg-panel2 hover:text-white"
            aria-label="Back to map"
          >
            ✕
          </button>
        </div>

        <p className="mb-1 text-lg font-medium leading-snug text-white sm:text-xl">{room.clue}</p>
        <p className="mb-4 text-sm text-white/40">
          {room.answer.length} letters
          {firstTryAvailable && room.powerUp === 'reveal'
            ? ' • answer first time to win a token'
            : ''}
        </p>

        <div className="mb-4">
          <AnswerInput
            length={room.answer.length}
            value={value}
            onChange={(v) => {
              setValue(v);
              if (status === 'wrong') setStatus('idle');
            }}
            onSubmit={handleSubmit}
            revealed={revealed}
            metaIndex={room.metaLetterIndex}
            bridgeStart={solved ? room.bridge?.start : undefined}
            status={status}
            autoFocus={!alreadySolved}
            disabled={solved}
          />
        </div>

        {!solved && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleSubmit}
              disabled={value.length !== room.answer.length}
              className="flex-1 rounded-xl bg-accent px-4 py-3 font-semibold text-ink transition enabled:hover:brightness-110 disabled:opacity-40"
            >
              Submit
            </button>
            <button
              onClick={handleReveal}
              disabled={game.progress.tokens <= 0}
              className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 font-semibold text-gold transition enabled:hover:bg-gold/20 disabled:opacity-30"
            >
              ⚡ Reveal letter ({game.progress.tokens})
            </button>
          </div>
        )}

        {status === 'wrong' && (
          <p className="mt-3 text-center text-sm text-bad">Not quite — try again.</p>
        )}

        {solved && (
          <div className="mt-2 space-y-3 animate-pop">
            <p className="text-center text-sm font-semibold text-good">
              Correct! {alreadySolved ? '' : 'Path cleared.'}
            </p>

            {justEarnedToken && (
              <p className="rounded-lg bg-gold/10 px-3 py-2 text-center text-sm text-gold">
                ⚡ First-try bonus — you earned a Reveal token!
              </p>
            )}

            {room.metaLetterIndex !== undefined && (
              <p className="rounded-lg bg-meta/15 px-3 py-2 text-center text-sm text-accent">
                ◆ Collected the letter{' '}
                <span className="font-bold">{room.answer[room.metaLetterIndex]}</span> for the meta
                puzzle.
              </p>
            )}

            {room.bridge && (
              <p className="rounded-lg bg-panel2 px-3 py-2 text-center text-sm text-white/70">
                The outlined pair{' '}
                <span className="font-mono font-bold text-gold">{room.bridge.text}</span> is
                guaranteed to appear in every room ahead.
              </p>
            )}

            {newlyUnlocked.length > 0 && (
              <p className="text-center text-xs text-white/40">
                Opened {newlyUnlocked.length} new room{newlyUnlocked.length > 1 ? 's' : ''}.
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-ink hover:brightness-110"
            >
              {room.isFinal ? 'Continue to the meta puzzle →' : 'Back to the map'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
