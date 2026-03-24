import { Level } from 'level';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'leveldb');

const db = new Level(dbPath, { createIfMissing: false });

const result = {};

try {
  await db.open();
  for await (const [key, value] of db.iterator()) {
    const keyStr = key.toString();
    // file:// localStorage entries
    if (keyStr.includes('file') || keyStr.toLowerCase().includes('xo') || keyStr.toLowerCase().includes('game')) {
      result[keyStr] = value.toString();
      console.log('KEY:', keyStr);
      console.log('VAL:', value.toString().substring(0, 200));
      console.log('---');
    }
  }
  await db.close();
} catch (e) {
  console.error('Error:', e.message);
}

console.log('\n=== ALL FILE:// KEYS ===');
console.log(JSON.stringify(result, null, 2));
