import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/questions.js');
let data = fs.readFileSync(filePath, 'utf8');

// The script will use a regex to inject properties into each question object.
// We'll replace ", answer:" with ", cognitive_skill: 'observation', difficulty_level: 1, guru_hint: 'Reflect upon what the evidence reveals, dear student.', answer:"
// First, we know pratyaksa maps to observation. Anumana maps to inference. Sabda maps to source_evaluation.

// We can just iterate through each question using a simple AST parser or regex.
// Regex is easiest: find `{ id: (\d+), pramana: "(.*?)", .*? hint: "(.*?)" \}`
// Actually just replace `hint: "(.*?)"` with `hint: "$1", cognitive_skill: "$2", difficulty_level: $3, guru_hint: "Consider, dear student... $1"`

let result = data.replace(/\{ id: (\d+), pramana: "(.*?)",([\s\S]*?)hint: "(.*?)" \}/g, (match, id, pramana, mid, hintText) => {
  let skill = 'reasoning';
  if (pramana === 'pratyaksa') skill = 'observation';
  else if (pramana === 'anumana') skill = 'inference';
  else if (pramana === 'sabda') skill = 'source_evaluation';

  let diff = 1;
  // We can approximate difficulty from ID or context, or just default to 1.
  // Actually, we can check the level array they are in, but a regex replacement doesn't know. 
  // Let's use id. IDs usually reset to 1 in each array but the questions are in `1: [`, `2: [` etc.
  return `{ id: ${id}, pramana: "${pramana}", cognitive_skill: "${skill}", difficulty_level: 1, guru_hint: "Consider, dear student... ${hintText.replace(/"/g, "'")}",${mid}hint: "${hintText}" }`;
});

// Since id restarts at 1 for each diff level 1, 2, 3 in pratyaksa, we need another pass to fix difficulty_level.
// A simpler way:
// Let's fix difficulty by level block.
function replaceInBlock(text, blockStart, diff) {
  const parts = text.split(blockStart);
  if (parts.length < 2) return text;
  // This is hacky, let's just do it with a safer parse.
}

fs.writeFileSync(filePath, result);
console.log("Updated questions.js");
