"use strict";

const SIDES = 6;
const TAU = Math.PI * 2;

class Rng {
  constructor(seed = 1) {
    this.state = (seed >>> 0) || 1;
  }

  rand(n) {
    this.state ^= (this.state << 13) >>> 0;
    this.state ^= this.state >>> 17;
    this.state ^= (this.state << 5) >>> 0;
    return (this.state >>> 0) % n;
  }
}

const LEVELS = [
  { name: "Line", speed: 34, rotation: 1, families: [0, 1, 3] },
  { name: "Triangle", speed: 38, rotation: 2, families: [0, 1, 2, 3] },
  { name: "Square", speed: 42, rotation: 3, families: [1, 2, 3, 5] },
  { name: "Pentagon", speed: 46, rotation: 4, families: [0, 2, 4, 5] },
  { name: "Hexagon", speed: 50, rotation: 5, families: [2, 3, 4, 5, 6] },
  { name: "Hyper", speed: 56, rotation: 6, families: [0, 1, 2, 3, 4, 5, 6] }
];

const FAMILY_NAMES = [
  "spiral gap",
  "triplets",
  "double spiral",
  "staircase",
  "corridor",
  "pinwheel",
  "comb"
];

const PALETTES = [
  ["#121314", "#ffcf40", "#ef476f", "#2ec4b6", "#f6f4ec"],
  ["#101418", "#f95738", "#43aa8b", "#f9c74f", "#edf6f9"],
  ["#17151b", "#d4f4dd", "#ff6b6b", "#4d96ff", "#fff7d6"],
  ["#111514", "#a7c957", "#f2e8cf", "#bc4749", "#fefae0"],
  ["#101010", "#f72585", "#4cc9f0", "#fee440", "#f8f9fa"]
];

const OFFSET_SCALE = 0.12;
const LENGTH_SCALE = 0.22;
const BASE_DISTANCE = 720;
const MIN_WALL_LENGTH = 28;
const ORIGINAL_TICK_MS = 1000 / 60;

function wall(side, offset = 0, length = 200, flags = 0) {
  const normalized = ((side % SIDES) + SIDES) % SIDES;
  return { side: normalized, offset, length, flags };
}

function ring(gap, offset = 0, length = 200) {
  const out = [];
  const normalized = ((gap % SIDES) + SIDES) % SIDES;
  for (let side = 0; side < SIDES; side += 1) {
    if (side !== normalized) out.push(wall(side, offset, length));
  }
  return out;
}

function ringTwoGaps(gapA, gapB, offset = 0, length = 200) {
  const out = [];
  const a = ((gapA % SIDES) + SIDES) % SIDES;
  const b = ((gapB % SIDES) + SIDES) % SIDES;
  for (let side = 0; side < SIDES; side += 1) {
    if (side !== a && side !== b) out.push(wall(side, offset, length));
  }
  return out;
}

function alternatingTriplets(start = 0, rows = 5, step = 600, length = 200) {
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    const side0 = (start + row) % 2;
    const offset = row * step;
    out.push(wall(side0, offset, length));
    out.push(wall(side0 + 2, offset, length));
    out.push(wall(side0 + 4, offset, length));
  }
  return out;
}

function spiralGap(start = 0, rows = 6, step = 600, length = 200, direction = 1) {
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    out.push(...ring(start + row * direction, row * step, length));
  }
  return out;
}

function doubleSpiral(start = 0, rows = 5, step = 700, length = 220, direction = 1) {
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    const gap = start + row * direction;
    out.push(...ringTwoGaps(gap, gap + 3, row * step, length));
  }
  return out;
}

function staircase(start = 0, rows = 12, step = 220, length = 330, direction = 1) {
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    out.push(wall(start + row * direction, row * step, length));
  }
  return out;
}

