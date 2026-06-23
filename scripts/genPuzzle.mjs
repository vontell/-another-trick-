// Daily-puzzle generator (per-room bridge model). Builds a layered DAG where
// each room connects to next-depth words sharing one of its bigrams, ensuring
// every next room is covered. Then assigns blue letters anagramming the meta.
import { writeFileSync } from 'fs';

const META = 'OLIVERTWIST';
const META_ENUM = [6, 5];
const DATE = '2026-06-23';
const TITLE = 'Tuesday 23 June';
const DIFFICULTY = 'Medium';
const SIZES = [3, 3, 3, 3, 3, 3, 3, 2, 1]; // 24 rooms
const MIN_MULTI = 10;

const POOL = [
  ['ORPHAN', null, 'Child with no living parents'],
  ['GRUEL', null, 'Thin, watery porridge'],
  ['LOCKET', null, 'Small pendant that opens for a photo'],
  ['COFFIN', null, 'Box for burying the dead'],
  ['GALLOWS', null, 'Wooden frame used for hangings'],
  ['SLUM', null, 'Overcrowded, run-down district'],
  ['LONDON', null, 'Capital city on the Thames'],
  ['VICTORIAN', null, "Of Queen Victoria's reign"],
  ['SERIAL', null, 'Published in regular installments'],
  ['BEADLE', null, 'Minor parish or ceremonial official'],
  ['PARISH', null, 'Area with its own church'],
  ['THIEVES', null, 'Ali Baba and the forty ___'],
  ['MONKS', null, 'Robed men of an abbey'],
  ['DODGER', null, 'Los Angeles baseball player'],
  ['BUMBLE', null, 'Move or speak clumsily'],
  ['NANCY', null, 'Skater Kerrigan or Speaker Pelosi'],
  ['BULLSEYE', null, 'Dead centre of a dartboard'],
  ['POVERTY', null, 'State of being extremely poor'],
  ['CHIMNEYSWEEP', [7, 5], 'Soot-clearing tradesman'],
  ['STREETURCHIN', [6, 6], 'Ragged child of the city'],
  ['POCKETWATCH', [6, 5], 'Timepiece carried on a chain'],
  ['TOPHAT', [3, 3], 'Tall formal headwear'],
  ['HANSOMCAB', [6, 3], 'Horse-drawn Victorian taxi'],
  ['PETTYTHEFT', [5, 5], 'Minor stealing charge'],
  ['HARDLABOUR', [4, 6], 'Tough penal sentence'],
  ['LIFEOFCRIME', [4, 2, 5], "A criminal's career"],
  ['SECONDHELPING', [6, 7], 'Another portion at dinner'],
  ['PUBLICHOUSE', [6, 5], 'A pub, more formally'],
  ['PICKPOCKET', null, 'Thief who works a crowd'],
  ['MAGISTRATE', null, 'A local judge'],
  ['CONSTABLE', null, 'Police officer of the lowest rank'],
  ['SENTENCE', null, "A judge's punishment; or a string of words"],
  ['GENTLEMAN', null, 'A well-mannered man'],
  ['MERCHANT', null, 'One who trades in goods'],
  ['SERVANT', null, 'A household employee'],
  ['LABOURER', null, 'A manual worker'],
  ['ROBBER', null, 'One who steals by force'],
  ['BEGGAR', null, 'One who lives by asking for money'],
  ['LODGER', null, 'One who rents a room'],
  ['PORTER', null, 'One who carries luggage'],
  ['COBBLER', null, 'One who mends shoes'],
  ['TINKER', null, 'A travelling mender of pots'],
  ['BUTCHER', null, 'A seller of meat'],
  ['MASTER', null, 'One in charge; or a chess title'],
  ['PAUPER', null, 'A very poor person'],
  ['LANTERN', null, 'Portable case protecting a light'],
  ['TAVERN', null, 'An inn that serves drink'],
  ['SERMON', null, 'A religious address'],
  ['PRISON', null, 'Place of confinement'],
  ['BANDIT', null, 'An armed robber'],
  ['HUSBAND', null, 'A married man'],
  ['SCANDAL', null, 'A disgraceful, talked-about affair'],
  ['CANDLE', null, 'Wax stick with a wick'],
  ['BUNDLE', null, 'A tied-up package'],
  ['KETTLE', null, 'Pot for boiling water'],
  ['PARLOUR', null, 'Old-fashioned sitting room'],
  ['CHARITY', null, 'Giving to those in need'],
  ['COBBLES', null, 'Rounded stones paving an old street'],
  ['BONNET', null, "Brimmed hat tied under the chin; or a car's hood"],
  ['RICKETS', null, 'Bone disease from lack of vitamin D'],
  ['GIBBET', null, 'Post for displaying an executed criminal'],
  ['CORSET', null, 'Stiff undergarment that cinches the waist'],
  ['MARKET', null, 'Place where goods are bought and sold'],
  ['ESTATE', null, 'Large area of owned land; or property left behind'],
  ['INHERIT', null, 'Receive from someone who has died'],
  ['MISER', null, 'A hoarder of money'],
  ['FEVER', null, 'A high temperature with illness'],
  ['HUNGER', null, 'A strong need for food'],
  ['GUTTER', null, "Channel at a road's edge"],
  ['LEDGER', null, 'A book of accounts'],
  ['SHILLING', null, 'Pre-decimal coin worth twelve pence'],
  ['FARTHING', null, 'Old coin worth a quarter of a penny'],
  ['PENNY', null, 'British coin, one hundred to a pound'],
  ['VILLAIN', null, 'The bad guy of a story'],
  ['VAGRANT', null, 'A homeless wanderer'],
  ['RANSOM', null, "Money demanded for a captive's release"],
  ['BACKALLEY', [4, 5], 'Narrow passage running behind buildings'],
  ['GINPALACE', [3, 6], 'Gaudy Victorian drinking hall'],
  ['MARKETSTALL', [6, 5], "A trader's table of goods"],
  ['HIGHSOCIETY', [4, 7], 'The wealthy, fashionable set'],
  ['BAREKNUCKLE', [4, 7], 'Boxing without gloves'],
  ['TOWNCRIER', [4, 5], 'Bellman who once announced the news'],
  ['STREETLAMP', [6, 4], 'Roadside light on a post'],
  ['DEBTORSPRISON', [7, 6], 'Jail for those who owed money'],
  ['COTTONMILL', [6, 4], 'A textile factory'],
  ['ALMSHOUSE', [4, 5], 'Charitable home for the poor'],
  ['POORHOUSE', [4, 5], 'Old shelter for the destitute'],
  ['OLDBAILEY', [3, 6], "London's central criminal court"],
  ['PAWNSHOP', [4, 4], 'Where goods are left as security for a loan'],
];

