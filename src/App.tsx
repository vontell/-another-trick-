import { useEffect, useRef, useState } from 'react';
import { LEVELS } from './game/levels';
import type { Level } from './game/types';
import { useGame } from './game/useGame';
import MapView from './components/MapView';
import RoomView from './components/RoomView';
import MetaView from './components/MetaView';
import Tooltip from './components/Tooltip';

function GameScreen({ level }: { level: Level }) {
  const game = useGame(level);
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The map starts at the bottom (depth 0), so scroll there on load.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const openRoom = game.byId.get(openRoomId ?? '');
  const totalRooms = game.rooms.length;

  const handleCloseRoom = () => {
    const wasFinal = openRoom?.isFinal && game.isSolved(openRoom.id);
    setOpenRoomId(null);
    if (wasFinal) setShowMeta(true);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 px-4 py-2 text-sm">
        <Tooltip
          label="Reveal tokens. Earn one by solving a ⚡ room on the first try; spend one inside any room to reveal a letter."
          className="rounded-lg bg-gold/15 px-2.5 py-1 font-semibold text-gold"
        >
          ⚡ {game.progress.tokens}
        </Tooltip>
        <Tooltip
          label="Rooms solved in this level out of the total."
          className="rounded-lg bg-panel2 px-2.5 py-1 font-medium text-white/70"
        >
          {game.solvedCount}/{totalRooms}
        </Tooltip>
        {game.progress.metaSolved && (
          <span className="rounded-lg bg-gold/20 px-2.5 py-1 font-semibold text-gold">★ Complete</span>
        )}
        <button
          onClick={() => {
            if (confirm('Reset all progress for this level?')) {
              game.reset();
              setOpenRoomId(null);
              setShowMeta(false);
            }
          }}
          className="rounded-lg border border-edge px-2.5 py-1 text-white/50 hover:bg-panel2 hover:text-white"
        >
          Reset
        </button>
      </div>

      <main ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 pb-6 pt-4">
          <p className="mb-1 text-center text-sm text-white/50">{game.resolved.subtitle}</p>
          <p className="mb-2 text-center text-xs text-white/30">Start at the bottom · reach the top</p>
          <MapView game={game} onOpenRoom={setOpenRoomId} />
        </div>

        {game.finalSolved && !showMeta && !openRoomId && (
          <div className="pointer-events-none sticky bottom-0 z-20 flex justify-center pb-4">
            <button
              onClick={() => setShowMeta(true)}
              className="pointer-events-auto rounded-full bg-gold px-6 py-3 font-semibold text-ink shadow-xl hover:brightness-110"
            >
              {game.progress.metaSolved ? '★ View the meta puzzle' : '★ Attempt the meta puzzle'}
            </button>
          </div>
        )}
      </main>

      {openRoom && <RoomView room={openRoom} game={game} onClose={handleCloseRoom} />}
      {showMeta && <MetaView game={game} onClose={() => setShowMeta(false)} />}
    </>
  );
}

export default function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const level = LEVELS[levelIndex];

  return (
    <div className="flex h-full flex-col">
      <header className="z-10 border-b border-edge/60 bg-ink/70 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-white">Cryptic Maze</h1>
            <p className="truncate text-xs text-white/40">{level.title}</p>
          </div>
          <div className="flex shrink-0 gap-1 rounded-lg bg-panel2 p-1">
            {LEVELS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setLevelIndex(i)}
                className={[
                  'rounded-md px-3 py-1 text-sm font-medium transition',
                  i === levelIndex ? 'bg-accent text-ink' : 'text-white/60 hover:text-white',
                ].join(' ')}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </header>

      <GameScreen key={level.id} level={level} />
    </div>
  );
}
