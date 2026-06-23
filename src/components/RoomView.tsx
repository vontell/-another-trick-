import { useEffect, useMemo, useState } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import AnswerInput, { type CellFeedback } from './AnswerInput';
import Keyboard from './Keyboard';
import Tooltip from './Tooltip';
import { useTyping } from './useTyping';
import { computeFeedback } from './wordleFeedback';
import { enumerationText } from '../game/bridges';

interface Props {
  room: ResolvedRoom;
  game: ReturnType<typeof useGame>;
  onClose: () => void;
  onNext: (id: string) => void;
  variant?: 'overlay' | 'panel';
  assistWrongLetters?: boolean;
  onTokenUsed?: (type: 'reveal' | 'vowel') => void;
}

const empty = (n: number) => Array.from({ length: n }, () => '');

export default function RoomView({
  room,
  game,
  onClose,
  onNext,
  variant = 'overlay',
  assistWrongLetters = false,
  onTokenUsed,
}: Props) {
  const L = room.answer.length;
  const alreadySolved = game.isSolved(room.id);
  const [cells, setCells] = useState<string[]>(alreadySolved ? room.answer.split('') : empty(L));
  const [caret, setCaret] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct'>(
    alreadySolved ? 'correct' : 'idle',
  );
  const [feedback, setFeedback] = useState<(CellFeedback | undefined)[] | undefined>();
  const [justEarned, setJustEarned] = useState<'reveal' | 'vowel' | null>(null);

  // Start the maze timer the first time any room is opened.
  useEffect(() => {
    game.startMaze();
  }, [game]);

  const solved = status === 'correct';
  const revealedIdx = game.progress.revealed[room.id] ?? [];
  const revealed = useMemo(() => {
    const m = new Map<number, string>();
    for (const i of revealedIdx) m.set(i, room.answer[i]);
    return m;
  }, [revealedIdx, room.answer]);

  const guaranteed = useMemo(() => {
    const set = new Set<string>();
    for (const p of game.rooms) {
      if (p.next.includes(room.id) && game.isSolved(p.id) && p.bridge) set.add(p.bridge.text);
    }
    return [...set];
  }, [game, room.id]);

  const filled = cells.every((c) => c !== '');

  const handleSubmit = () => {
    if (solved || !filled) return;
    const wasFirstTry = (game.progress.tries[room.id] ?? 0) === 0;
    const ok = game.submit(room.id, cells.join(''));
    if (ok) {
      setCells(room.answer.split(''));
      setStatus('correct');
      setFeedback(undefined);
      if (wasFirstTry && room.powerUp) setJustEarned(room.powerUp);
    } else {
      setStatus('wrong');
      if (assistWrongLetters) setFeedback(computeFeedback(cells, room.answer));
    }
  };

  const nextTarget = useMemo(() => {
    if (room.isFinal) return null;
    const unsolved = room.next.filter((id) => !game.isSolved(id));
    return unsolved[0] ?? room.next[0] ?? null;
  }, [room, game]);

  const handleAdvance = () => {
    if (room.isFinal) onClose();
    else if (nextTarget) onNext(nextTarget);
    else onClose();
  };

  useEffect(() => {
    if (!solved) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

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

  const useReveal = () => {
    if (game.revealLetter(room.id) !== null) onTokenUsed?.('reveal');
  };
  const useVowel = () => {
    if (game.vowelFlare(room.id)) onTokenUsed?.('vowel');
  };

  const newlyUnlocked = solved ? room.next.filter((id) => !game.isSolved(id)) : [];
  const tokens = game.progress.tokens;

  const body = (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 p-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-panel2 px-2.5 py-1 text-xs font-medium text-accent">
            {room.isFinal ? 'Final Chamber' : `Room ${room.id.replace(/^[a-z]/, '')}`}
          </span>
          {room.powerUp === 'reveal' && (
            <Tooltip
              label="Reveal token: solve this room on your first guess to earn a ⚡ token. Spend one to reveal a letter."
              className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold"
            >
              ⚡ Token (first try)
            </Tooltip>
          )}
          {room.powerUp === 'vowel' && (
            <Tooltip
              label="Vowel Flare: solve this room on your first guess to earn a 🅰 flare. Spend one to reveal all the vowels in a room."
              className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold"
            >
              🅰 Vowel Flare (first try)
            </Tooltip>
          )}
          {room.metaLetterIndex !== undefined && (
            <Tooltip
              label="Meta letter: this room hides one blue square. Solve it to collect that letter toward the meta puzzle."
              className="rounded-full bg-meta/20 px-2.5 py-1 text-xs font-medium text-accent"
            >
              ◆ Meta letter
            </Tooltip>
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
            cells={cells}
            enumeration={room.enumeration}
            caret={solved ? undefined : caret}
            onCellClick={solved ? undefined : setCaret}
            revealed={revealed}
            feedback={feedback}
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
            {justEarned && (
              <p className="rounded-lg bg-gold/10 px-3 py-2 text-center text-sm text-gold">
                {justEarned === 'reveal'
                  ? '⚡ First-try bonus — you earned a Reveal token!'
                  : '🅰 First-try bonus — you earned a Vowel Flare!'}
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

      {/* Footer: actions + keyboard */}
      <div className="shrink-0 space-y-2 p-3 pt-2">
        {!solved ? (
          <>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!filled}
                className="flex-1 rounded-xl bg-accent px-4 py-2.5 font-semibold text-ink transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                Submit
              </button>
              <button
                onClick={useReveal}
                disabled={tokens.reveal <= 0}
                title="Reveal a letter"
                className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold transition enabled:hover:bg-gold/20 disabled:opacity-30"
              >
                ⚡ {tokens.reveal}
              </button>
              <button
                onClick={useVowel}
                disabled={tokens.vowel <= 0}
                title="Vowel Flare: reveal all vowels"
                className="rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold transition enabled:hover:bg-gold/20 disabled:opacity-30"
              >
                🅰 {tokens.vowel}
              </button>
            </div>
            <Keyboard onKey={press} />
          </>
        ) : (
          <button
            onClick={handleAdvance}
            className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-ink hover:brightness-110"
          >
            {room.isFinal
              ? 'Continue to the meta puzzle →'
              : nextTarget
                ? 'Next room →'
                : 'Back to the map'}
          </button>
        )}
      </div>
    </>
  );

  if (variant === 'panel') {
    return (
      <div className="flex h-full w-full justify-center bg-panel">
        <div className="flex h-full w-full max-w-xl flex-col">{body}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-center bg-black/70 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-lg flex-col border-edge bg-panel shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl sm:border">
        {body}
      </div>
    </div>
  );
}