const bigrams = (w) => {
  const s = new Set();
  for (let i = 0; i < w.length - 1; i++) s.add(w.slice(i, i + 2));
  return s;
};
const items = POOL.map(([a, e, c]) => ({ a, e, c, bg: bigrams(a) }));
if (new Set(items.map((i) => i.a)).size !== items.length) throw new Error('duplicate answer');
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
const choose = (pool, k) => shuffle(pool.slice()).slice(0, k);
// Pick k words, roughly balancing multi-word and single-word entries.
const biasedPick = (pool, k) => {
  const multi = shuffle(pool.filter((c) => c.e));
  const single = shuffle(pool.filter((c) => !c.e));
  const out = [];
  while (out.length < k && (multi.length || single.length)) {
    const useMulti = multi.length && (!single.length || Math.random() < 0.5);
    out.push((useMulti ? multi : single).pop());
  }
  return out;
};

// Find a wiring: for each prev room a bridge bigram + successors (next indices,
// max 2), so that the chosen successors all contain that bigram and every next
// room is covered by at least one prev room.
function wireable(prev, next) {
  const opts = prev.map((p) => [...p.bg].filter((b) => next.some((w) => w.bg.has(b))));
  if (opts.some((o) => o.length === 0)) return null;
  let best = null;
  const rec = (i, covered, chosen) => {
    if (best) return;
    if (i === prev.length) {
      if (covered.size === next.length) best = chosen.slice();
      return;
    }
    for (const b of shuffle(opts[i].slice())) {
      const succ = [];
      next.forEach((w, j) => {
        if (w.bg.has(b) && succ.length < 2) succ.push(j);
      });
      const nc = new Set(covered);
      succ.forEach((j) => nc.add(j));
      chosen.push({ bridge: b, succ });
      rec(i + 1, nc, chosen);
      chosen.pop();
      if (best) return;
    }
  };
  rec(0, new Set(), []);
  return best;
}

