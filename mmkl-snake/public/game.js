// ===================================================================
// MKLL Snake — Core Game Engine
// ===================================================================

const GRID = 20; // cells
const CELL = 28; // px per cell
const CANVAS_SIZE = GRID * CELL; // 560px

const SPEEDS = { easy: 200, medium: 130, hard: 80 }; // ms per tick

// ---- State ----
let snake, dir, nextDir, lamps, score, lampsEarned;
let gameLoop, gameRunning, gamePaused;
let currentMap, currentDifficulty;
let mapChallenge; // challenge controller from maps.js

// ---- DOM refs ----
let canvas, ctx, scoreEl, lampCountEl;

// ---- Init ----
function initGame(mapId, difficulty) {
  currentMap = mapId;
  currentDifficulty = difficulty;

  // Hide landing, show game screen
  document.getElementById('landing-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  scoreEl = document.getElementById('hud-score');
  lampCountEl = document.getElementById('hud-lamps');

  resetGame();
  setupInput();

  // Init map-specific challenge (maps.js)
  mapChallenge = createMapChallenge(mapId, {
    grid: GRID, cell: CELL, ctx,
    getSnake: () => snake,
    getDir:   () => dir,
    getSpeed: () => SPEEDS[difficulty],
    onSpeedChange: (ms) => restartLoop(ms),
    onFreeze: freeze,
    onFog: () => {},
  });
  mapChallenge.start();

  startLoop(SPEEDS[difficulty]);
  drawFrame();
}

function resetGame() {
  const mid = Math.floor(GRID / 2);
  snake = [
    { x: mid,     y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  dir      = { x: 1, y: 0 };
  nextDir  = { x: 1, y: 0 };
  lamps = [];
  score = 0;
  lampsEarned = 0;
  gameRunning = true;
  gamePaused  = false;
  spawnLamp();
  spawnLamp();
  updateHUD();
}

// ---- Loop ----
function startLoop(ms) {
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, ms);
}
function restartLoop(ms) { startLoop(ms); }

function tick() {
  if (!gameRunning || gamePaused) return;
  move();
  if (!gameRunning) return; // died in move()
  checkLampEat();
  drawFrame();
  scoreEl.textContent = score;
  if (mapChallenge) mapChallenge.tick();
}

// ---- Movement ----
function move() {
  dir = { ...nextDir };
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // Map challenge may modify head (e.g. ice slide)
  const modifiedHead = mapChallenge ? mapChallenge.modifyHead(head, dir) : head;

  // Wall collision
  if (modifiedHead.x < 0 || modifiedHead.x >= GRID || modifiedHead.y < 0 || modifiedHead.y >= GRID) {
    die(); return;
  }
  // Self collision
  if (snake.some(s => s.x === modifiedHead.x && s.y === modifiedHead.y)) {
    die(); return;
  }

  snake.unshift(modifiedHead);
  snake.pop(); // will be re-added in checkLampEat if eaten
}

// ---- Lamp ----
function spawnLamp() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y) || lamps.some(l => l.x === pos.x && l.y === pos.y));
  lamps.push(pos);
}

function checkLampEat() {
  const head = snake[0];
  const idx = lamps.findIndex(l => l.x === head.x && l.y === head.y);
  if (idx !== -1) {
    lamps.splice(idx, 1);
    snake.push({ ...snake[snake.length - 1] }); // grow
    score += 10;
    lampsEarned += 1;
    spawnLamp();
    updateHUD();
    addLampsToBackend(1);
    if (window.SND) window.SND.playSFX('eat');

    // Check win condition (campaign level goal)
    const goal = window.levelGoal;
    if (goal && lampsEarned >= goal) {
      winLevel();
    }
  }
}

