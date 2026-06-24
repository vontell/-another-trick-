import { useEffect, useMemo, useState } from 'react';
import type { ResolvedRoom } from '../game/types';
import type { useGame } from '../game/useGame';
import AnswerInput, { type CellFeedback } from './AnswerInput';
import Keyboard from './Keyboard';
import Tooltip from './Tooltip';
import Icon from './Icon';
import { useTyping } from './useTyping';
import { computeFeedback, accumulate } from './wordleFeedback';
import FoundLetters from './FoundLetters';
import { enumerationText } from '../game/bridges';
import { track } from '../services/analytics';

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
  const [discovered, setDiscovered] = useState<Record<string, CellFeedback>>({});
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
      track('room_solved', { puzzle_id: game.resolved.id, first_try: wasFirstTry });
    } else {
      track('room_missed', { puzzle_id: game.resolved.id });
      setStatus('wrong');
      if (assistWrongLetters) {
        const fb = computeFeedback(cells, room.answer);
        setFeedback(fb);
        setDiscovered((prev) => accumulate(prev, cells, fb));
      }
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
    if (game.revealLetter(room.id) !== null) {
      track('powerup_used', { kind: 'reveal' });
      onTokenUsed?.('reveal');
    }
  };
  const useVowel = () => {
    if (game.vowelFlare(room.id)) {
      track('powerup_used', { kind: 'vowel' });
      onTokenUsed?.('vowel');
    }
  };

  const newlyUnlocked = solved ? room.next.filter((id) => !game.isSolved(id)) : [];
  const tokens = game.progress.tokens;

  const body = (
    <>
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 p-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-panel2 px-2.5 py-1 font-display text-[11px] font-semibold tracking-wide text-accent">
            {room.isFinal ? 'Final Chamber' : `Room ${room.id.replace(/^[a-z]/, '')}`}
          </span>
          {room.powerUp === 'reveal' && (
            <Tooltip
              label="Reveal token: solve this room on your first guess to earn a Reveal token. Spend one to reveal a letter."
              className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold"
            >
              <Icon name="reveal" size={13} /> Token (first try)
            </Tooltip>
          )}
          {room.powerUp === 'vowel' && (
            <Tooltip
              label="Vowel Flare: solve this room on your first guess to earn a Vowel Flare. Spend one to reveal all the vowels in a room."
              className="flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold"
            >
              <Icon name="vowel" size={13} /> Vowel Flare (first try)
            </Tooltip>
          )}
          {room.metaLetterIndex !== undefined && (
            <Tooltip
              label="Meta letter: this room hides a marked square. Solve it to collect that letter toward the meta puzzle."
              className="flex items-center gap-1 rounded-full bg-meta/20 px-2.5 py-1 text-xs font-medium text-meta"
            >
              <Icon name="meta" size={12} /> Meta letter
            </Tooltip>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 leading-none text-ink/50 hover:bg-panel2 hover:text-ink"
          aria-label="Back to map"
        >
          <Icon name="close" size={20} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <div className="my-auto w-full space-y-5 py-4">
          <p className="text-center font-body text-2xl font-medium italic leading-snug text-ink sm:text-[28px] lg:text-3xl">
            {room.clue}
          </p>
          <p className="text-center text-sm text-ink/40">
            {enumerationText(room.answer, room.enumeration)}
            {room.enumeration && room.enumeration.length > 1 ? ' · multiple words' : ' letters'}
          </p>

          {!solved && guaranteed.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-panel2/60 px-3 py-2">
              <span className="text-xs text-ink/50">Guaranteed inside (somewhere):</span>
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

          <div>
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

        {!solved && assistWrongLetters && <FoundLetters discovered={discovered} />}

        {solved && (
          <div className="space-y-3 pb-2 animate-pop">
            <p className="flex items-center justify-center gap-2 font-display text-base font-bold text-good">
              <Icon name="check" size={18} strokeWidth={2.2} />
              {alreadySolved ? 'Solved' : 'Path cleared!'}
            </p>
            {justEarned && (
              <p className="flex items-center justify-center gap-2 rounded-lg bg-gold/10 px-3 py-2 text-center text-sm text-gold">
                <Icon name={justEarned === 'reveal' ? 'reveal' : 'vowel'} size={15} />
                First-try bonus — you earned a {justEarned === 'reveal' ? 'Reveal token' : 'Vowel Flare'}!
              </p>
            )}
            {room.metaLetterIndex !== undefined && (
              <p className="flex items-center justify-center gap-1.5 rounded-lg bg-meta/15 px-3 py-2 text-center text-sm text-meta">
                <Icon name="meta" size={14} />
                Collected the letter{' '}
                <span className="font-bold text-ink">{room.answer[room.metaLetterIndex]}</span> for the meta.
              </p>
            )}
            {room.bridge && (
              <p className="rounded-lg bg-panel2 px-3 py-2 text-center text-sm text-ink/70">
                The outlined pair{' '}
                <span className="font-mono font-bold text-gold">{room.bridge.text}</span> is
                guaranteed in every room ahead.
              </p>
            )}
            {newlyUnlocked.length > 0 && (
              <p className="text-center text-xs text-ink/40">
                Opened {newlyUnlocked.length} new room{newlyUnlocked.length > 1 ? 's' : ''}.
              </p>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Footer: actions + keyboard */}
      <div className="shrink-0 space-y-2 p-3 pt-2">
        {!solved ? (
          <>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!filled}
                className="flex-1 rounded-xl bg-accent px-4 py-2.5 font-semibold text-cream transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                Submit
              </button>
              <button
                onClick={useReveal}
                disabled={tokens.reveal <= 0}
                title="Reveal a letter"
                className="flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold transition enabled:hover:bg-gold/20 disabled:opacity-30"
              >
                <Icon name="reveal" size={16} /> {tokens.reveal}
              </button>
              <button
                onClick={useVowel}
                disabled={tokens.vowel <= 0}
                title="Vowel Flare: reveal all vowels"
                className="flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold transition enabled:hover:bg-gold/20 disabled:opacity-30"
              >
                <Icon name="vowel" size={16} /> {tokens.vowel}
              </button>
            </div>
            <Keyboard onKey={press} />
          </>
        ) : (
          <button
            onClick={handleAdvance}
            className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-cream hover:brightness-110"
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
    <div className="fixed inset-0 z-30 flex animate-fadeIn items-stretch justify-center bg-ink/50 sm:items-center sm:p-4">
      <div className="flex h-full w-full max-w-lg animate-riseIn flex-col border-edge bg-panel shadow-2xl sm:h-auto sm:max-h-[94vh] sm:rounded-2xl sm:border-2">
        {body}
      </div>
    </div>
  );
}