function pickNextSet(prev, size, used) {
  const cand = items.filter(
    (it) => !used.has(it.a) && prev.some((p) => [...p.bg].some((b) => it.bg.has(b))),
  );
  for (let t = 0; t < 80; t++) {
    const next = biasedPick(cand, size);
    if (next.length < size) return null;
    const w = wireable(prev, next);
    if (w) return { next, wiring: w };
  }
  return null;
}

function build() {
  const used = new Set();
  const depths = [];
  const wirings = [];
  const d0 = biasedPick(items, SIZES[0]);
  d0.forEach((it) => used.add(it.a));
  depths.push(d0);
  for (let d = 1; d < SIZES.length; d++) {
    const r = pickNextSet(depths[d - 1], SIZES[d], used);
    if (!r) return null;
    r.next.forEach((it) => used.add(it.a));
    depths.push(r.next);
    wirings.push(r.wiring);
  }
  return { depths, wirings };
}

function assignBlue(rooms) {
  const required = META.split('').sort();
  const m = (i, usedRooms, out) => {
    if (i === required.length) return out;
    const letter = required[i];
    for (const r of shuffle(rooms.filter((r) => !usedRooms.has(r.id) && r.a.includes(letter)))) {
      usedRooms.add(r.id);
      out.push({ id: r.id, index: r.a.indexOf(letter) });
      if (m(i + 1, usedRooms, out)) return out;
      out.pop();
      usedRooms.delete(r.id);
    }
    return null;
  };
  return m(0, new Set(), []);
}

const COLS = { 3: [1, 3, 5], 2: [2, 4], 1: [3] };
const branchScore = (r) =>
  r.wirings.reduce((s, w) => s + w.reduce((a, e) => a + Math.max(0, e.succ.length - 1), 0), 0);

// Build rooms with `next` set from the wiring.
function materialize(r) {
  const rs = [];
  r.depths.forEach((dp, d) =>
    dp.forEach((it, i) =>
      rs.push({ id: `r${rs.length}`, ...it, row: d, idx: i, col: COLS[dp.length][i] }),
    ),
  );
  const at = (d, i) => rs.find((x) => x.row === d && x.idx === i);
  for (let d = 0; d < r.depths.length; d++) {
    if (d === r.depths.length - 1) {
      r.depths[d].forEach((_, i) => (at(d, i).next = []));
      continue;
    }
    r.depths[d].forEach((_, i) => {
      at(d, i).next = r.wirings[d][i].succ.map((j) => at(d + 1, j).id);
    });
  }
  return rs;
}

// Replicate the validator's derived bridges to check variety up front.
function bridgeVarietyOk(rs) {
  const all = rs.map((r) => r.a);
  const freq = (t) => all.filter((a) => a.includes(t)).length;
  const byId = new Map(rs.map((r) => [r.id, r]));
  const use = {};
  for (const r of rs) {
    if (!r.next.length) continue;
    const succ = r.next.map((id) => byId.get(id));
    let best = null;
    let bf = Infinity;
    for (let i = 0; i < r.a.length - 1; i++) {
      const b = r.a.slice(i, i + 2);
      if (succ.every((s) => s.a.includes(b)) && freq(b) < bf) {
        bf = freq(b);
        best = b;
      }
    }
    if (!best) return false;
    use[best] = (use[best] || 0) + 1;
  }
  return Math.max(...Object.values(use)) <= 6 && Object.keys(use).length >= 8;
}