// ---- Draw ----
function drawFrame() {
  const theme = window.activeMapTheme || { bg:'#0a0e0a', grid:'rgba(111,255,84,0.04)', accent:'#6fff54' };

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Grid lines
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, CANVAS_SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(CANVAS_SIZE, i * CELL); ctx.stroke();
  }

  // Map challenge draws its own elements (hazards, effects)
  if (mapChallenge) mapChallenge.draw();

  // Lamps
  lamps.forEach(l => drawLamp(l.x, l.y));

  // Snake body
  snake.forEach((seg, i) => {
    let skinHex = window.activeSkinColor || '#28a028';
    if (window.currentSkinId === 'rgb_chroma') {
      const hue = (Date.now() / 12 + i * 10) % 360;
      const lum = 50 - (i / snake.length) * 20; 
      ctx.fillStyle = `hsl(${hue}, 100%, ${lum}%)`;
    } else {
      // Parse skin hex to RGB for gradient blend
      const base = hexToRgb(skinHex);
      const t = i / snake.length;
      const r = Math.floor(base.r * (1 - t * 0.6));
      const g = Math.floor(base.g * (1 - t * 0.6));
      const b = Math.floor(base.b * (1 - t * 0.6));
      ctx.fillStyle = `rgb(${r},${g},${b})`;
    }
    const pad = i === 0 ? 1 : 3;
    ctx.beginPath();
    ctx.roundRect(l(seg.x) + pad, l(seg.y) + pad, CELL - pad*2, CELL - pad*2, 6);
    ctx.fill();
    // Neon border on head
    if (i === 0) {
      const accent = window.activeMapTheme?.accent || skinHex;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      drawSnakeHead(seg.x, seg.y, skinHex);
    }
  });
}

function l(n) { return n * CELL; } // grid to px

function drawLamp(gx, gy) {
  const x = l(gx) + CELL / 2, y = l(gy) + CELL / 2;
  ctx.save();
  ctx.shadowColor = '#ffea00';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffea00';
  ctx.beginPath();
  ctx.arc(x, y, CELL * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - 2, y - 2, CELL * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSnakeHead(gx, gy, skinColor) {
  const cx = l(gx) + CELL / 2, cy = l(gy) + CELL / 2;
  const ex = dir.x, ey = dir.y;
  const perp = { x: -ey, y: ex };
  // Two glowing eyes
  [1, -1].forEach(side => {
    const ox = cx + ex * 4 + perp.x * 5 * side;
    const oy = cy + ey * 4 + perp.y * 5 * side;
    ctx.fillStyle = '#ffea00';
    ctx.shadowColor = '#ffea00';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });
}

// Helper: parse hex string to {r,g,b}
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#',''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// ---- Freeze helper (used by maps) ----
let freezeTimer = null;
function freeze(ms) {
  gamePaused = true;
  clearTimeout(freezeTimer);
  freezeTimer = setTimeout(() => { gamePaused = false; }, ms);
}

// ---- Immediate lamp flush (call on win/die) ----
function flushPendingLamps() {
  if (pendingLamps <= 0) return Promise.resolve();
  clearTimeout(syncDebounce);
  const amount = pendingLamps;
  pendingLamps = 0;
  return fetch('/api/add-lamps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  }).catch(() => {});
}

// ---- Death ----
function die() {
  console.log('[GAME] Snake died.');
  gameRunning = false;
  clearInterval(gameLoop);
  if (mapChallenge) mapChallenge.stop();
  if (window.SND) {
    window.SND.stopMusic();
    window.SND.playSFX('lose');
  }
  flushPendingLamps();

  // Save Highscore if in Free Play
  if (window.currentMode === 'freeplay') {
    const mapId = window.currentMapId, diff = window.currentDiff;
    console.log(`[GAME] Saving highscore for ${mapId} / ${diff}: ${score}`);
    fetch('/api/save-highscore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapId, difficulty: diff, score: score })
    }).then(r => {
      if (!r.ok) console.error('[GAME] save-highscore fetch failed:', r.status);
      return r.json();
    }).then(d => {
      if (d.newHigh) console.log('[GAME] NEW PERSONAL BEST!', d.high);
      else console.log('[GAME] Score saved. High:', d.high);
      if (typeof fetchAndRefreshLamps === 'function') fetchAndRefreshLamps();
    }).catch(err => {
      console.error('[GAME] Error in highscore save:', err);
    });
  }

  setTimeout(() => showDeathScreen(), 400);
}

function winLevel() {
  console.log('[GAME] Level Won! Goal reached.');
  gameRunning = false;
  clearInterval(gameLoop);
  if (mapChallenge) mapChallenge.stop();
  if (window.SND) {
    window.SND.stopMusic();
    window.SND.playSFX('win');
  }
  
  const mapId = window.currentMapId, diff = window.currentDiff;
  console.log(`[GAME] Completing: ${mapId} / ${diff}`);

  // Save Highscore if in Free Play
  if (window.currentMode === 'freeplay') {
    fetch('/api/save-highscore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mapId, difficulty: diff, score: score })
    }).catch(() => {});
  }

  // 1. Flush lamps
  flushPendingLamps().then(() => {
    console.log('[GAME] Lamps flushed. Posting completion...');
    // 2. Post completion
    return fetch('/api/complete-level', {
      method: 'POST', 
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mapId, difficulty: diff })
    });
  }).then(r => {
    if (!r.ok) {
      console.error('[GAME] Failed to complete level on server:', r.status);
      throw new Error('Completion failed');
    }
    console.log('[GAME] Server acknowledged completion. Refreshing user data...');
    // 3. Refresh user state
    if (typeof fetchAndRefreshLamps === 'function') {
      return fetchAndRefreshLamps();
    }
  }).then(() => {
    console.log('[GAME] User data refreshed. Showing win screen.');
    showWinScreen();
  }).catch(err => {
    console.error('[GAME] Win level sequence failed:', err);
    showWinScreen(); // Still show it so they can try again or exit
  });
}

