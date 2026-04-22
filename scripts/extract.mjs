/**
 * Extraction script: reads NyayaGame.jsx and outputs the CSS portion
 * and each component to separate files.
 * Run: node scripts/extract.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const src = readFileSync('src/NyayaGame.jsx', 'utf-8');

// ── Extract CSS ──────────────────────────────────────────────────────────
const cssMatch = src.match(/const styles = `([\s\S]*?)`;/);
if (cssMatch) {
  mkdirSync('src/styles', { recursive: true });
  writeFileSync('src/styles/game.css', cssMatch[1].trim() + '\n');
  console.log('✅ Extracted src/styles/game.css');
}

// ── Extract components by marker comments ────────────────────────────────
function extractComponent(name, startMarker, endMarkers) {
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) { console.log(`❌ ${name}: start marker not found`); return null; }
  
  let endIdx = src.length;
  for (const marker of endMarkers) {
    const idx = src.indexOf(marker, startIdx + startMarker.length);
    if (idx !== -1 && idx < endIdx) endIdx = idx;
  }
  
  return src.slice(startIdx, endIdx).trim();
}

// Log component boundaries
const markers = [
  'function CosmicBackground()',
  'function Confetti(',
  'function Notification(',
  'function LoginPage(',
  'function StudentDashboard(',
  'function GameEngine(',
  'function LevelComplete(',
  'function LeaderboardPage(',
  'function TeacherDashboard(',
  'function Navbar(',
  'export default function App()',
];

markers.forEach(m => {
  const idx = src.indexOf(m);
  console.log(`${m.padEnd(40)} → line ~${idx === -1 ? 'NOT FOUND' : src.slice(0, idx).split('\n').length}`);
});

console.log('\n✅ Data extraction complete. Components will be created manually.');
