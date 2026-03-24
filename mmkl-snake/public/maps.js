// ===================================================================
// MKLL Snake — Map Challenges (all 9 maps)
// ===================================================================

function createMapChallenge(mapId, opts) {
  const MAP = {
    ocean:    () => new OceanChallenge(opts),
    desert:   () => new DesertChallenge(opts),
    jungle:   () => new JungleChallenge(opts),
    volcano:  () => new VolcanoChallenge(opts),
    tundra:   () => new TundraChallenge(opts),
    cyber:    () => new CyberChallenge(opts),
    swamp:    () => new SwampChallenge(opts),
    lunar:    () => new LunarChallenge(opts),
    graveyard:() => new GraveyardChallenge(opts),
  };
  return (MAP[mapId] || (() => new BaseChallenge(opts)))();
}

// ---- Base (no-op) ----
class BaseChallenge {
  constructor(o) { this.o = o; }
  start() {} stop() {} reset() {}
  tick() {} draw() {}
  modifyHead(h) { return h; }
}

// ---- 1. OCEAN — periodic wave slows snake ----
class OceanChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.waveTimer = 0;
    this.waveInterval = 8000; // every 8s
    this.waveActive = false;
    this.waveDuration = 3000;
    this.waveY = -1; // which row the wave is on (visual)
    this.slowTimer = null;
    this.originalSpeed = o.getSpeed();
  }
  start() { this.waveTimer = setInterval(() => this._triggerWave(), this.waveInterval); }
  stop()  { clearInterval(this.waveTimer); clearTimeout(this.slowTimer); }
  reset() { this.waveActive = false; }
  _triggerWave() {
    this.waveActive = true;
    this.waveY = 0;
    const slowSpeed = this.o.getSpeed() * 2.2;
    this.o.onSpeedChange(slowSpeed);
    showToast('🌊 Wave hits! Snake slowed!', '#6df0f5');
    if (window.SND) { window.SND.playSFX('wave'); }
    this.slowTimer = setTimeout(() => {
      this.waveActive = false;
      this.o.onSpeedChange(this.o.getSpeed());
      showToast('Wave passed!', '#6df0f5');
    }, this.waveDuration);
  }
  draw() {
    if (!this.waveActive) return;
    const { ctx, grid, cell } = this.o;
    ctx.save();
    ctx.fillStyle = 'rgba(109, 240, 245, 0.12)';
    ctx.fillRect(0, 0, grid * cell, grid * cell);
    // Animated wave lines
    const t = Date.now() / 400;
    ctx.strokeStyle = 'rgba(109,240,245,0.4)';
    ctx.lineWidth = 2;
    for (let row = 0; row < grid; row++) {
      ctx.beginPath();
      for (let px = 0; px <= grid * cell; px += 4) {
        const wy = row * cell + cell / 2 + Math.sin(px / 25 + t + row) * 5;
        px === 0 ? ctx.moveTo(px, wy) : ctx.lineTo(px, wy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ---- 2. DESERT — quicksand tiles freeze input ----
class DesertChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.quicksands = [];
    this.respawnTimer = null;
  }
  start() { this._spawnSand(); this.respawnTimer = setInterval(() => this._spawnSand(), 5000); }
  stop()  { clearInterval(this.respawnTimer); }
  reset() { this.quicksands = []; }
  _spawnSand() {
    this.quicksands = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      this.quicksands.push({ x: Math.floor(Math.random() * this.o.grid), y: Math.floor(Math.random() * this.o.grid) });
    }
  }
  tick() {
    const head = this.o.getSnake()[0];
    if (this.quicksands.some(q => q.x === head.x && q.y === head.y)) {
      this.o.onFreeze(1200);
      showToast('🏜️ Quicksand! Stuck!', '#edbb6d');
      if (window.SND) window.SND.playSFX('quicksand');
    }
  }
  draw() {
    const { ctx, cell } = this.o;
    ctx.save();
    this.quicksands.forEach(q => {
      ctx.fillStyle = 'rgba(200,160,80,0.35)';
      ctx.fillRect(q.x * cell, q.y * cell, cell, cell);
      ctx.strokeStyle = 'rgba(200,160,80,0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(q.x * cell, q.y * cell, cell, cell);
    });
    ctx.restore();
  }
}

// ---- 3. JUNGLE — walls that shift every 6s ----
class JungleChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.walls = [];
    this.timer = null;
  }
  start() { this._newWalls(); this.timer = setInterval(() => this._newWalls(), 6000); }
  stop()  { clearInterval(this.timer); }
  reset() { this.walls = []; }
  _newWalls() {
    this.walls = [];
    const segments = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < segments; i++) {
      const horiz = Math.random() > 0.5;
      const gx = Math.floor(Math.random() * (this.o.grid - 4)) + 2;
      const gy = Math.floor(Math.random() * (this.o.grid - 4)) + 2;
      const len = 3 + Math.floor(Math.random() * 4);
      for (let j = 0; j < len; j++) {
        this.walls.push(horiz ? { x: gx + j, y: gy } : { x: gx, y: gy + j });
      }
    }
    showToast('🌿 Walls shifted!', '#6eff59');
  }
  modifyHead(h) {
    if (this.walls.some(w => w.x === h.x && w.y === h.y)) {
      // Treat as wall collision → die via returning out-of-bounds sentinel
      return { x: -99, y: -99 };
    }
    return h;
  }
  draw() {
    const { ctx, cell } = this.o;
    ctx.save();
    this.walls.forEach(w => {
      ctx.fillStyle = 'rgba(60,120,40,0.7)';
      ctx.fillRect(w.x * cell + 1, w.y * cell + 1, cell - 2, cell - 2);
      ctx.strokeStyle = '#6eff59';
      ctx.lineWidth = 1;
      ctx.strokeRect(w.x * cell, w.y * cell, cell, cell);
    });
    ctx.restore();
  }
}