function longCorridor(gapA = 0, gapB = 3, length = 3200) {
  const out = [];
  const a = ((gapA % SIDES) + SIDES) % SIDES;
  const b = ((gapB % SIDES) + SIDES) % SIDES;
  for (let side = 0; side < SIDES; side += 1) {
    if (side !== a && side !== b) out.push(wall(side, 0, 240));
  }
  out.push(wall(gapA - 1, 800, Math.floor(length / 3)));
  out.push(wall(gapB + 1, 800, Math.floor(length / 3)));
  return out;
}

function pinwheel(start = 0, rows = 6, step = 500, length = 260, direction = 1) {
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    const side = start + row * direction;
    const offset = row * step;
    out.push(wall(side, offset, length));
    out.push(wall(side + 2, offset, length));
  }
  return out;
}

function comb(start = 0, rows = 6, step = 450, length = 240) {
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    const offset = row * step;
    out.push(wall(start, offset, length));
    out.push(wall(start + 3, offset, length));
    out.push(wall(start + (row & 1 ? 1 : 4), offset + Math.floor(step / 2), length));
  }
  return out;
}

function makeWave(kind, rng, rank = 0) {
  const start = rng.rand(SIDES);
  const direction = rng.rand(2) === 0 ? 1 : -1;
  if (kind === 0) return { delay: 90, name: FAMILY_NAMES[kind], walls: spiralGap(start, 5 + Math.min(rank, 2), 560, 190, direction) };
  if (kind === 1) return { delay: 100, name: FAMILY_NAMES[kind], walls: alternatingTriplets(start & 1, 5, 580, 210) };
  if (kind === 2) return { delay: 110, name: FAMILY_NAMES[kind], walls: doubleSpiral(start, 5, 620, 210, direction) };
  if (kind === 3) return { delay: 85, name: FAMILY_NAMES[kind], walls: staircase(start, 12 + rank, 210, 300, direction) };
  if (kind === 4) return { delay: 130, name: FAMILY_NAMES[kind], walls: longCorridor(start, start + 3, 2800 + rank * 220) };
  if (kind === 5) return { delay: 80, name: FAMILY_NAMES[kind], walls: pinwheel(start, 7, 440, 250, direction) };
  return { delay: 95, name: FAMILY_NAMES[kind], walls: comb(start, 6, 420, 230) };
}

function nextWave(levelIndex, rank, rng, selectedKind = -1) {
  const level = LEVELS[levelIndex % LEVELS.length];
  const kind = selectedKind >= 0 && selectedKind < FAMILY_NAMES.length
    ? selectedKind
    : level.families[rng.rand(level.families.length)];
  const wave = makeWave(kind, rng, rank);
  return {
    level,
    kind,
    name: wave.name,
    delay: Math.max(8, Math.floor((wave.delay * 40) / level.speed)),
    walls: wave.walls
  };
}

const canvas = document.getElementById("hexCanvas");
const ctx = canvas.getContext("2d");
const patternSelect = document.getElementById("patternSelect");
const levelSelect = document.getElementById("levelSelect");
const tempoRange = document.getElementById("tempoRange");
const seedInput = document.getElementById("seedInput");
const pauseButton = document.getElementById("pauseButton");
const rerollButton = document.getElementById("rerollButton");
const stepButton = document.getElementById("stepButton");
const paletteSwatches = document.getElementById("paletteSwatches");
const stageName = document.getElementById("stageName");
const rankLabel = document.getElementById("rankLabel");
const waveLabel = document.getElementById("waveLabel");
const wallLabel = document.getElementById("wallLabel");
const patternName = document.getElementById("patternName");
const delayLabel = document.getElementById("delayLabel");
const rotationLabel = document.getElementById("rotationLabel");

const state = {
  levelIndex: 0,
  rank: 0,
  waveCount: 0,
  patternKind: -1,
  paused: false,
  seed: 123,
  rng: new Rng(123),
  walls: [],
  pendingWave: null,
  nextSpawnDelay: 0,
  rotation: 0,
  paletteIndex: 0,
  lastTime: performance.now()
};

