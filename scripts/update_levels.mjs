import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/questions.js');
let data = fs.readFileSync(filePath, 'utf8');

// Match `1: [ ... ], 2: [ ... ], 3: [ ... ]`
let lines = data.split('\n');
let currentLevel = 1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('1: [')) currentLevel = 1;
  else if (lines[i].includes('2: [')) currentLevel = 2;
  else if (lines[i].includes('3: [')) currentLevel = 3;

  if (lines[i].includes('difficulty_level:')) {
    lines[i] = lines[i].replace(/difficulty_level: \d+/, `difficulty_level: ${currentLevel}`);
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log("Updated difficulty levels");