// ---- 4. VOLCANO — falling meteors ----
class VolcanoChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.meteors = [];
    this.spawnTimer = null;
    this.startTime = 0;
    this.slowTimer = null;
    this._isSlowed = false;
  }
  start() {
    this.startTime = Date.now();
    this._spawnLoop();
  }
  _spawnLoop() {
    this._spawnMeteor();
    const elapsed = Date.now() - this.startTime;
    // Difficulty curve: start at 2.5s, drop to 0.4s over ~50s
    const nextDelay = Math.max(400, 2500 - (elapsed / 25));
    this.spawnTimer = setTimeout(() => this._spawnLoop(), nextDelay);
  }
  stop()  { clearTimeout(this.spawnTimer); clearTimeout(this.slowTimer); }
  reset() { this.meteors = []; this._isSlowed = false; clearTimeout(this.slowTimer); }
  _spawnMeteor() {
    if (this.meteors.length >= 8) return;
    this.meteors.push({ x: Math.floor(Math.random() * this.o.grid), y: 0, age: 0, maxAge: this.o.grid });
    if (window.SND) window.SND.playSFX('meteor');
  }
  tick() {
    // Move meteors down
    this.meteors = this.meteors.filter(m => {
      m.age++;
      m.y = m.age;
      return m.age <= m.maxAge;
    });
    // Check head collision (Only the head, as requested)
    const head = this.o.getSnake()[0];
    const hit = this.meteors.some(m => m.x === head.x && Math.abs(m.y - head.y) < 1.1);

    if (hit && !this._isSlowed) {
      this._isSlowed = true;
      console.log('[VOLCANO] Meteor HIT! Applying slow...');
      const slowMultiplier = 2.2; 
      this.o.onSpeedChange(this.o.getSpeed() * slowMultiplier);
      showToast('🌋 Meteor head-shot! Slowed!', '#ff5733');
      
      this.slowTimer = setTimeout(() => {
        this._isSlowed = false;
        this.o.onSpeedChange(this.o.getSpeed());
        showToast('Speed recovered!', '#ff5733');
      }, 3000);
    }
  }
  draw() {
    const { ctx, cell } = this.o;
    ctx.save();
    this.meteors.forEach(m => {
      const x = m.x * cell + cell / 2, y = m.y * cell + cell / 2;
      ctx.shadowColor = '#ff5733'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff5733';
      ctx.beginPath(); ctx.arc(x, y, cell * 0.3, 0, Math.PI * 2); ctx.fill();
      // Tail
      ctx.strokeStyle = 'rgba(255,87,51,0.4)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - cell * 0.8); ctx.stroke();
      ctx.shadowBlur = 0;
    });
    ctx.restore();
  }
}