const randomOption = document.createElement("option");
randomOption.value = "-1";
randomOption.textContent = "Random patterns";
patternSelect.append(randomOption);

for (let index = 0; index < FAMILY_NAMES.length; index += 1) {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = FAMILY_NAMES[index];
  patternSelect.append(option);
}

for (let index = 0; index < LEVELS.length; index += 1) {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = LEVELS[index].name;
  levelSelect.append(option);
}

PALETTES.forEach((palette, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.title = `Palette ${index + 1}`;
  button.setAttribute("aria-pressed", index === state.paletteIndex ? "true" : "false");
  button.style.background = `linear-gradient(90deg, ${palette[1]}, ${palette[2]} 50%, ${palette[3]})`;
  button.addEventListener("click", () => {
    state.paletteIndex = index;
    updatePaletteButtons();
  });
  paletteSwatches.append(button);
});

function updatePaletteButtons() {
  [...paletteSwatches.children].forEach((button, index) => {
    button.setAttribute("aria-pressed", index === state.paletteIndex ? "true" : "false");
  });
}

function resetRun() {
  state.seed = Math.max(1, Number(seedInput.value) || 1);
  state.rng = new Rng(state.seed);
  state.rank = 0;
  state.waveCount = 0;
  state.walls = [];
  state.pendingWave = null;
  state.nextSpawnDelay = 0;
}

function wallMetrics(wallDef) {
  const distance = BASE_DISTANCE + wallDef.offset * OFFSET_SCALE;
  const length = Math.max(MIN_WALL_LENGTH, wallDef.length * LENGTH_SCALE);
  return { distance, length };
}

function getPendingWave() {
  if (!state.pendingWave) {
    state.pendingWave = nextWave(state.levelIndex, Math.floor(state.rank), state.rng, state.patternKind);
  }
  return state.pendingWave;
}

function waveRange(wave) {
  let inner = Infinity;
  let outer = -Infinity;
  for (const wallDef of wave.walls) {
    const wall = wallMetrics(wallDef);
    inner = Math.min(inner, wall.distance);
    outer = Math.max(outer, wall.distance + wall.length);
  }
  return { inner, outer };
}

function rangeOverlapsActiveWalls(range) {
  for (const obstacle of state.walls) {
    const inner = obstacle.distance;
    const outer = obstacle.distance + obstacle.length;
    if (inner < range.outer && outer > range.inner) return true;
  }
  return false;
}

function spawnWave(force = false) {
  const wave = getPendingWave();
  if (!force && (state.nextSpawnDelay > 0 || rangeOverlapsActiveWalls(waveRange(wave)))) return;
  for (let index = 0; index < wave.walls.length; index += 1) {
    const wallDef = wave.walls[index];
    const wall = wallMetrics(wallDef);
    state.walls.push({
      side: wallDef.side,
      distance: wall.distance,
      length: wall.length,
      pattern: state.waveCount,
      hue: state.waveCount % 3
    });
  }
  state.pendingWave = null;
  state.nextSpawnDelay = wave.delay * ORIGINAL_TICK_MS;
  state.waveCount += 1;
  state.rank = Math.min(12, state.rank + 0.2);
  state.currentWave = wave;
  updateHud();
}

