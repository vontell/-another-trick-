import Modal from './Modal';
import Icon from './Icon';
import GlobalStats from './GlobalStats';
import type { Aggregate, Stats } from '../game/store';
import { formatMs } from '../game/store';
import type { Level } from '../game/types';

export default function StatsDialog({
  aggregate,
  stats,
  levels,
  currentId,
  onClose,
}: {
  aggregate: Aggregate;
  stats: Stats;
  levels: Level[];
  currentId: string;
  onClose: () => void;
}) {
  const current = levels.find((l) => l.id === currentId);
  const currentStat = stats.perLevel[currentId];
  const tiles: [string, string | number][] = [
    ['Levels completed', aggregate.levelsCompleted],
    ['Rooms solved', aggregate.roomsSolved],
    ['First-try solves', aggregate.firstTries],
    ['Mistakes', aggregate.mistakes],
    ['Letters revealed', aggregate.lettersRevealed],
    ['Levels available', levels.length],
  ];

  return (
    <Modal title="Your stats" onClose={onClose}>
      <div className="space-y-5">
        {current && (
          <GlobalStats
            puzzleId={current.id}
            title={current.title}
            yourMazeMs={currentStat?.bestMazeMs}
            yourMetaMs={currentStat?.bestMetaMs}
          />
        )}

        <div className="grid grid-cols-2 gap-2">
          {tiles.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-panel2 px-3 py-2">
              <div className="text-xl font-bold text-ink">{value}</div>
              <div className="text-sm text-ink/60">{label}</div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm uppercase tracking-wide text-ink/40">Per level (best)</p>
          <div className="space-y-2">
            {levels.map((lvl) => {
              const s = stats.perLevel[lvl.id];
              return (
                <div key={lvl.id} className="rounded-lg border border-edge/60 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{lvl.title}</span>
                    <span
                      className={[
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                        s?.completed ? 'bg-good/20 text-good' : 'bg-panel2 text-ink/40',
                      ].join(' ')}
                    >
                      {s?.completed ? (
                        <>
                          <Icon name="check" size={12} strokeWidth={2.4} /> done
                        </>
                      ) : (
                        'unsolved'
                      )}
                    </span>
                  </div>
                  {s?.completed && (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-ink/50">
                      <span>Maze {formatMs(s.bestMazeMs)}</span>
                      <span>Meta {formatMs(s.bestMetaMs)}</span>
                      <span>Best first-tries {s.bestFirstTries ?? 0}</span>
                      <span>Fewest mistakes {s.fewestMistakes ?? 0}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
