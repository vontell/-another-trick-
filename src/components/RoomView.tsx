import { useMemo, useState } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import AnswerInput from './AnswerInput';
import Keyboard from './Keyboard';
import { useTyping } from './useTyping';
import { enumerationText } from '../game/bridges';

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

  // Letters guaranteed to be in this answer, learned from solved predecessors.
  const guaranteed = useMemo(() => {
    const set = new Set<string>();
    for (const p of game.rooms) {
      if (p.next.includes(room.id) && game.isSolved(p.id) && p.bridge) set.add(p.bridge.text);
    }
    return [...set];
  }, [game, room.id]);

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

  const press = useTyping({
    length: room.answer.length,
    disabled: solved,
    onLetter: (k) => {
      setStatus((s) => (s === 'wrong' ? 'idle' : s));
      setValue((v) => (v.length < room.answer.length ? v + k : v));
    },
    onBackspace: () => {
      setStatus((s) => (s === 'wrong' ? 'idle' : s));
      setValue((v) => v.slice(0, -1));
    },
    onEnter: handleSubmit,
  });

  const newlyUnlocked = solved ? room.next.filter((id) => !game.isSolved(id)) : [];

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-center bg-black/70 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-lg flex-col border-edge bg-panel shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl sm:border">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 p-4 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-panel2 px-2.5 py-1 text-xs font-medium text-accent">
              {room.isFinal ? 'Final Chamber' : `Room ${room.id.replace(/^r/, '')}`}
            </span>
            {room.powerUp === 'reveal' && (
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
                ⚡ Token (first try)
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4">
          <p className="text-lg font-medium leading-snug text-white sm:text-xl">{room.clue}</p>
          <p className="mt-1 text-sm text-white/40">
            {enumerationText(room.answer, room.enumeration)}
            {room.enumeration && room.enumeration.length > 1 ? ' · multiple words' : ' letters'}
          </p>

          {!solved && guaranteed.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-panel2/60 px-3 py-2">
              <span className="text-xs text-white/50">Guaranteed inside (somewhere):</span>
              {guaranteed.map((g) => (
                <span
                  key={g}
                  className="rounded border border-gold/50 bg-gold/10 px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-gold"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          <div className="my-4">
            <AnswerInput
              length={room.answer.length}
              value={value}
              enumeration={room.enumeration}
              revealed={revealed}
              metaIndex={room.metaLetterIndex}
              bridgeStart={solved ? room.bridge?.start : undefined}
              status={status}
            />
          </div>

          {status === 'wrong' && (
            <p className="text-center text-sm text-bad">Not quite — try again.</p>
          )}

          {solved && (
            <div className="space-y-3 pb-2 animate-pop">
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
                  guaranteed in every room ahead.
                </p>
              )}
              {newlyUnlocked.length > 0 && (
                <p className="text-center text-xs text-white/40">
                  Opened {newlyUnlocked.length} new room{newlyUnlocked.length > 1 ? 's' : ''}.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer: actions + keyboard (pinned, never covered) */}
        <div className="shrink-0 space-y-2 p-3 pt-2">
          {!solved ? (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={value.length !== room.answer.length}
                  className="flex-1 rounded-xl bg-accent px-4 py-2.5 font-semibold text-ink transition enabled:hover:brightness-110 disabled:opacity-40"
                >
                  Submit
                </button>
                <button
                  onClick={() => game.revealLetter(room.id)}
                  disabled={game.progress.tokens <= 0}
                  className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold transition enabled:hover:bg-gold/20 disabled:opacity-30"
                >
                  ⚡ Reveal ({game.progress.tokens})
                </button>
              </div>
              <Keyboard onKey={press} />
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-ink hover:brightness-110"
            >
              {room.isFinal ? 'Continue to the meta puzzle →' : 'Back to the map'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
