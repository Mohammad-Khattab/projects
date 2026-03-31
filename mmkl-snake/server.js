const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3004;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = process.env.VERCEL ? '/tmp/db.json' : path.join(__dirname, 'db.json');

function loadDB() { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
function saveDB(data) { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

if (!fs.existsSync(DB_FILE)) {
  const initial = {
    lamps: 500,
    equippedSkin: 'classic_neon',
    ownedSkins: ['classic_neon'],
    maps: {
      ocean:     { easy: false, medium: false, hard: false },
      desert:    { easy: false, medium: false, hard: false },
      jungle:    { easy: false, medium: false, hard: false },
      volcano:   { easy: false, medium: false, hard: false },
      tundra:    { easy: false, medium: false, hard: false },
      cyber:     { easy: false, medium: false, hard: false },
      swamp:     { easy: false, medium: false, hard: false },
      lunar:     { easy: false, medium: false, hard: false },
      graveyard: { easy: false, medium: false, hard: false },
    }
  };
  saveDB(initial);
} else {
  // Migrate old schema (unlocked/highestDifficulty) to new (easy/medium/hard)
  const data = loadDB();
  let dirty = false;
  Object.keys(data.maps || {}).forEach(id => {
    const m = data.maps[id];
    let mapDirty = false;
    if ('unlocked' in m || !('easy' in m)) {
      data.maps[id] = { easy: false, medium: false, hard: false, highScores: { easy: 0, medium: 0, hard: 0 } };
      mapDirty = true;
    }
    if (!data.maps[id].highScores) {
      data.maps[id].highScores = { easy: 0, medium: 0, hard: 0 };
      mapDirty = true;
    }
    if (mapDirty) dirty = true;
  });
  if (dirty) saveDB(data);
}

// GET user state
app.get('/api/user', (req, res) => {
  try { res.json(loadDB()); }
  catch(e) { res.status(500).json({ error: 'DB error' }); }
});

// POST add lamps earned in-game
app.post('/api/add-lamps', (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: 'bad amount' });
    const data = loadDB();
    data.lamps += amount;
    saveDB(data);
    res.json({ lamps: data.lamps });
  } catch(e) { res.status(500).json({ error: 'DB error' }); }
});

// POST complete a level — mark difficulty done, award bonus lamps
app.post('/api/complete-level', (req, res) => {
  try {
    const { mapId, difficulty } = req.body;
    const data = loadDB();
    if (!data.maps[mapId]) return res.status(400).json({ error: 'unknown map' });
    // Ensure the map entry has the new schema
    if (!('easy' in data.maps[mapId])) {
      data.maps[mapId] = { easy: false, medium: false, hard: false };
    }
    data.maps[mapId][difficulty] = true;
    const bonus = { easy: 30, medium: 70, hard: 150 }[difficulty] || 0;
    data.lamps += bonus;
    saveDB(data);
    res.json({ lamps: data.lamps, bonus });
  } catch(e) { res.status(500).json({ error: 'DB error' }); }
});

// POST buy skin
app.post('/api/buy-skin', (req, res) => {
  try {
    const { skinId, cost } = req.body;
    const data = loadDB();
    if (data.ownedSkins.includes(skinId)) return res.status(400).json({ error: 'already owned' });
    if (data.lamps < cost) return res.status(400).json({ error: 'not enough lamps' });
    data.lamps -= cost;
    data.ownedSkins.push(skinId);
    saveDB(data);
    res.json({ lamps: data.lamps });
  } catch(e) { res.status(500).json({ error: 'DB error' }); }
});

// POST equip skin
app.post('/api/equip-skin', (req, res) => {
  try {
    const { skinId } = req.body;
    const data = loadDB();
    if (!data.ownedSkins.includes(skinId)) return res.status(400).json({ error: 'not owned' });
    data.equippedSkin = skinId;
    saveDB(data);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: 'DB error' }); }
});

// POST save highscore
app.post('/api/save-highscore', (req, res) => {
  try {
    const { mapId, difficulty, score } = req.body;
    const data = loadDB();
    if (!data.maps[mapId]) return res.send({ ok: false });
    if (!data.maps[mapId].highScores) data.maps[mapId].highScores = { easy: 0, medium: 0, hard: 0 };
    
    if (score > (data.maps[mapId].highScores[difficulty] || 0)) {
      data.maps[mapId].highScores[difficulty] = score;
      saveDB(data);
      return res.json({ ok: true, newHigh: true, high: score });
    }
    res.json({ ok: true, newHigh: false, high: data.maps[mapId].highScores[difficulty] });
  } catch(e) { res.status(500).json({ error: 'DB error' }); }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`MKLL Snake server → http://localhost:${PORT}`));
}

module.exports = app;