function updateHud() {
  const level = LEVELS[state.levelIndex];
  stageName.textContent = level.name;
  rankLabel.textContent = `rank ${Math.floor(state.rank)}`;
  waveLabel.textContent = `wave ${state.waveCount}`;
  wallLabel.textContent = `${state.walls.length} walls`;
  patternName.textContent = state.currentWave ? state.currentWave.name : "ready";
  delayLabel.textContent = state.currentWave ? String(state.currentWave.delay) : "0";
  rotationLabel.textContent = level.rotation % 2 ? "clockwise" : "counter";
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function point(cx, cy, radius, angle) {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function hexPath(cx, cy, radius, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < SIDES; i += 1) {
    const [x, y] = point(cx, cy, radius, rotation - Math.PI / 2 + (i * TAU) / SIDES);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function wallPath(cx, cy, inner, outer, side, rotation) {
  const padding = 0.018;
  const a0 = rotation - Math.PI / 2 + (side * TAU) / SIDES + padding;
  const a1 = rotation - Math.PI / 2 + ((side + 1) * TAU) / SIDES - padding;
  const p0 = point(cx, cy, inner, a0);
  const p1 = point(cx, cy, outer, a0);
  const p2 = point(cx, cy, outer, a1);
  const p3 = point(cx, cy, inner, a1);
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.lineTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.closePath();
}

function draw(now) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const cx = width / 2;
  const cy = height / 2;
  const shortSide = Math.min(width, height);
  const palette = PALETTES[state.paletteIndex];
  const bg = palette[0];
  const grid = palette[4];
  const accent = palette[1];
  const accent2 = palette[2];
  const accent3 = palette[3];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const pulse = Math.sin(now * 0.002) * 0.5 + 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(state.rotation * 0.35);
  ctx.translate(-cx, -cy);

  for (let i = 0; i < 16; i += 1) {
    const radius = shortSide * 0.08 + i * shortSide * 0.055 + pulse * 5;
    ctx.strokeStyle = `rgba(246, 244, 236, ${0.18 - i * 0.006})`;
    ctx.lineWidth = i % 4 === 0 ? 2 : 1;
    hexPath(cx, cy, radius, state.rotation * 0.4);
    ctx.stroke();
  }

  for (const obstacle of state.walls) {
    const inner = obstacle.distance;
    const outer = obstacle.distance + obstacle.length;
    if (outer < shortSide * 0.07 || inner > shortSide * 0.9) continue;
    const color = obstacle.hue === 0 ? accent : obstacle.hue === 1 ? accent2 : accent3;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    wallPath(cx, cy, Math.max(0, inner), outer, obstacle.side, state.rotation);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  ctx.save();
  hexPath(cx, cy, shortSide * 0.085, state.rotation);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = grid;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.translate(cx, cy);
  ctx.rotate(state.rotation * -0.8);
  ctx.fillStyle = grid;
  ctx.beginPath();
  ctx.moveTo(0, -shortSide * 0.035);
  ctx.lineTo(shortSide * 0.027, shortSide * 0.028);
  ctx.lineTo(-shortSide * 0.027, shortSide * 0.028);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function update(now) {
  const dt = Math.min(48, now - state.lastTime);
  state.lastTime = now;

  if (!state.paused) {
    const level = LEVELS[state.levelIndex];
    const tempo = Number(tempoRange.value);
    const scroll = tempo * 0.025 * dt;
    state.rotation += (level.rotation * 0.00032 * dt) * (level.rotation % 2 ? 1 : -1);
    state.nextSpawnDelay -= dt;
    for (const obstacle of state.walls) {
      obstacle.distance -= scroll;
    }
    state.walls = state.walls.filter((obstacle) => obstacle.distance + obstacle.length > 28);
    spawnWave(false);
    updateHud();
  }

  draw(now);
  requestAnimationFrame(update);
}

levelSelect.addEventListener("change", () => {
  state.levelIndex = Number(levelSelect.value);
  resetRun();
  spawnWave(true);
});

patternSelect.addEventListener("change", () => {
  state.patternKind = Number(patternSelect.value);
  resetRun();
  spawnWave(true);
});

seedInput.addEventListener("change", () => {
  resetRun();
  spawnWave(true);
});

pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseButton.firstElementChild.textContent = state.paused ? ">" : "||";
});

rerollButton.addEventListener("click", () => {
  seedInput.value = String(1 + Math.floor(Math.random() * 999999));
  resetRun();
  spawnWave(true);
});

stepButton.addEventListener("click", () => {
  state.nextSpawnDelay = 0;
  spawnWave(false);
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
spawnWave(true);
requestAnimationFrame(update);
