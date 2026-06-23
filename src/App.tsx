import { useEffect, useRef, useState } from 'react';
import { LEVELS } from './game/levels';
import type { Difficulty, Level } from './game/types';
import { useGame } from './game/useGame';
import { aggregateProgress, formatMs, useStore } from './game/store';
import MapView from './components/MapView';
import RoomView from './components/RoomView';
import MetaView from './components/MetaView';
import HelpDialog from './components/HelpDialog';
import StatsDialog from './components/StatsDialog';
import SettingsDialog from './components/SettingsDialog';
import Icon from './components/Icon';
import { useIsDesktop } from './components/useIsDesktop';

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: 'bg-good/20 text-good',
  Medium: 'bg-accent/20 text-accent',
  Hard: 'bg-gold/20 text-gold',
  'Extra Hard': 'bg-bad/20 text-bad',
};

function GameScreen({
  level,
  assistWrongLetters,
  isDesktop,
  onComplete,
}: {
  level: Level;
  assistWrongLetters: boolean;
  isDesktop: boolean;
  onComplete: (r: {
    levelId: string;
    mazeMs: number;
    metaMs: number;
    firstTries: number;
    mistakes: number;
  }) => void;
}) {
  const game = useGame(level);
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Tick the active timer once a second; pause while the tab is hidden.
  const lastTick = useRef(0);
  useEffect(() => {
    lastTick.current = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastTick.current;
      lastTick.current = now;
      if (!document.hidden) game.tick(delta);
    }, 1000);
    return () => window.clearInterval(id);
  }, [game]);

  // Record the run the moment the meta is solved.
  const recorded = useRef(game.progress.metaSolved);
  useEffect(() => {
    if (game.progress.metaSolved && !recorded.current) {
      recorded.current = true;
      onComplete({
        levelId: level.id,
        mazeMs: game.progress.mazeMs,
        metaMs: game.progress.metaMs,
        firstTries: game.firstTries,
        mistakes: game.progress.mistakes,
      });
    }
  }, [game.progress.metaSolved, game, level.id, onComplete]);

  const openRoom = game.byId.get(openRoomId ?? '');
  const totalRooms = game.rooms.length;
  const tokens = game.progress.tokens;

  const handleCloseRoom = () => {
    const wasFinal = openRoom?.isFinal && game.isSolved(openRoom.id);
    setOpenRoomId(null);
    if (wasFinal) setShowMeta(true);
  };

  return (
    <>
      {/* Per-game sub-bar */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 text-sm">
        <span className="mr-auto flex items-center gap-1.5 rounded-lg bg-panel2 px-2.5 py-1 font-mono font-medium text-ink/80">
          {!game.finalSolved ? (
            <>
              <Icon name="hourglass" size={14} /> {formatMs(game.progress.mazeMs)}
            </>
          ) : (
            <>
              <Icon name="flag" size={14} /> {formatMs(game.progress.mazeMs)}
              {game.progress.metaStarted && (
                <>
                  <span className="text-ink/30">·</span>
                  <Icon name="star" size={13} className="text-gold" /> {formatMs(game.progress.metaMs)}
                </>
              )}
            </>
          )}
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-gold/15 px-2.5 py-1 font-semibold text-gold" title="Reveal tokens">
          <Icon name="reveal" size={15} /> {tokens.reveal}
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-gold/15 px-2.5 py-1 font-semibold text-gold" title="Vowel Flares">
          <Icon name="vowel" size={15} /> {tokens.vowel}
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-panel2 px-2.5 py-1 font-medium text-ink/70" title="Rooms solved">
          <Icon name="check" size={13} className="text-good" /> {game.solvedCount}/{totalRooms}
        </span>
        <button
          onClick={() => {
            if (confirm('Reset all progress for this level?')) {
              game.reset();
              recorded.current = false;
              setOpenRoomId(null);
              setShowMeta(false);
            }
          }}
          className="rounded-lg border border-edge px-2.5 py-1 text-ink/50 hover:bg-panel2 hover:text-ink"
        >
          Reset
        </button>
      </div>

      {/* Map (+ desktop room panel) */}
      <div className="flex min-h-0 flex-1">
        <main ref={scrollRef} className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 pb-6 pt-4">
            <p className="mb-1 text-center text-sm text-ink/50">{game.resolved.subtitle}</p>
            <p className="mb-2 text-center text-xs text-ink/30">Start at the bottom · reach the top</p>
            <MapView game={game} onOpenRoom={setOpenRoomId} />
          </div>

          {game.finalSolved && !showMeta && (!openRoomId || isDesktop) && (
            <div className="pointer-events-none sticky bottom-0 z-20 flex justify-center pb-4">
              <button
                onClick={() => setShowMeta(true)}
                className="pointer-events-auto flex animate-floaty items-center gap-2 rounded-full bg-gold px-6 py-3 font-display font-semibold text-cream shadow-xl ring-2 ring-gold/30 hover:brightness-110"
              >
                <Icon name="star" size={18} />
                {game.progress.metaSolved ? 'View the meta puzzle' : 'Attempt the meta puzzle'}
              </button>
            </div>
          )}
        </main>

        {isDesktop && openRoom && (
          <aside className="flex w-1/2 shrink-0 flex-col border-l border-edge">
            <RoomView
              key={openRoom.id}
              room={openRoom}
              game={game}
              onClose={handleCloseRoom}
              onNext={setOpenRoomId}
              variant="panel"
              assistWrongLetters={assistWrongLetters}
            />
          </aside>
        )}
      </div>

      {!isDesktop && openRoom && (
        <RoomView
          key={openRoom.id}
          room={openRoom}
          game={game}
          onClose={handleCloseRoom}
          onNext={setOpenRoomId}
          assistWrongLetters={assistWrongLetters}
        />
      )}
      {showMeta && (
        <MetaView game={game} onClose={() => setShowMeta(false)} assistWrongLetters={assistWrongLetters} />
      )}
    </>
  );
}

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];
  const isDesktop = useIsDesktop();
  const { store, setSettings, markHelpSeen, recordLevelComplete, resetStats } = useStore();

  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // First visit: show the explainer once.
  useEffect(() => {
    if (!store.seenHelp) setShowHelp(true);
  }, [store.seenHelp]);

  const closeHelp = () => {
    setShowHelp(false);
    markHelpSeen();
  };

  const iconBtn =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-ink/60 hover:bg-panel2 hover:text-ink';

  return (
    <div className="flex h-full flex-col">
      <header className="z-10 border-b border-edge/60 bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Icon name="compass" size={22} className="shrink-0 text-accent" />
            <h1 className="truncate font-display text-lg font-bold tracking-wide text-ink">Cryptic Maze</h1>
            <span
              className={['rounded-full px-2 py-0.5 font-display text-[11px] font-semibold tracking-wider', DIFF_STYLE[level.difficulty]].join(' ')}
              title="Maze difficulty"
            >
              {level.difficulty}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-panel2 p-1">
              {LEVELS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setLevelIndex(i)}
                  className={[
                    'rounded-md px-2.5 py-1 text-sm font-medium transition',
                    i === levelIndex ? 'bg-accent text-cream' : 'text-ink/60 hover:text-ink',
                  ].join(' ')}
                  title={`${l.title} — ${l.difficulty}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button className={iconBtn} onClick={() => setShowStats(true)} title="Stats" aria-label="Stats">
              <Icon name="scroll" size={17} />
            </button>
            <button className={iconBtn} onClick={() => setShowSettings(true)} title="Settings" aria-label="Settings">
              <Icon name="sliders" size={17} />
            </button>
            <button className={iconBtn} onClick={() => setShowHelp(true)} title="How to play" aria-label="Help">
              <Icon name="compass" size={17} />
            </button>
          </div>
        </div>
      </header>

      <GameScreen
        key={level.id}
        level={level}
        assistWrongLetters={store.settings.assistWrongLetters}
        isDesktop={isDesktop}
        onComplete={recordLevelComplete}
      />

      {showHelp && <HelpDialog onClose={closeHelp} />}
      {showStats && (
        <StatsDialog
          aggregate={aggregateProgress(LEVELS.map((l) => l.id))}
          stats={store.stats}
          levels={LEVELS}
          onClose={() => setShowStats(false)}
        />
      )}
      {showSettings && (
        <SettingsDialog
          settings={store.settings}
          setSettings={setSettings}
          onResetStats={resetStats}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
