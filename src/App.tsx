import { useState } from 'react';
import { LEVEL_1 } from './game/levels';
import { useGame } from './game/useGame';
import MapView from './components/MapView';
import RoomView from './components/RoomView';
import MetaView from './components/MetaView';

export default function App() {
  const game = useGame(LEVEL_1);
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);

  const openRoom = game.byId.get(openRoomId ?? '');
  const totalRooms = game.rooms.length;

  const handleCloseRoom = () => {
    const wasFinal = openRoom?.isFinal && game.isSolved(openRoom.id);
    setOpenRoomId(null);
    if (wasFinal) setShowMeta(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="z-10 border-b border-edge/60 bg-ink/70 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-white">
              Cryptic Maze
            </h1>
            <p className="truncate text-xs text-white/40">{game.resolved.title}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className="rounded-lg bg-gold/15 px-2.5 py-1 font-semibold text-gold"
              title="Reveal-letter tokens"
            >
              ⚡ {game.progress.tokens}
            </span>
            <span
              className="rounded-lg bg-panel2 px-2.5 py-1 font-medium text-white/70"
              title="Rooms solved"
            >
              {game.solvedCount}/{totalRooms}
            </span>
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
        </div>
      </header>

      {/* Map */}
      <main className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">
          <p className="mb-2 text-center text-sm text-white/50">{game.resolved.subtitle}</p>
          <MapView game={game} onOpenRoom={setOpenRoomId} />
        </div>

        {/* Meta entry button (appears once the final room is solved) */}
        {game.finalSolved && !showMeta && !openRoomId && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-4">
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
    </div>
  );
}