let rooms = [];
let blue = null;
let bestScore = -1;
const stat = { build: 0, multi: 0, variety: 0, blue: 0 };
for (let attempt = 0; attempt < 500; attempt++) {
  const r = build();
  if (!r) continue;
  stat.build++;
  if (r.depths.flat().filter((it) => it.e).length < MIN_MULTI) continue;
  stat.multi++;
  const candRooms = materialize(r);
  if (!bridgeVarietyOk(candRooms)) continue;
  stat.variety++;
  const candBlue = assignBlue(candRooms);
  if (!candBlue) continue;
  stat.blue++;
  const score = branchScore(r);
  if (score > bestScore) {
    bestScore = score;
    rooms = candRooms;
    blue = candBlue;
  }
}
if (!blue) {
  console.error('stats', stat);
  throw new Error('no valid puzzle found');
}
console.error('branch score (extra exits):', bestScore, 'stats', stat);

const blueMap = new Map(blue.map((b) => [b.id, b.index]));
let pUp = 0;
for (const r of rooms) {
  r.metaIndex = blueMap.get(r.id);
  if (r.metaIndex === undefined && r.next.length && rooms.indexOf(r) % 4 === 1 && pUp < 7) {
    r.powerUp = pUp % 3 === 2 ? 'vowel' : 'reveal';
    pUp++;
  }
}

const finalId = roomAt(SIZES.length - 1, 0).id;
const startIds = rooms.filter((r) => r.row === 0).map((r) => r.id);
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const roomSrc = rooms
  .map((r) => {
    const lines = [
      `    id: '${r.id}',`,
      `    clue: '${esc(r.c)}',`,
      `    answer: '${r.a}',`,
      r.e ? `    enumeration: [${r.e.join(', ')}],` : null,
      `    next: [${r.next.map((n) => `'${n}'`).join(', ')}],`,
      `    row: ${r.row},`,
      `    col: ${r.col},`,
      r.powerUp ? `    powerUp: '${r.powerUp}',` : null,
      r.metaIndex !== undefined ? `    metaLetterIndex: ${r.metaIndex}, // ${r.a[r.metaIndex]}` : null,
      r.id === finalId ? `    isFinal: true,` : null,
    ].filter(Boolean);
    return `  {\n${lines.join('\n')}\n  },`;
  })
  .join('\n');

const out = `import type { Level, Room } from './types';

/**
 * Daily puzzle. The theme is hidden — the payoff is the meta answer, spelled by
 * the blue letters. Generated by scripts/genPuzzle.mjs.
 */

const rooms: Room[] = [
${roomSrc}
];

export const OLIVER: Level = {
  id: 'daily-${DATE}',
  date: '${DATE}',
  difficulty: '${DIFFICULTY}',
  title: '${TITLE}',
  subtitle: 'Solve a path to the top, then crack the hidden meta.',
  rooms,
  startRoomIds: [${startIds.map((s) => `'${s}'`).join(', ')}],
  finalRoomId: '${finalId}',
  meta: {
    answer: '${META}',
    enumeration: [${META_ENUM.join(', ')}],
    prompt:
      'No clue, no theme given \\u2014 only the eleven blue letters you gathered along the way. Rearrange them into the two words they spell. (6,5)',
    hint: 'Two words, eleven letters \\u2014 together they name what this whole maze has quietly been about.',
  },
};

export const PUZZLES: Level[] = [OLIVER];
export const LEVELS: Level[] = PUZZLES;
`;

writeFileSync(new URL('../src/game/levels.ts', import.meta.url), out);
console.log(
  `Wrote ${rooms.length} rooms (${rooms.filter((r) => r.e).length} multi-word).`,
  '\nBlue letters:',
  blue.map((b) => rooms.find((r) => r.id === b.id).a[b.index]).join(''),
);
