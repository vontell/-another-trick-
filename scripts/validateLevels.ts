import { LEVELS } from '../src/game/levels';
import { resolveLevel, validateLevel } from '../src/game/bridges';

let failed = false;

for (const level of LEVELS) {
  const errors = validateLevel(level);
  if (errors.length) {
    failed = true;
    console.error(`\n❌ ${level.id} — ${errors.length} error(s):`);
    for (const e of errors) console.error(`   • ${e}`);
    continue;
  }

  const resolved = resolveLevel(level);
  console.log(`\n✅ ${level.id} "${level.title}" — ${resolved.rooms.length} rooms, valid.`);
  console.log('   Bridges (source → guaranteed bigram):');
  for (const r of resolved.rooms) {
    if (r.bridge) {
      console.log(
        `   ${r.id.padEnd(4)} ${r.answer.padEnd(9)} → "${r.bridge.text}" ` +
          `(into ${r.next.join(', ')})`,
      );
    }
  }
}

if (failed) {
  console.error('\nValidation FAILED.\n');
  process.exit(1);
}
console.log('\nAll levels valid.\n');