// ---- 5. TUNDRA — ice patches cause extra slide ----
class TundraChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.ice = [];
    this.timer = null;
  }
  start() { this._mkIce(); this.timer = setInterval(() => this._mkIce(), 7000); }
  stop()  { clearInterval(this.timer); }
  reset() { this.ice = []; }
  _mkIce() {
    this.ice = [];
    const count = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      this.ice.push({ x: Math.floor(Math.random() * this.o.grid), y: Math.floor(Math.random() * this.o.grid) });
    }
  }
  modifyHead(h, dir) {
    if (this.ice.some(ic => ic.x === h.x && ic.y === h.y)) {
      showToast('❄️ Ice! Sliding!', '#bffffc');
      return { x: h.x + dir.x, y: h.y + dir.y }; // slide one extra
    }
    return h;
  }
  draw() {
    const { ctx, cell } = this.o;
    ctx.save();
    this.ice.forEach(ic => {
      ctx.fillStyle = 'rgba(180,240,255,0.2)';
      ctx.fillRect(ic.x * cell, ic.y * cell, cell, cell);
      ctx.strokeStyle = 'rgba(180,240,255,0.5)'; ctx.lineWidth = 1;
      ctx.strokeRect(ic.x * cell, ic.y * cell, cell, cell);
    });
    ctx.restore();
  }
}

// ---- 6. CYBER ZONE — laser row sweeps ----
class CyberChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.laserY = -1;
    this.laserTimer = null;
    this.laserActive = false;
  }
  start() { this.laserTimer = setInterval(() => this._shootLaser(), 3500); }
  stop()  { clearInterval(this.laserTimer); }
  reset() { this.laserActive = false; this.laserY = -1; }
  _shootLaser() {
    this.laserY = 0;
    this.laserActive = true;
    showToast('⚡ Laser incoming!', '#b46bfa');
    if (window.SND) { window.SND.playSFX('laser'); }
  }
  tick() {
    if (!this.laserActive) return;
    
    // Move laser 1 row per game tick (perfect sync)
    this.laserY++;
    if (this.laserY >= this.o.grid) {
      this.laserActive = false;
      this.laserY = -1;
      return;
    }

    const head = this.o.getSnake()[0];
    if (head.y === this.laserY) {
      const dir = this.o.getDir ? this.o.getDir() : { y: 0 };
      // Slithering vertically through the laser is now safe!
      if (dir.y !== 0) return;

      this.o.onFreeze(800);
      showToast('⚡ Laser hit!', '#b46bfa');
    }
  }
  draw() {
    if (!this.laserActive || this.laserY < 0) return;
    const { ctx, cell, grid } = this.o;
    ctx.save();
    ctx.fillStyle = 'rgba(180,107,250,0.25)';
    ctx.fillRect(0, this.laserY * cell, grid * cell, cell);
    ctx.strokeStyle = '#b46bfa'; ctx.lineWidth = 2;
    ctx.shadowColor = '#b46bfa'; ctx.shadowBlur = 12;
    ctx.strokeRect(0, this.laserY * cell, grid * cell, cell);
    ctx.restore();
  }
}

