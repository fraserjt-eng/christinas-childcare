// scripts/record-v3.mjs
// Pipeline orchestrator: voice → timestamps → avatar → record → manifest → render → mix → final
import { execSync } from 'child_process';

const phase = process.argv[2] || 'help';
const section = process.argv[3] || 'admin';

const PHASES = {
  voice: () => execSync(`node scripts/generate-voice.mjs ${section}`, { stdio: 'inherit' }),
  timestamps: () => execSync('node scripts/generate-timestamps.mjs', { stdio: 'inherit' }),
  avatar: () => execSync('node scripts/generate-avatar.mjs', { stdio: 'inherit' }),
  manifest: () => execSync('node scripts/build-manifest.mjs', { stdio: 'inherit' }),
  score: () => execSync('node scripts/score-video.mjs public/videos/walkthroughs/admin-final.mp4', { stdio: 'inherit' }),
};

const PHASE_ORDER = ['voice', 'timestamps', 'avatar', 'manifest'];

console.log('\n=== Christina\'s Video Pipeline v3 ===');
console.log(`Phase: ${phase} | Section: ${section}\n`);

if (phase === 'all') {
  for (const name of PHASE_ORDER) {
    console.log(`\n--- Phase: ${name} ---\n`);
    try {
      PHASES[name]();
    } catch (err) {
      console.error(`Phase ${name} failed: ${err.message}`);
      console.error('Continuing to next phase...\n');
    }
  }
  console.log('\n=== Pipeline complete ===\n');
} else if (phase === 'help') {
  console.log('Usage: node scripts/record-v3.mjs <phase> [section]\n');
  console.log('Phases:');
  console.log('  voice       Generate narration audio (ElevenLabs + edge-tts fallback)');
  console.log('  timestamps  Generate word-level timestamps (whisper + estimation)');
  console.log('  avatar      Generate D-ID avatar clips (or static fallback)');
  console.log('  manifest    Build manifest JSON from all assets');
  console.log('  score       Run video quality scorecard on current output');
  console.log('  all         Run voice -> timestamps -> avatar -> manifest in sequence');
  console.log('\nSections: admin, avatar, all (default: admin)');
} else if (PHASES[phase]) {
  PHASES[phase]();
} else {
  console.error(`Unknown phase: ${phase}`);
  console.log('Run with no args for help.');
  process.exit(1);
}