function showWinScreen() {
  const DIFFS = ['easy', 'medium', 'hard'];
  const currentIdx = DIFFS.indexOf(window.currentDiff);
  const nextDiff   = DIFFS[currentIdx + 1]; // undefined if Hard was beaten

  document.getElementById('death-title').innerHTML = 'LEVEL <span>CLEAR!</span>';
  document.getElementById('death-score').textContent  = score;
  document.getElementById('death-lamps').textContent  = lampsEarned;

  const btn = document.getElementById('primary-end-btn');
  if (nextDiff) {
    btn.textContent = `▶ Next Level (${nextDiff.charAt(0).toUpperCase() + nextDiff.slice(1)})`;
    btn.onclick = () => {
      document.getElementById('death-screen').style.display = 'none';
      // Start next difficulty on the same map
      window.currentDiff  = nextDiff;
      window.levelGoal    = (typeof DIFF_GOALS !== 'undefined') ? DIFF_GOALS[nextDiff] : { easy:15, medium:25, hard:40 }[nextDiff];
      const meta = (typeof MAP_META !== 'undefined') ? MAP_META[window.currentMapId] : {};
      document.getElementById('hud-diff').textContent = `${nextDiff.toUpperCase()} · Goal: ${window.levelGoal} 💡`;
      initGame(window.currentMapId, nextDiff);
    };
  } else {
    btn.textContent = '🏆 All Clear!';
    btn.onclick = () => returnToMenu();
  }

  document.getElementById('death-screen').style.display = 'flex';
}

function showDeathScreen() {
  document.getElementById('death-title').innerHTML = 'GAME <span>OVER</span>';
  document.getElementById('death-score').textContent = score;
  document.getElementById('death-lamps').textContent = lampsEarned;
  const btn = document.getElementById('primary-end-btn');
  btn.textContent = '↺ Try Again';
  btn.onclick = retryGame;
  document.getElementById('death-screen').style.display = 'flex';
}

// ---- Input ----
function setupInput() {
  document.removeEventListener('keydown', handleKey);
  document.addEventListener('keydown', handleKey);
}

function handleKey(e) {
  const map = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
    Escape: null,
  };
  const k = e.key;
  if (k === 'Escape') { returnToMenu(); return; }
  const newDir = map[k];
  if (!newDir) return;
  e.preventDefault();
  // Prevent 180° flip
  if (newDir.x === -dir.x && newDir.y === -dir.y) return;
  nextDir = newDir;
}

// ---- HUD ----
function updateHUD() {
  lampCountEl.textContent = lampsEarned;
}

// ---- Backend sync ----
let pendingLamps = 0, syncDebounce = null;
function addLampsToBackend(n) {
  pendingLamps += n;
  clearTimeout(syncDebounce);
  syncDebounce = setTimeout(() => {
    fetch('/api/add-lamps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: pendingLamps })
    }).catch(() => {});
    pendingLamps = 0;
  }, 1500);
}

// ---- Menu navigation ----
function retryGame() {
  document.getElementById('death-screen').style.display = 'none';
  resetGame();
  if (mapChallenge) { mapChallenge.reset(); mapChallenge.start(); }
  if (window.SND) {
    window.SND.stopMusic();
    window.SND.playMusic(currentMap);
  }
  startLoop(SPEEDS[currentDifficulty]);
  drawFrame();
}

function returnToMenu() {
  clearInterval(gameLoop);
  if (mapChallenge) mapChallenge.stop();
  document.getElementById('death-screen').style.display = 'none';
  document.getElementById('game-screen').style.display  = 'none';
  document.getElementById('landing-screen').style.display = 'block';
}