// ---- 7. SWAMP — fog of war ----
class SwampChallenge extends BaseChallenge {
  tick() {}
  draw() {
    const { ctx, cell, grid, getSnake } = this.o;
    const head = getSnake()[0];
    const vr = 5; // visibility radius in cells
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    // Fill entire canvas with fog
    ctx.fillStyle = 'rgba(10, 30, 10, 0.88)';
    ctx.fillRect(0, 0, grid * cell, grid * cell);
    // Punch out a visible circle
    const cx = head.x * cell + cell / 2, cy = head.y * cell + cell / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vr * cell);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, vr * cell, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Label
    ctx.fillStyle = 'rgba(79,102,69,0.4)';
    ctx.fillRect(0, 0, grid * cell, grid * cell);
  }
}

// ---- 8. LUNAR BASE — speed boost rings ----
class LunarChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.rings = [];
    this.timer = null;
  }
  start() { this._spawnRing(); this.timer = setInterval(() => this._spawnRing(), 5000); }
  stop()  { clearInterval(this.timer); }
  reset() { this.rings = []; }
  _spawnRing() {
    this.rings.push({ x: Math.floor(Math.random() * this.o.grid), y: Math.floor(Math.random() * this.o.grid), life: 5000 });
  }
  tick() {
    const head = this.o.getSnake()[0];
    this.rings = this.rings.filter(r => {
      if (r.x === head.x && r.y === head.y) {
        const fast = this.o.getSpeed() * 0.55;
        this.o.onSpeedChange(fast);
        setTimeout(() => this.o.onSpeedChange(this.o.getSpeed()), 2500);
        showToast('🚀 Speed ring! Boosted!', '#b3b6c2');
        return false;
      }
      return true;
    });
  }
  draw() {
    const { ctx, cell } = this.o;
    const t = Date.now() / 500;
    ctx.save();
    this.rings.forEach(r => {
      const cx = r.x * cell + cell / 2, cy = r.y * cell + cell / 2;
      ctx.strokeStyle = '#b3b6c2'; ctx.lineWidth = 2;
      ctx.shadowColor = '#b3b6c2'; ctx.shadowBlur = 10;
      const rad = cell * 0.4 + Math.sin(t) * 3;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ---- 9. GRAVEYARD — phantom chaser ----
class GraveyardChallenge extends BaseChallenge {
  constructor(o) {
    super(o);
    this.phantom = { x: 0, y: 0 };
    this.tickCount = 0;
    this.startTime = 0;
  }
  start() { 
    this.phantom = { x: 2, y: 2 }; 
    this.startTime = Date.now(); 
  }
  stop()  {}
  reset() { this.phantom = { x: 2, y: 2 }; this.tickCount = 0; this.startTime = Date.now(); }
  tick() {
    const elapsed = Date.now() - this.startTime;
    // Speed limit: moveEvery starts at 6, drops to 2 over ~60s
    const moveEvery = Math.max(2, 6 - Math.floor(elapsed / 15000));
    
    this.tickCount++;
    if (this.tickCount % moveEvery !== 0) return;
    
    const head = this.o.getSnake()[0];
    // Simple pathfinding
    const dx = head.x - this.phantom.x, dy = head.y - this.phantom.y;
    if (Math.abs(dx) >= Math.abs(dy)) { this.phantom.x += Math.sign(dx); }
    else                               { this.phantom.y += Math.sign(dy); }
  }
  modifyHead(h) {
    // Lethal collision check against the head
    if (this.phantom.x === h.x && this.phantom.y === h.y) {
      showToast('👻 Phantom caught you! DEATH.', '#7b8296');
      return { x: -99, y: -99 }; // death sentinel
    }
    return h;
  }
  draw() {
    const { ctx, cell } = this.o;
    const x = this.phantom.x * cell + cell / 2, y = this.phantom.y * cell + cell / 2;
    ctx.save();
    ctx.shadowColor = '#7b8296'; ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(123,130,150,0.7)';
    ctx.beginPath(); ctx.arc(x, y, cell * 0.38, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#ff4444';
    [-4, 4].forEach(ox => {
      ctx.beginPath(); ctx.arc(x + ox, y - 2, 2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }
}

// ---- Toast helper ----
function showToast(msg, color = '#6fff54') {
  let toast = document.getElementById('game-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.color = color;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';
  }, 2200);
}
