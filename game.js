// CLAUDDER — Platanus Hack 26, Argentina Arcade Edition
// "Digg through context"
// 2P simultaneous co-op. Claude-branded mulita (armadillo) tunnels a tokenized
// underground, collecting insight-emeralds and shoving dulce-de-leche jars while
// rival AIs (OpenAI / Gemini / Copilot) try to overwrite the context.

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const TILE = 32;
const COLS = 20;
const ROWS = 14;
const PLAY_W = COLS * TILE;       // 640
const PLAY_H = ROWS * TILE;       // 448
const OX = (GAME_WIDTH - PLAY_W) / 2; // 80
const OY = 92;

const STORAGE_KEY = 'claudder-hs-v1';
const MAX_HIGH_SCORES = 5;
const WINNING_NAME_LENGTH = 3;

const PLAYER_MOVE_MS = 130;
const JAR_WOBBLE_MS = 560;
const JAR_FALL_MS = 170;
const JAR_PUSH_MS = 140;
const ENEMY_CHASE_MS = 250;
const ENEMY_DIG_MS = 360;
const ENEMY_BOSS_MS = 290;
const ENEMY_RESPAWN_MIN_MS = 5500;
const ENEMY_RESPAWN_MAX_MS = 8500;
const BEAM_SPEED = 540;
const BEAM_LIFE_MS = 900;
const MATE_POWER_MS = 7500;
const MATE_SPAWN_MIN_MS = 8000;
const MATE_SPAWN_MAX_MS = 15000;
const RESPAWN_MS = 1100;
const HIT_IFRAMES_MS = 1400;
const LEVEL_COUNT = 10;
const PAL = (l) => PALETTES[l % PALETTES.length];

// Claude starburst — 16×16 RGBA, pale bg stripped to true transparent (~244B base64)
const ICON_CLAUDE_SPARK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAfElEQVR42qVSyREAIQgDq9mGbMUithUbshv3xQyDkWOWl8YQOUJkYo2+M5hEQ6CXEAo872RPbI2+NdYQGLWiP2kaQAS539riau9WnCtDtJUSER2lIZJXDVdX+LsF+8a3NUVzOIyEVmjJaZdqkpy12VwRm4zE0oEsXhaIOB9vB3Nbu0KyTgAAAABJRU5ErkJggg==';

// OpenAI/ChatGPT knot icon — 20×20 RGBA PNG, white-pixels-replaced-with-black (~247B raw / 332B base64)
const ICON_OPENAI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAvklEQVR42qVUQQ7AIAhjhid69ikefIpn/7hdtoUhBbeRmBiVtiBARLR7K/e6R2/k2s7NZLnX6WyURpGZgBeYBLAILJK0AuaZJuI3DhZJ7pVyr/dd0hcRmH5nhuyFOUp7gEU5ZS+cUdrkiJTeChFT9NtSuTxP3odIB+2M0rSd3QBrTjt4KZh+GamRex0q7JQVQEsVVGgVKyofz9jLh87tSiexvkRKouL/3cuIgHVXrI6pT/MwakWLBE7siAQpPgDbtanLjKnvQQAAAABJRU5ErkJggg==';

// xAI/Grok lettermark — 16×16 palette PNG composited onto dark bg (~130B raw / 176B base64)
const ICON_GROK = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEXR0dEaGhoKhttXAAAAN0lEQVR42mP4/4Hh/0eG/48Y/h9g+H+E4XgHw2MOhscSDB8tGD78YPhTAUKfLBgeSjAc5gDKAgBcjxauy4g0vQAAAABJRU5ErkJggg==';

// Cursor polyhedron icon — 20×20 RGBA 3c (~256B raw / 344B base64)
const ICON_CURSOR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAx0lEQVR42q2UQQrDIBBFR8kZ4i0juCmULkuhm0J7y/QAs00XZUL8TMaJ5K+M4vNrZn5g5oUUfeeZxpTWMRFV3zJGBQQi6PN+VRumXExw0BxqINQeODDzsp24XS90RPfHs4KuDj2uPG6HLWzKpQsoe8eU/kBtwSupANGgnYbXsED4TNG6Bp4uIG1+16HlFkHaT4zeR/fA3MAjir1lcirwVIetbooSS71dgjWrxpfmYsrFjDIzvjypIynTDNiW21ZLmkDsW09o/ADHx5n+F8Q93gAAAABJRU5ErkJggg==';

// Per-level palettes (sandy pampas / patagonian shale / volcanic basalt)
const PALETTES = [
  { bg: 0x180f06, dirt: 0x7a5432, dirtSpeck: 0x9a6f44, tunnel: 0x0d0704, wall: 0x2a1a0c, accent: 0xffc766, name: 'PAMPA SHALLOWS' },
  { bg: 0x0a1424, dirt: 0x2c4368, dirtSpeck: 0x3d5b8a, tunnel: 0x03070f, wall: 0x1b2c48, accent: 0x6ea8ff, name: 'PATAGONIAN SHALE' },
  { bg: 0x1a0606, dirt: 0x4a1a10, dirtSpeck: 0x6d271b, tunnel: 0x080202, wall: 0x2a0d06, accent: 0xff7a5a, name: 'VOLCANIC BASALT' },
];

const COLORS = {
  p1: 0xffb347, p1Band: 0xff8c1a,
  p2: 0x5ab8ff, p2Band: 0x1a7cd4,
  emerald: 0x4ade80, emeraldRim: 0x166534,
  jar: 0xdcaa4d, jarCap: 0x6b4423, jarLabel: 0xfbe7a3,
  mate: 0x8a5a2e, mateStraw: 0xd0b890, mateLogo: 0xff9a4d,
  beam: 0xff924d, beamInner: 0xfff0c0,
  enemyOpen: 0x10a37f,
  enemyGem1: 0x4285f4, enemyGem2: 0xea4335, enemyGem3: 0xfbbc04, enemyGem4: 0x34a853,
  enemyCop: 0x9f85ff,
  life: 0xffd84d,
  hudBg: 0x0b0f18, frame: 0x39405a,
  white: 0xf7ffd8, overlay: 0x050810, backdrop: 0x020406,
  cell: 0x111622, accent: 0xffd84d, accentSoft: 0xa8c0ff,
  red: 0xff7a7a, slate: 0xb8c48d, text: 0xf7ffd8, textDim: 0x8a91a8,
  fieldBg: 0x060a12,
};

const LETTER_GRID = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z', '.', '-'],
  ['DEL', 'END'],
];

// DO NOT replace existing keys — they match the physical arcade cabinet wiring.
// To add local testing shortcuts, append extra keys to any array.
const CABINET_KEYS = {
  P1_U: ['w'],
  P1_D: ['s'],
  P1_L: ['a'],
  P1_R: ['d'],
  P1_1: ['u'],
  P1_2: ['i'],
  P1_3: ['o'],
  P1_4: ['j'],
  P1_5: ['k'],
  P1_6: ['l'],
  P2_U: ['ArrowUp'],
  P2_D: ['ArrowDown'],
  P2_L: ['ArrowLeft'],
  P2_R: ['ArrowRight'],
  P2_1: ['r'],
  P2_2: ['t'],
  P2_3: ['y'],
  P2_4: ['f'],
  P2_5: ['g'],
  P2_6: ['h'],
  START1: ['Enter'],
  START2: ['2'],
};

const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keys] of Object.entries(CABINET_KEYS)) {
  for (const key of keys) {
    KEYBOARD_TO_ARCADE[normalizeIncomingKey(key)] = arcadeCode;
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#060a12',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: {
    preload,
    create,
    update,
  },
};

new Phaser.Game(config);

function preload() {
  this.load.image('claude_spark', ICON_CLAUDE_SPARK);
  this.load.image('openai', ICON_OPENAI);
  this.load.image('grok', ICON_GROK);
  this.load.image('cursor', ICON_CURSOR);
}

function create() {
  const scene = this;

  scene.state = {
    phase: 'loading',
    layer: 0,
    grid: [],
    emeralds: [],
    jars: [],
    mates: [],
    enemies: [],
    beams: [],
    players: null,
    emeraldsTotal: 0,
    mateSpawnAt: 0,
    highScores: [],
    saveStatus: 'Loading scores...',
    winner: null,
    winnerLabel: '',
    musicStarted: false,
    menu: { cursor: 0, cooldown: 0, lastAxis: 0 },
    nameEntry: {
      letters: [],
      row: 0,
      col: 0,
      moveCooldownUntil: 0,
      confirmCooldownUntil: 0,
      lastMoveVector: { x: 0, y: 0 },
    },
  };

  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.fieldBg);

  createBackground(scene);
  createHud(scene);
  createPlayfield(scene);
  createEndGameUi(scene);
  createStartScreen(scene);
  createControlsScreen(scene);
  createPauseScreen(scene);
  createControls(scene);
  showStartScreen(scene);

  loadHighScores()
    .then((highScores) => {
      scene.state.highScores = highScores;
      scene.state.saveStatus = 'Clear a layer to save a score.';
      refreshLeaderboard(scene);
      refreshStartScreenLeaderboard(scene);
    })
    .catch(() => {
      scene.state.highScores = [];
      scene.state.saveStatus = 'Storage unavailable. Run without saves.';
      refreshLeaderboard(scene);
      refreshStartScreenLeaderboard(scene);
    });
}

function update(time, delta) {
  const scene = this;
  if (!scene.state) return;
  const phase = scene.state.phase;

  if (phase === 'start') {
    handleStartMenu(scene, time);
    return;
  }

  if (phase === 'controls') {
    if (consumeAnyPressedControl(scene, ['START1', 'START2', 'P1_1', 'P2_1', 'P1_2', 'P2_2'])) {
      scene.controlsScreen.container.setVisible(false);
      showStartScreen(scene);
    }
    return;
  }

  if (phase === 'playing') {
    handlePlayerInput(scene, scene.state.players.p1, 'P1', time, delta);
    handlePlayerInput(scene, scene.state.players.p2, 'P2', time, delta);
    updateJars(scene, time, delta);
    updateEnemies(scene, time, delta);
    updateBeams(scene, time, delta);
    updateMate(scene, time);
    updatePowerModes(scene, time);
    updateRespawns(scene, time);
    if (consumeAnyPressedControl(scene, ['START1', 'START2'])) {
      pauseMatch(scene);
    }
    checkLevelComplete(scene);
    return;
  }

  if (phase === 'paused') {
    if (consumeAnyPressedControl(scene, ['START1', 'START2'])) {
      resumeMatch(scene);
    }
    return;
  }

  if (phase === 'gameover') {
    handleNameEntry(scene, time);
    return;
  }

  if (phase === 'saved') {
    if (consumeAnyPressedControl(scene, ['START1', 'START2', 'P1_1', 'P2_1', 'P1_2', 'P2_2'])) {
      returnToStart(scene);
    }
  }
}

// ---------- helpers: tile <-> pixel ----------

function tx(c) { return OX + c * TILE + TILE / 2; }
function ty(r) { return OY + r * TILE + TILE / 2; }
function inB(c, r) { return c >= 0 && c < COLS && r >= 0 && r < ROWS; }

// ---------- background + playfield ----------

function createBackground(scene) {
  scene.playBg = scene.add.rectangle(GAME_WIDTH / 2, OY + PLAY_H / 2, PLAY_W + 16, PLAY_H + 16, COLORS.fieldBg, 1);
  scene.playBg.setStrokeStyle(2, COLORS.frame, 0.9);
}


function createPlayfield(scene) {
  scene.playfield = {};
  scene.playfield.gridGfx = scene.add.graphics();
  scene.playfield.gridGfx.setDepth(2);
  scene.playfield.entityLayer = scene.add.container(0, 0);
  scene.playfield.entityLayer.setDepth(6);
  scene.playfield.fxLayer = scene.add.container(0, 0);
  scene.playfield.fxLayer.setDepth(8);
  scene.playfield.playerLayer = scene.add.container(0, 0);
  scene.playfield.playerLayer.setDepth(9);
}

function redrawGrid(scene) {
  const gfx = scene.playfield.gridGfx;
  const pal = PAL(scene.state.layer);
  gfx.clear();
  // Tunnel base (dark, feels like cleared context)
  gfx.fillStyle(pal.tunnel, 1);
  gfx.fillRect(OX, OY, PLAY_W, PLAY_H);
  // Faint dot-grid on tunnels (context-grid look)
  gfx.fillStyle(0x2a2e40, 0.25);
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (scene.state.grid[r][c] === 'T') {
        const cx = OX + c * TILE + TILE / 2;
        const cy = OY + r * TILE + TILE / 2;
        gfx.fillRect(cx - 1, cy - 1, 2, 2);
      }
    }
  }
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (scene.state.grid[r][c] === 'D') {
        const x = OX + c * TILE;
        const y = OY + r * TILE;
        gfx.fillStyle(pal.dirt, 1);
        gfx.fillRect(x, y, TILE, TILE);
        // Glyph / text-line pattern — "tokens" embedded in the dirt
        const seed = ((c * 73856093) ^ (r * 19349663)) >>> 0;
        gfx.fillStyle(pal.dirtSpeck, 0.65);
        for (let ln = 0; ln < 4; ln += 1) {
          const ly = y + 5 + ln * 6;
          let lx = x + 3;
          const s = (seed ^ (ln * 0x9e3779b1)) >>> 0;
          let word = 0;
          while (lx < x + TILE - 4 && word < 5) {
            const ww = 1 + ((s >> (word * 3)) & 0x3); // 1..4 px
            const gap = 1 + ((s >> (word * 3 + 9)) & 0x1);
            gfx.fillRect(lx, ly, ww, 1);
            lx += ww + gap;
            word += 1;
          }
        }
        // A single small accent "bullet" per tile for variety
        gfx.fillStyle(pal.accent, 0.35);
        const bx = x + 4 + (seed & 0x7);
        const by = y + 2 + ((seed >> 4) & 0x3);
        gfx.fillRect(bx, by, 2, 2);
        // Subtle cell border
        gfx.lineStyle(1, pal.tunnel, 0.25);
        gfx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      }
    }
  }
}

// ---------- HUD ----------

function createHud(scene) {
  scene.hud = {};

  // Small Claude spark beside the title
  scene.hud.starGfx = scene.add.image(GAME_WIDTH / 2 - 78, 19, 'claude_spark');
  scene.hud.starGfx.setDepth(2);
  scene.hud.starGfx.setScale(18 / 16);
  scene.tweens.add({
    targets: scene.hud.starGfx, angle: 360, duration: 5200, repeat: -1, ease: 'Linear',
  });

  scene.hud.title = scene.add
    .text(GAME_WIDTH / 2, 8, 'CLAUDDER', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffd84d', fontStyle: 'bold', align: 'center',
    })
    .setOrigin(0.5, 0);
  scene.hud.title.setDepth(2);

  // P1 cluster, left
  scene.hud.p1Label = scene.add
    .text(20, 44, 'P1', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ff8c1a', fontStyle: 'bold',
    })
    .setOrigin(0, 0);
  scene.hud.p1Score = scene.add
    .text(48, 42, '0', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffb347', fontStyle: 'bold',
    })
    .setOrigin(0, 0);
  scene.hud.p1Lives = scene.add
    .text(20, 68, '♥ ♥ ♥', {
      fontFamily: 'monospace', fontSize: '14px', color: '#ff8c1a',
    })
    .setOrigin(0, 0);

  // P2 cluster, right
  scene.hud.p2Label = scene.add
    .text(GAME_WIDTH - 20, 44, 'P2', {
      fontFamily: 'monospace', fontSize: '13px', color: '#1a7cd4', fontStyle: 'bold',
    })
    .setOrigin(1, 0);
  scene.hud.p2Score = scene.add
    .text(GAME_WIDTH - 48, 42, '0', {
      fontFamily: 'monospace', fontSize: '20px', color: '#5ab8ff', fontStyle: 'bold',
    })
    .setOrigin(1, 0);
  scene.hud.p2Lives = scene.add
    .text(GAME_WIDTH - 20, 68, '♥ ♥ ♥', {
      fontFamily: 'monospace', fontSize: '14px', color: '#1a7cd4',
    })
    .setOrigin(1, 0);

  // Center: objective pill with layer name + progress
  scene.hud.objectiveBg = scene.add.rectangle(GAME_WIDTH / 2, 50, 280, 26, 0x0b1a2a, 0.9);
  scene.hud.objectiveBg.setStrokeStyle(2, COLORS.frame, 0.9);
  scene.hud.layer = scene.add
    .text(GAME_WIDTH / 2, 40, `LAYER 1/${LEVEL_COUNT} · PAMPA SHALLOWS`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#a8c0ff', fontStyle: 'bold',
    })
    .setOrigin(0.5, 0);
  scene.hud.progress = scene.add
    .text(GAME_WIDTH / 2, 56, 'INSIGHTS  0 / 6', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffd84d', fontStyle: 'bold',
    })
    .setOrigin(0.5, 0);

  // Bottom status bar
  scene.hud.status = scene.add
    .text(GAME_WIDTH / 2, GAME_HEIGHT - 20, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#f7ffd8', align: 'center',
    })
    .setOrigin(0.5);

  // Level banner (hidden by default, shown at level start/clear)
  scene.hud.bannerContainer = scene.add.container(GAME_WIDTH / 2, OY + PLAY_H / 2);
  scene.hud.bannerContainer.setDepth(30);
  scene.hud.bannerBg = scene.add.rectangle(0, 0, 520, 100, 0x0b1a2a, 0.94);
  scene.hud.bannerBg.setStrokeStyle(3, COLORS.accent, 1);
  scene.hud.bannerTitle = scene.add
    .text(0, -18, '', {
      fontFamily: 'monospace', fontSize: '22px', color: '#ffd84d', fontStyle: 'bold', align: 'center',
    })
    .setOrigin(0.5);
  scene.hud.bannerSub = scene.add
    .text(0, 16, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#a8c0ff', align: 'center',
    })
    .setOrigin(0.5);
  scene.hud.bannerContainer.add([scene.hud.bannerBg, scene.hud.bannerTitle, scene.hud.bannerSub]);
  scene.hud.bannerContainer.setVisible(false);
}

function showLevelBanner(scene, title, subtitle) {
  if (!scene.hud.bannerContainer) return;
  scene.hud.bannerTitle.setText(title);
  scene.hud.bannerSub.setText(subtitle);
  scene.hud.bannerContainer.setAlpha(0);
  scene.hud.bannerContainer.setScale(0.8);
  scene.hud.bannerContainer.setVisible(true);
  scene.tweens.add({
    targets: scene.hud.bannerContainer,
    alpha: 1,
    scale: 1,
    duration: 250,
    ease: 'Back.easeOut',
  });
  scene.time.delayedCall(1900, () => {
    if (!scene.hud.bannerContainer) return;
    scene.tweens.add({
      targets: scene.hud.bannerContainer,
      alpha: 0,
      scale: 0.9,
      duration: 260,
      onComplete: () => scene.hud.bannerContainer.setVisible(false),
    });
  });
}

function showFloatingScore(scene, x, y, text, colorHex) {
  const t = scene.add.text(x, y - 4, text, {
    fontFamily: 'monospace', fontSize: '14px', color: colorHex, fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
  }).setOrigin(0.5);
  t.setDepth(16);
  scene.tweens.add({
    targets: t,
    y: y - 30,
    alpha: 0,
    duration: 780,
    ease: 'Sine.easeOut',
    onComplete: () => t.destroy(),
  });
}

// ---------- start screen ----------

function createStartScreen(scene) {
  scene.startScreen = {};
  const c = scene.add.container(0, 0);
  c.setDepth(15);
  scene.startScreen.container = c;

  c.add(scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.overlay, 1));

  // Scan-line grid overlay (AI aesthetic)
  const scan = scene.add.graphics();
  scan.fillStyle(0x1a2540, 0.18);
  for (let y = 0; y < GAME_HEIGHT; y += 3) scan.fillRect(0, y, GAME_WIDTH, 1);
  c.add(scan);

  // Ambient dust motes drifting up in the side margins
  for (let i = 0; i < 10; i += 1) {
    const side = i < 5 ? -1 : 1;
    const x = GAME_WIDTH / 2 + side * (260 + Math.random() * 130);
    const y = Math.random() * GAME_HEIGHT;
    const mote = scene.add.rectangle(x, y, 2, 2, 0xffd84d, 0.22);
    c.add(mote);
    scene.tweens.add({
      targets: mote, y: y - 70, alpha: 0,
      duration: 4000 + Math.random() * 2500, repeat: -1, ease: 'Linear',
    });
  }

  c.add(
    scene.add
      .text(GAME_WIDTH / 2, 56, 'PLATANUS HACK 26 · BUENOS AIRES', {
        fontFamily: 'monospace', fontSize: '14px', color: '#a8c0ff', fontStyle: 'bold',
      })
      .setOrigin(0.5),
  );

  // === Pixel-art bitmap CLAUDDER (DIGGER-style) ===
  // 5×7 glyphs, one 5-bit number per row (MSB = leftmost pixel)
  const FONT = {
    C:[15,16,16,16,16,16,15],
    L:[16,16,16,16,16,16,31],
    A:[14,17,17,31,17,17,17],
    U:[17,17,17,17,17,17,14],
    D:[30,17,17,17,17,17,30],
    E:[31,16,16,30,16,16,31],
    R:[30,17,17,30,20,18,17],
  };
  const drawPixelTitle = (x0, y0, px, col) => {
    const g = scene.add.graphics();
    g.fillStyle(col, 1);
    const txt = 'CLAUDDER';
    const adv = 6 * px;
    const w = txt.length * adv - px;
    let xo = -w / 2;
    for (const ch of txt) {
      const rows = FONT[ch];
      for (let r = 0; r < 7; r += 1) {
        const row = rows[r];
        for (let cc = 0; cc < 5; cc += 1) {
          if (row & (1 << (4 - cc))) g.fillRect(xo + cc * px, -3.5 * px + r * px, px, px);
        }
      }
      xo += adv;
    }
    g.setPosition(x0, y0);
    c.add(g);
    return g;
  };

  // Avatar helper (used for the centered prompt pair below the title)
  const makeAvatar = (x0, y0, face) => {
    const g = drawPromptBubble(scene, face);
    g.setPosition(x0, y0).setScale(0.72);
    c.add(g);
    const cur = scene.add.rectangle(x0 - 9, y0 + 9, 15, 5, 0x0b0f18);
    c.add(cur);
    scene.tweens.add({ targets: cur, alpha: 0.1, duration: 460, yoyo: true, repeat: -1 });
    return [g, cur];
  };

  // 3D drop-shadow + main title (bitmap pixels)
  const titleShadow = drawPixelTitle(GAME_WIDTH / 2 + 5, 128, 10, 0x8a2a00);
  const titleMain = drawPixelTitle(GAME_WIDTH / 2, 124, 10, 0xffd84d);

  const titleGroup = [titleMain, titleShadow];
  scene.tweens.add({ targets: titleGroup, scale: 1.05, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: titleGroup, angle: 1.8, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  // Sparkle bursts popping around the title
  const spawnSparkle = () => {
    const sp = scene.add.rectangle(
      GAME_WIDTH / 2 + (Math.random() - 0.5) * 540,
      90 + Math.random() * 90,
      3, 3, 0xfff0c0, 1,
    );
    c.add(sp);
    scene.tweens.add({
      targets: sp, scale: 4, alpha: 0, angle: 60,
      duration: 520, ease: 'Quad.easeOut',
      onComplete: () => sp.destroy(),
    });
    scene.time.delayedCall(160 + Math.random() * 180, spawnSparkle);
  };
  spawnSparkle();

  c.add(
    scene.add
      .text(GAME_WIDTH / 2, 184, 'DIGG THROUGH CONTEXT', {
        fontFamily: 'monospace', fontSize: '16px', color: '#ffb347', fontStyle: 'bold',
      })
      .setOrigin(0.5),
  );

  c.add(
    scene.add
      .text(GAME_WIDTH / 2, 204, '2-player co-op  ·  Claude vs the rival AIs underground', {
        fontFamily: 'monospace', fontSize: '11px', color: '#a8c0ff',
      })
      .setOrigin(0.5),
  );

  // Enemy roster strip (shows what they'll face)
  const rosterLabel = scene.add
    .text(GAME_WIDTH / 2, 226, 'RIVAL AIs', {
      fontFamily: 'monospace', fontSize: '11px', color: '#a8c0ff', fontStyle: 'bold',
    })
    .setOrigin(0.5);
  c.add(rosterLabel);
  const rosterTypes = ['openai', 'gemini', 'grok'];
  const rosterSpacing = 56;
  const rosterStartX = GAME_WIDTH / 2 - ((rosterTypes.length - 1) * rosterSpacing) / 2;
  rosterTypes.forEach((t, i) => {
    let g;
    if (t === 'openai' || t === 'grok') {
      g = scene.add.image(0, 0, t);
      g.setScale(t === 'openai' ? 1.0 : 22 / 16);
    } else {
      g = scene.add.graphics();
      drawEnemyGraphic({ type: t, gfx: g });
      g.setScale(1.05);
    }
    g.x = rosterStartX + i * rosterSpacing;
    g.y = 254;
    c.add(g);
    scene.tweens.add({ targets: g, y: g.y - 2, duration: 800 + i * 100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  });

  scene.startScreen.buttons = [];
  const buttonLabels = ['PLAY', 'CONTROLS'];
  for (let i = 0; i < buttonLabels.length; i += 1) {
    const y = 288 + i * 44;
    const bg = scene.add.rectangle(GAME_WIDTH / 2, y, 280, 38, COLORS.cell, 0.95);
    bg.setStrokeStyle(2, COLORS.frame, 0.8);
    const label = scene.add
      .text(GAME_WIDTH / 2, y, buttonLabels[i], {
        fontFamily: 'monospace', fontSize: '20px', color: '#f7ffd8', fontStyle: 'bold',
      })
      .setOrigin(0.5);
    c.add(bg);
    c.add(label);
    scene.startScreen.buttons.push({ bg, label });
  }

  // Two Claude prompt avatars flanking the PLAY/CONTROLS box (bobbing, blinking cursor)
  const av1 = makeAvatar(130, 310, 1);
  const av2 = makeAvatar(GAME_WIDTH - 130, 310, -1);
  scene.tweens.add({ targets: av1, y: '-=10', duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: av2, y: '-=10', duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 450 });

  c.add(
    scene.add
      .text(GAME_WIDTH / 2, 390, 'TOP SCORES', {
        fontFamily: 'monospace', fontSize: '12px', color: '#a8c0ff', fontStyle: 'bold',
      })
      .setOrigin(0.5),
  );

  scene.startScreen.leaderboard = scene.add
    .text(GAME_WIDTH / 2, 410, 'NO SAVED SCORES YET', {
      fontFamily: 'monospace', fontSize: '13px', color: '#f7ffd8', align: 'center', lineSpacing: 4,
    })
    .setOrigin(0.5, 0);
  c.add(scene.startScreen.leaderboard);

  const pressStart = scene.add
    .text(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'JOYSTICK TO MOVE  ·  PRESS BUTTON 1 OR START', {
      fontFamily: 'monospace', fontSize: '11px', color: '#6f7a8a',
    })
    .setOrigin(0.5);
  c.add(pressStart);
  scene.tweens.add({ targets: pressStart, alpha: 0.3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  c.setVisible(false);
}

function showStartScreen(scene) {
  scene.state.phase = 'start';
  scene.startScreen.container.setVisible(true);
  scene.state.menu.cursor = 0;
  updateStartMenuHighlight(scene);
}

function createControlsScreen(scene) {
  scene.controlsScreen = {};
  const c = scene.add.container(0, 0);
  c.setDepth(16);
  scene.controlsScreen.container = c;

  c.add(scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.overlay, 0.98));
  c.add(
    scene.add
      .text(GAME_WIDTH / 2, 80, 'CONTROLS', {
        fontFamily: 'monospace', fontSize: '30px', color: '#ffd84d', fontStyle: 'bold',
      })
      .setOrigin(0.5),
  );

  const lines = [
    'P1   MOVE/DIG  W A S D     P2   MOVE/DIG  ARROWS',
    'P1   BEAM      U           P2   BEAM      R',
    'P1   CEBAR     I           P2   CEBAR     T',
    'PAUSE          ENTER / 2',
    '',
    'GOAL  Collect every insight-emerald to dig the next layer.',
    '',
    'SCORE  dig +5 · push +15 · emerald +100 · 8-chain +2000',
    '       mate +150 · cebar +100 · layer +1000/layer',
    '       jar shatter +500/tile fallen · kills 250–1000',
    '',
    'CEBAR = Argentine mate ritual. Pass your power-mode',
    'to the adjacent partner so both players ram rivals.',
  ];
  c.add(
    scene.add
      .text(GAME_WIDTH / 2, 130, lines.join('\n'), {
        fontFamily: 'monospace', fontSize: '14px', color: '#f7ffd8', align: 'center', lineSpacing: 6,
      })
      .setOrigin(0.5, 0),
  );

  c.add(
    scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, 'PRESS START TO GO BACK', {
        fontFamily: 'monospace', fontSize: '12px', color: '#6f7a8a',
      })
      .setOrigin(0.5),
  );

  c.setVisible(false);
}

function showControlsScreen(scene) {
  scene.startScreen.container.setVisible(false);
  scene.controlsScreen.container.setVisible(true);
  scene.state.phase = 'controls';
}

function refreshStartScreenLeaderboard(scene) {
  const lines = scene.state.highScores.length
    ? scene.state.highScores.map((e, i) =>
        `${String(i + 1).padStart(2, '0')} ${e.name.padEnd(3, ' ')} ${String(e.score).padStart(6, ' ')} L${e.detail}`,
      )
    : ['NO SAVED SCORES YET'];
  scene.startScreen.leaderboard.setText(lines.join('\n'));
}

function updateStartMenuHighlight(scene) {
  const cursor = scene.state.menu.cursor;
  scene.startScreen.buttons.forEach(({ bg, label }, i) => {
    const active = i === cursor;
    bg.setFillStyle(active ? COLORS.accent : COLORS.cell, active ? 1 : 0.95);
    bg.setStrokeStyle(2, active ? COLORS.white : COLORS.frame, active ? 1 : 0.8);
    label.setColor(active ? '#0b0f18' : '#f7ffd8');
  });
}

function handleStartMenu(scene, time) {
  const menu = scene.state.menu;
  const axisY = getVerticalMenuAxis(scene.controls);

  if (time >= menu.cooldown && axisY !== 0 && menu.lastAxis !== axisY) {
    menu.cursor = Phaser.Math.Wrap(menu.cursor + axisY, 0, scene.startScreen.buttons.length);
    menu.cooldown = time + 160;
    updateStartMenuHighlight(scene);
    playSound(scene, 'click');
    startAmbientMusic(scene);
  }
  menu.lastAxis = axisY;

  if (consumeAnyPressedControl(scene, ['P1_1', 'P2_1', 'P1_2', 'P2_2', 'START1', 'START2'])) {
    playSound(scene, 'select');
    startAmbientMusic(scene);
    if (menu.cursor === 0) {
      startMatch(scene);
    } else {
      showControlsScreen(scene);
    }
  }
}

function createPauseScreen(scene) {
  scene.pauseScreen = {};
  const c = scene.add.container(0, 0);
  c.setDepth(25);
  scene.pauseScreen.container = c;

  c.add(scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.overlay, 0.82));
  c.add(
    scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 28, 'PAUSED', {
        fontFamily: 'monospace', fontSize: '52px', color: '#ffd84d', fontStyle: 'bold',
      })
      .setOrigin(0.5),
  );
  c.add(
    scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 34, 'PRESS START TO RESUME', {
        fontFamily: 'monospace', fontSize: '16px', color: '#a8c0ff',
      })
      .setOrigin(0.5),
  );
  c.setVisible(false);
}

function pauseMatch(scene) {
  scene.state.phase = 'paused';
  scene.pauseScreen.container.setVisible(true);
}

function resumeMatch(scene) {
  scene.pauseScreen.container.setVisible(false);
  scene.state.phase = 'playing';
}

function returnToStart(scene) {
  scene.state.winner = null;
  scene.state.nameEntry.letters = [];
  scene.endGame.container.setVisible(false);
  clearPlayfield(scene);
  refreshLeaderboard(scene);
  refreshStartScreenLeaderboard(scene);
  showStartScreen(scene);
}

// ---------- end game UI (name entry) ----------

function createEndGameUi(scene) {
  scene.endGame = {};
  scene.endGame.container = scene.add.container(0, 0);
  scene.endGame.container.setDepth(20);
  scene.endGame.container.setVisible(false);

  const backdrop = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.backdrop, 0.98);
  scene.endGame.container.add(backdrop);

  scene.endGame.title = scene.add
    .text(GAME_WIDTH / 2, 70, 'CONTEXT LOST', {
      fontFamily: 'monospace', fontSize: '30px', color: '#f7ffd8', fontStyle: 'bold',
    })
    .setOrigin(0.5);

  scene.endGame.summary = scene.add
    .text(GAME_WIDTH / 2, 108, '', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffd84d', align: 'center',
    })
    .setOrigin(0.5);

  scene.endGame.nameLabel = scene.add
    .text(GAME_WIDTH / 2, 148, 'ENTER YOUR NAME', {
      fontFamily: 'monospace', fontSize: '12px', color: '#a8c0ff', align: 'center',
    })
    .setOrigin(0.5);

  scene.endGame.nameValue = scene.add
    .text(GAME_WIDTH / 2, 178, '_ _ _', {
      fontFamily: 'monospace', fontSize: '32px', color: '#5ab8ff', fontStyle: 'bold', align: 'center',
    })
    .setOrigin(0.5);

  scene.endGame.instructions = scene.add
    .text(GAME_WIDTH / 2, 210, 'JOYSTICK TO MOVE · BUTTON 1 TO PICK', {
      fontFamily: 'monospace', fontSize: '10px', color: '#8a91a8', align: 'center',
    })
    .setOrigin(0.5);

  scene.endGame.leaderboardTitle = scene.add
    .text(GAME_WIDTH / 2, 244, 'SCOREBOARD', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffd84d', fontStyle: 'bold', align: 'center',
    })
    .setOrigin(0.5);

  scene.endGame.gridLabels = [];

  for (let row = 0; row < LETTER_GRID.length; row += 1) {
    const rowValues = LETTER_GRID[row];
    const rowWidth = rowValues.length * 54;
    for (let col = 0; col < rowValues.length; col += 1) {
      const value = rowValues[col];
      const cellX = GAME_WIDTH / 2 - rowWidth / 2 + 27 + col * 54;
      const cellY = 418 + row * 28;

      const cell = scene.add.rectangle(cellX, cellY, value.length > 1 ? 64 : 42, 24, COLORS.cell, 0.95);
      cell.setStrokeStyle(2, COLORS.frame, 0.8);

      const label = scene.add
        .text(cellX, cellY, value, {
          fontFamily: 'monospace', fontSize: value.length > 1 ? '14px' : '18px', color: '#f7ffd8', fontStyle: 'bold', align: 'center',
        })
        .setOrigin(0.5);

      scene.endGame.gridLabels.push({ cell, label, row, col, value });
      scene.endGame.container.add(cell);
      scene.endGame.container.add(label);
    }
  }

  scene.endGame.saveStatus = scene.add
    .text(GAME_WIDTH / 2, 584, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffd84d', align: 'center',
    })
    .setOrigin(0.5);

  scene.endGame.leaderboard = scene.add
    .text(GAME_WIDTH / 2, 266, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#f7ffd8', align: 'center', lineSpacing: 4,
    })
    .setOrigin(0.5, 0);

  scene.endGame.container.add(scene.endGame.title);
  scene.endGame.container.add(scene.endGame.summary);
  scene.endGame.container.add(scene.endGame.nameLabel);
  scene.endGame.container.add(scene.endGame.nameValue);
  scene.endGame.container.add(scene.endGame.instructions);
  scene.endGame.container.add(scene.endGame.leaderboardTitle);
  scene.endGame.container.add(scene.endGame.leaderboard);
  scene.endGame.container.add(scene.endGame.saveStatus);
}

// ---------- controls / input ----------

function createControls(scene) {
  scene.controls = {
    held: Object.create(null),
    pressed: Object.create(null),
  };

  const onKeyDown = (event) => {
    const key = normalizeIncomingKey(event.key);
    if (!key) return;
    const arcadeCode = KEYBOARD_TO_ARCADE[key];
    if (!arcadeCode) return;
    if (!scene.controls.held[arcadeCode]) {
      scene.controls.pressed[arcadeCode] = true;
    }
    scene.controls.held[arcadeCode] = true;
  };
  const onKeyUp = (event) => {
    const key = normalizeIncomingKey(event.key);
    if (!key) return;
    const arcadeCode = KEYBOARD_TO_ARCADE[key];
    if (!arcadeCode) return;
    scene.controls.held[arcadeCode] = false;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  scene.events.once('shutdown', () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });
}

function normalizeIncomingKey(key) {
  if (typeof key !== 'string' || key.length === 0) return '';
  if (key === ' ') return 'space';
  return key.toLowerCase();
}

function isControlHeld(scene, controlCode) {
  return scene.controls.held[controlCode] === true;
}

function consumeAnyPressedControl(scene, controlCodes) {
  for (const controlCode of controlCodes) {
    if (scene.controls.pressed[controlCode]) {
      scene.controls.pressed[controlCode] = false;
      return true;
    }
  }
  return false;
}

function getVerticalMenuAxis(controls) {
  if (controls.held.P1_U || controls.held.P2_U) return -1;
  if (controls.held.P1_D || controls.held.P2_D) return 1;
  return 0;
}

function getHorizontalMenuAxis(controls) {
  if (controls.held.P1_L || controls.held.P2_L) return -1;
  if (controls.held.P1_R || controls.held.P2_R) return 1;
  return 0;
}

// ---------- start match / level build ----------

function startMatch(scene) {
  scene.startScreen.container.setVisible(false);
  scene.state.layer = 0;
  const initialPlayers = {
    p1: makePlayer(scene, 'p1'),
    p2: makePlayer(scene, 'p2'),
  };
  scene.state.players = initialPlayers;
  buildLevel(scene, 0);
  scene.state.phase = 'playing';
  refreshHud(scene);
  scene.hud.status.setText('Dig. Collect. Survive. Press START to pause.');
}

function makePlayer(scene, key) {
  return {
    key,
    col: 0,
    row: 0,
    px: 0,
    py: 0,
    targetPx: 0,
    targetPy: 0,
    dir: { dc: 0, dr: 0 }, // facing
    lastDir: { dc: 1, dr: 0 },
    moveReadyAt: 0,
    alive: true,
    lives: 3,
    score: 0,
    powerUntil: 0,
    iframesUntil: 0,
    respawnAt: 0,
    gfx: null,
    emeraldChain: 0,
  };
}

function clearPlayfield(scene) {
  if (scene.playfield.entityLayer) scene.playfield.entityLayer.removeAll(true);
  if (scene.playfield.fxLayer) scene.playfield.fxLayer.removeAll(true);
  if (scene.playfield.playerLayer) scene.playfield.playerLayer.removeAll(true);
  scene.state.emeralds = [];
  scene.state.jars = [];
  scene.state.mates = [];
  scene.state.enemies = [];
  scene.state.beams = [];
  if (scene.state.players) {
    scene.state.players.p1.gfx = null;
    scene.state.players.p2.gfx = null;
  }
}

function buildLevel(scene, layer) {
  clearPlayfield(scene);
  scene.state.layer = layer;

  // Start with full dirt
  const g = [];
  for (let r = 0; r < ROWS; r += 1) {
    const row = [];
    for (let c = 0; c < COLS; c += 1) row.push('D');
    g.push(row);
  }
  scene.state.grid = g;

  // Carve two small starting clearings at opposite corners
  const p1 = scene.state.players.p1;
  const p2 = scene.state.players.p2;
  p1.col = 1; p1.row = 1;
  p2.col = COLS - 2; p2.row = 1;
  // Only resurrect players who still have lives
  p1.alive = p1.lives > 0;
  p2.alive = p2.lives > 0;
  p1.px = tx(p1.col); p1.py = ty(p1.row); p1.targetPx = p1.px; p1.targetPy = p1.py;
  p2.px = tx(p2.col); p2.py = ty(p2.row); p2.targetPx = p2.px; p2.targetPy = p2.py;
  p1.dir = { dc: 1, dr: 0 }; p1.lastDir = { dc: 1, dr: 0 };
  p2.dir = { dc: -1, dr: 0 }; p2.lastDir = { dc: -1, dr: 0 };
  p1.powerUntil = 0; p2.powerUntil = 0;
  p1.iframesUntil = scene.time.now + HIT_IFRAMES_MS;
  p2.iframesUntil = scene.time.now + HIT_IFRAMES_MS;
  p1.emeraldChain = 0; p2.emeraldChain = 0;

  // Starter tunnels
  g[1][1] = 'T'; g[1][2] = 'T'; g[2][1] = 'T';
  g[1][COLS - 2] = 'T'; g[1][COLS - 3] = 'T'; g[2][COLS - 2] = 'T';

  // Redraw after modifications below
  // Seed emeralds, jars, mate buried
  const rng = Phaser.Math.RND;

  // Pick random tiles for emeralds (avoid starter tunnels and top row)
  const emeraldCount = 6 + layer;
  const jarCount = 3 + Math.floor(layer / 2);
  const placed = new Set();
  placed.add('1,1'); placed.add('2,1'); placed.add('1,2');
  placed.add(`${COLS - 2},1`); placed.add(`${COLS - 3},1`); placed.add(`${COLS - 2},2`);

  function randomEmpty() {
    for (let tries = 0; tries < 40; tries += 1) {
      const c = rng.between(1, COLS - 2);
      const r = rng.between(3, ROWS - 2);
      const k = `${c},${r}`;
      if (!placed.has(k)) {
        placed.add(k);
        return { c, r };
      }
    }
    return null;
  }

  for (let i = 0; i < emeraldCount; i += 1) {
    const p = randomEmpty();
    if (p) spawnEmerald(scene, p.c, p.r);
  }
  for (let i = 0; i < jarCount; i += 1) {
    const p = randomEmpty();
    if (p) spawnJar(scene, p.c, p.r);
  }

  scene.state.emeraldsTotal = scene.state.emeralds.length;

  // Spawn enemies (stay buried in dirt pockets that we carve out locally)
  const enemyRoster = ['openai', 'gemini', 'grok'];
  const enemyCount = 3 + layer;
  for (let i = 0; i < enemyCount; i += 1) {
    const c = rng.between(2, COLS - 3);
    const r = rng.between(Math.floor(ROWS / 2), ROWS - 2);
    // carve a 1-tile pocket for the enemy to spawn in
    g[r][c] = 'T';
    const type = enemyRoster[i % enemyRoster.length];
    spawnEnemy(scene, c, r, type);
  }

  scene.state.mateSpawnAt = scene.time.now + rng.between(MATE_SPAWN_MIN_MS, MATE_SPAWN_MAX_MS);
  scene.state.enemyRespawnQueue = [];
  scene.state.enemySpawnIdx = 0;
  scene.state.levelAdvancing = false;

  redrawGrid(scene);
  drawPlayer(scene, p1);
  drawPlayer(scene, p2);
  refreshHud(scene);
  showLevelBanner(scene, `LAYER ${layer + 1} · ${PAL(layer).name}`, `COLLECT ALL ${scene.state.emeraldsTotal} INSIGHTS TO DESCEND`);
}

// ---------- entity spawns + draw ----------

function spawnEmerald(scene, c, r) {
  const sprite = scene.add.image(tx(c), ty(r), 'claude_spark');
  sprite.setDepth(7);
  sprite.setScale(22 / 16);
  sprite.setVisible(false);
  scene.tweens.add({
    targets: sprite, scale: (22 / 16) * 0.88, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  scene.state.emeralds.push({ c, r, gfx: sprite, collected: false });
  scene.playfield.entityLayer.add(sprite);
}

function spawnJar(scene, c, r) {
  const g = scene.add.image(0, 0, 'cursor');
  g.setScale(22 / 26);
  g.setDepth(7);
  g.x = tx(c); g.y = ty(r);
  g.setVisible(false);
  const jar = { c, r, gfx: g, falling: false, fellFrom: null, fallTimer: 0, wobbleUntil: 0 };
  scene.state.jars.push(jar);
  scene.playfield.entityLayer.add(g);
}

function spawnMate(scene, c, r) {
  const g = scene.add.graphics();
  g.setDepth(7);
  drawMate(g);
  g.x = tx(c); g.y = ty(r);
  g.setVisible(true);
  const m = { c, r, gfx: g };
  scene.state.mates.push(m);
  scene.playfield.entityLayer.add(g);
  scene.tweens.add({
    targets: g,
    y: g.y - 3,
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function drawPromptBubble(scene, face) {
  const p = face > 0;
  const g = scene.add.graphics();
  g.fillStyle(p ? COLORS.p1Band : COLORS.p2Band, 1);
  g.fillRoundedRect(-44, -32, 88, 64, 14);
  g.fillStyle(p ? COLORS.p1 : COLORS.p2, 1);
  g.fillRoundedRect(-40, -28, 80, 56, 12);
  g.fillTriangle(40 * face, -8, 54 * face, 0, 40 * face, 8);
  g.fillStyle(0x0b0f18, 1);
  g.fillRect(-28, -16, 6, 6);
  g.fillRect(-22, -10, 6, 6);
  g.fillRect(-28, -4, 6, 6);
  return g;
}

function drawMate(g) {
  g.clear();
  // Gourd body — round calabash, deep brown
  g.fillStyle(0x3f2210, 1);
  g.fillCircle(0, 3, 10);
  // Warmer side-lit shading (roundness cue)
  g.fillStyle(COLORS.mate, 1);
  g.fillCircle(-2, 2, 7);
  // Dark opening rim on top
  g.fillStyle(0x1f0c02, 1);
  g.fillEllipse(0, -5, 15, 4);
  // Yerba mate (heaped green leaves inside the rim)
  g.fillStyle(0x5fa024, 1);
  g.fillEllipse(0, -5, 13, 3);
  g.fillStyle(0x8fc23a, 1);
  g.fillRect(-3, -6, 2, 1);
  g.fillRect(1, -6, 2, 1);
  g.fillRect(-1, -7, 2, 1);
  // Bombilla — silver straw tilted up-right, with flared mouthpiece
  g.fillStyle(0xcfd5d8, 1);
  g.fillTriangle(2, -5, 5, -13, 7, -13);
  g.fillTriangle(2, -5, 4, -5, 7, -13);
  g.fillRect(4, -15, 5, 2);
}

function spawnEnemy(scene, c, r, type) {
  let g;
  if (type === 'openai' || type === 'grok') {
    g = scene.add.image(0, 0, type);
    g.setScale(type === 'openai' ? 22 / 20 : 22 / 16);
  } else {
    g = scene.add.graphics();
  }
  g.setDepth(8);
  const e = { c, r, type, gfx: g, moveReadyAt: 0, hp: 1, alive: true, dir: { dc: 0, dr: 1 }, rot: 0 };
  if (type === 'gemini') drawEnemyGraphic(e);
  g.x = tx(c); g.y = ty(r);
  scene.state.enemies.push(e);
  scene.playfield.entityLayer.add(g);
}

// Gemini is procedural; OpenAI and Grok are sprites.
function drawEnemyGraphic(e) {
  const g = e.gfx;
  g.clear();
  // Gemini sparkle: 4 pointed rays with concave sides, blue→purple→pink gradient.
  const R = 12, rw = 3.2;
  const pts = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const radius = (i % 2 === 0) ? R : rw;
    pts.push([Math.cos(a) * radius, Math.sin(a) * radius]);
  }
  const rayColors = [0x4285f4, 0x8b4bff, 0xf259b7, 0x5ab8ff];
  for (let q = 0; q < 4; q += 1) {
    const i0 = q * 2;
    const iL = (i0 + 7) % 8;
    const iR = (i0 + 1) % 8;
    g.fillStyle(rayColors[q], 1);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(pts[iL][0], pts[iL][1]);
    g.lineTo(pts[i0][0], pts[i0][1]);
    g.lineTo(pts[iR][0], pts[iR][1]);
    g.closePath();
    g.fillPath();
  }
  g.fillStyle(0xffffff, 1);
  g.fillCircle(0, 0, 1.8);
}

// Display name of each rival type (for score popups and banners)
function enemyTypeLabel(type) {
  const labels = { openai: 'OpenAI', gemini: 'Gemini', grok: 'Grok' };
  return labels[type] || type;
}

function drawPlayer(scene, p) {
  if (!p.gfx || !p.gfx.active) {
    p.gfx = scene.add.graphics();
    p.gfx.setDepth(10);
    scene.playfield.playerLayer.add(p.gfx);
  }
  const g = p.gfx;
  g.clear();
  const isP1 = p.key === 'p1';
  const bodyCol = isP1 ? COLORS.p1 : COLORS.p2;
  const bandCol = isP1 ? COLORS.p1Band : COLORS.p2Band;
  const textCol = 0x0b0f18;
  // Drop shadow
  g.fillStyle(0x000000, 0.35);
  g.fillRoundedRect(-12, -8, 26, 18, 5);
  // Prompt-bubble body (AI chat-input look)
  g.fillStyle(bandCol, 1);
  g.fillRoundedRect(-13, -10, 26, 18, 5);
  g.fillStyle(bodyCol, 1);
  g.fillRoundedRect(-12, -9, 24, 16, 4);
  // `>_` chevron + static underscore cursor
  g.fillStyle(textCol, 1);
  g.fillRect(-9, -5, 2, 2);
  g.fillRect(-7, -3, 2, 2);
  g.fillRect(-9, -1, 2, 2);
  g.fillRect(-3, 1, 7, 2);
  // Small Claude starburst sticker in the top-right of the bubble
  g.fillStyle(0xffd84d, 1);
  g.fillRect(8, -7, 2, 1);
  g.fillRect(7, -6, 1, 1);
  g.fillRect(9, -6, 2, 1);
  g.fillRect(8, -5, 2, 1);
  // Tail / pointer indicating facing direction
  const dc = p.lastDir ? p.lastDir.dc : 1;
  const dr = p.lastDir ? p.lastDir.dr : 0;
  g.fillStyle(bodyCol, 1);
  if (dc > 0) {
    g.fillTriangle(12, -3, 18, 0, 12, 3);
  } else if (dc < 0) {
    g.fillTriangle(-12, -3, -18, 0, -12, 3);
  } else if (dr > 0) {
    g.fillTriangle(-4, 7, 0, 12, 4, 7);
  } else if (dr < 0) {
    g.fillTriangle(-4, -9, 0, -14, 4, -9);
  }
  g.x = p.px; g.y = p.py;
  g.setVisible(p.alive);
}

// ---------- player input + movement ----------

function handlePlayerInput(scene, p, prefix, time, delta) {
  if (!p.alive) return;
  // Fire beam
  if (consumeAnyPressedControl(scene, [`${prefix}_1`])) {
    fireBeam(scene, p);
  }
  // Cebar mate
  if (consumeAnyPressedControl(scene, [`${prefix}_2`])) {
    tryCebarMate(scene, p);
  }

  if (time < p.moveReadyAt) return;

  let dc = 0, dr = 0;
  if (isControlHeld(scene, `${prefix}_U`)) dr = -1;
  else if (isControlHeld(scene, `${prefix}_D`)) dr = 1;
  else if (isControlHeld(scene, `${prefix}_L`)) dc = -1;
  else if (isControlHeld(scene, `${prefix}_R`)) dc = 1;

  if (dc === 0 && dr === 0) return;

  p.lastDir = { dc, dr };
  p.dir = { dc, dr };
  tryMovePlayer(scene, p, dc, dr, time);
}

function tryMovePlayer(scene, p, dc, dr, time) {
  const nc = p.col + dc;
  const nr = p.row + dr;
  if (!inB(nc, nr)) return;

  const other = scene.state.players[p.key === 'p1' ? 'p2' : 'p1'];
  if (other.alive && other.col === nc && other.row === nr) return;

  const wasDirt = scene.state.grid[nr][nc] === 'D';
  const jar = findJarAt(scene, nc, nr);
  const em = findEmeraldAt(scene, nc, nr);
  const mate = findMateAt(scene, nc, nr);
  const enemy = findEnemyAt(scene, nc, nr);

  if (wasDirt) {
    scene.state.grid[nr][nc] = 'T';
    redrawGrid(scene);
    playSound(scene, 'dig');
    spawnDigPuff(scene, tx(nc), ty(nr));
    // Dig reward
    p.score += 5;
    if (jar) jar.gfx.setVisible(true);
    if (em) em.gfx.setVisible(true);
    if (mate) mate.gfx.setVisible(true);
    if (jar) {
      // Revealed a buried jar — consume the turn but don't move onto it
      p.moveReadyAt = time + PLAYER_MOVE_MS;
      refreshHud(scene);
      return;
    }
    refreshHud(scene);
  } else if (jar && !jar.falling && !jar.wobbleUntil) {
    // Tunnel with a stable jar — try to push (horizontal only)
    if (dr === 0) {
      const tc = nc + dc;
      const canPush =
        inB(tc, nr) &&
        scene.state.grid[nr][tc] === 'T' &&
        !findJarAt(scene, tc, nr) &&
        !findEnemyAt(scene, tc, nr) &&
        !(other.alive && other.col === tc && other.row === nr);
      if (!canPush) return;
      jar.c = tc;
      jar.lastPushedBy = p.key;
      scene.tweens.add({ targets: jar.gfx, x: tx(tc), duration: JAR_PUSH_MS, ease: 'Linear' });
      playSound(scene, 'dig');
      p.score += 15;
      refreshHud(scene);
    } else {
      return;
    }
  } else if (jar) {
    // Wobbling or falling — can't walk through
    return;
  }

  // Enemy in target tile?
  if (enemy) {
    if (time < p.powerUntil) {
      killEnemy(scene, enemy, 'ram', p.key);
    } else if (time >= p.iframesUntil) {
      hitPlayer(scene, p, time);
      return;
    }
  }

  // Move player
  p.col = nc;
  p.row = nr;
  p.moveReadyAt = time + PLAYER_MOVE_MS;
  scene.tweens.add({
    targets: p.gfx,
    x: tx(nc),
    y: ty(nr),
    duration: PLAYER_MOVE_MS,
    ease: 'Linear',
    onUpdate: () => {
      p.px = p.gfx.x;
      p.py = p.gfx.y;
    },
  });

  drawPlayer(scene, p);

  if (em && !em.collected) collectEmerald(scene, p, em);
  if (mate) pickUpMate(scene, p, mate, time);
}

function findJarAt(scene, c, r) {
  return scene.state.jars.find((j) => j.c === c && j.r === r);
}
function findEmeraldAt(scene, c, r) {
  return scene.state.emeralds.find((e) => e.c === c && e.r === r && !e.collected);
}
function findMateAt(scene, c, r) {
  return scene.state.mates.find((m) => m.c === c && m.r === r);
}
function findEnemyAt(scene, c, r, aliveOnly) {
  return scene.state.enemies.find((e) => e.alive && e.c === c && e.r === r);
}

function collectEmerald(scene, p, em) {
  em.collected = true;
  em.gfx.destroy();
  scene.state.emeralds = scene.state.emeralds.filter((e) => e !== em);
  p.score += 100;
  p.emeraldChain += 1;
  const colorHex = p.key === 'p1' ? '#ffb347' : '#5ab8ff';
  showFloatingScore(scene, tx(em.c), ty(em.r), `+100`, '#4ade80');
  if (p.emeraldChain >= 8) {
    p.score += 2000;
    p.emeraldChain = 0;
    scene.hud.status.setText(`${p.key.toUpperCase()} JACKPOT +2000`);
    showFloatingScore(scene, tx(em.c), ty(em.r) - 16, `JACKPOT +2000`, '#ffd84d');
    playSound(scene, 'jackpot');
  }
  playSound(scene, 'emerald');
  spawnShatter(scene, tx(em.c), ty(em.r), COLORS.emerald, 6);
  refreshHud(scene);
}

function pickUpMate(scene, p, mate, time) {
  mate.gfx.destroy();
  scene.state.mates = scene.state.mates.filter((m) => m !== mate);
  p.powerUntil = time + MATE_POWER_MS;
  p.score += 150;
  playSound(scene, 'mate');
  showFloatingScore(scene, tx(mate.c), ty(mate.r), `+150 MATE`, '#ffd84d');
  scene.hud.status.setText(`${p.key.toUpperCase()} power mode — ram rivals! cebar (btn 2) to share.`);
  scheduleNextMate(scene);
  refreshHud(scene);
}

function tryCebarMate(scene, p) {
  const now = scene.time.now;
  if (p.powerUntil < now) return;
  const other = scene.state.players[p.key === 'p1' ? 'p2' : 'p1'];
  if (!other.alive) return;
  const dx = Math.abs(other.col - p.col);
  const dy = Math.abs(other.row - p.row);
  if (dx + dy !== 1) return;
  other.powerUntil = Math.max(other.powerUntil, p.powerUntil);
  p.powerUntil = 0;
  p.score += 100;
  playSound(scene, 'mate');
  showFloatingScore(scene, tx(other.col), ty(other.row), `CEBAR +100`, '#ffd84d');
  scene.hud.status.setText(`${p.key.toUpperCase()} passed mate to ${other.key.toUpperCase()}`);
  refreshHud(scene);
}

function hitPlayer(scene, p, time) {
  if (!p.alive) return;
  p.alive = false;
  p.lives -= 1;
  p.emeraldChain = 0;
  p.gfx.setVisible(false);
  spawnShatter(scene, p.px, p.py, p.key === 'p1' ? COLORS.p1 : COLORS.p2, 10);
  playSound(scene, 'death');
  if (p.lives <= 0) {
    // No respawn
    if (scene.state.players.p1.lives <= 0 && scene.state.players.p2.lives <= 0) {
      finishMatch(scene);
    } else {
      scene.hud.status.setText(`${p.key.toUpperCase()} is out.`);
    }
  } else {
    p.respawnAt = time + RESPAWN_MS;
  }
  refreshHud(scene);
}

function updateRespawns(scene, time) {
  for (const p of [scene.state.players.p1, scene.state.players.p2]) {
    if (!p.alive && p.lives > 0 && time >= p.respawnAt) {
      const startC = p.key === 'p1' ? 1 : COLS - 2;
      const startR = 1;
      scene.state.grid[startR][startC] = 'T';
      redrawGrid(scene);
      p.col = startC; p.row = startR;
      p.px = tx(startC); p.py = ty(startR);
      p.alive = true;
      p.iframesUntil = time + HIT_IFRAMES_MS;
      // Recreate gfx if it was destroyed between death and respawn
      if (!p.gfx || !p.gfx.active) {
        p.gfx = null;
        drawPlayer(scene, p);
      } else {
        p.gfx.x = p.px; p.gfx.y = p.py;
        p.gfx.setVisible(true);
        drawPlayer(scene, p);
      }
      scene.hud.status.setText(`${p.key.toUpperCase()} respawned`);
    }
  }
}

// ---------- jars: push handled inline; gravity here ----------

function updateJars(scene, time, delta) {
  const shattered = [];
  for (const jar of scene.state.jars) {
    const below = jar.r + 1;
    const tileBelowClear = below < ROWS && scene.state.grid[below][jar.c] === 'T' &&
      !findJarAt(scene, jar.c, below) && !findEmeraldAt(scene, jar.c, below) && !findMateAt(scene, jar.c, below);

    if (tileBelowClear && !jar.falling) {
      // Wobble phase before falling — gives players time to flee
      if (!jar.wobbleUntil) {
        jar.wobbleUntil = time + JAR_WOBBLE_MS;
        playSound(scene, 'wobble');
        scene.tweens.add({
          targets: jar.gfx,
          angle: { from: -7, to: 7 },
          duration: 95,
          yoyo: true,
          repeat: Math.ceil(JAR_WOBBLE_MS / 190),
          onComplete: () => { if (jar.gfx && jar.gfx.active) jar.gfx.angle = 0; },
        });
      }
      if (time >= jar.wobbleUntil) {
        jar.falling = true;
        jar.fellFrom = jar.r;
        jar.fallTimer = 0;
        jar.wobbleUntil = 0;
        if (jar.gfx && jar.gfx.active) jar.gfx.angle = 0;
      }
    } else if (tileBelowClear && jar.falling) {
      jar.fallTimer += delta;
      if (jar.fallTimer >= JAR_FALL_MS) {
        jar.fallTimer -= JAR_FALL_MS;
        const enemy = findEnemyAt(scene, jar.c, below);
        if (enemy) killEnemy(scene, enemy, 'jar', jar.lastPushedBy);
        for (const p of [scene.state.players.p1, scene.state.players.p2]) {
          if (p.alive && p.col === jar.c && p.row === below && scene.time.now >= p.iframesUntil) {
            hitPlayer(scene, p, scene.time.now);
          }
        }
        jar.r = below;
        scene.tweens.add({ targets: jar.gfx, y: ty(below), duration: JAR_FALL_MS, ease: 'Linear' });
      }
    } else {
      // Not clear below — cancel wobble, land if falling
      if (jar.wobbleUntil) {
        jar.wobbleUntil = 0;
        if (jar.gfx && jar.gfx.active) {
          scene.tweens.killTweensOf(jar.gfx);
          jar.gfx.angle = 0;
        }
      }
      if (jar.falling) {
        const fellTiles = jar.r - (jar.fellFrom == null ? jar.r : jar.fellFrom);
        jar.falling = false;
        jar.fallTimer = 0;
        if (fellTiles >= 2) {
          playSound(scene, 'shatter');
          spawnShatter(scene, tx(jar.c), ty(jar.r), COLORS.jar, 12);
          scene.cameras.main.shake(140, 0.006);
          const both = [scene.state.players.p1, scene.state.players.p2];
          let best = null; let bestDist = Infinity;
          for (const p of both) {
            if (!p.alive) continue;
            const d = Math.abs(p.col - jar.c) + Math.abs(p.row - jar.r);
            if (d < bestDist) { bestDist = d; best = p; }
          }
          const gain = 500 * fellTiles;
          // Credit the last pusher if known, else nearest
          let jarCreditor = jar.lastPushedBy ? scene.state.players[jar.lastPushedBy] : null;
          if (!jarCreditor || !jarCreditor.alive) jarCreditor = best;
          if (jarCreditor) {
            jarCreditor.score += gain;
            const popColor = jarCreditor.key === 'p1' ? '#ffb347' : '#5ab8ff';
            showFloatingScore(scene, tx(jar.c), ty(jar.r), `+${gain} SHATTER`, popColor);
          }
          shattered.push(jar);
        } else {
          playSound(scene, 'jarland');
        }
        jar.fellFrom = null;
      }
    }

    // reveal visibility
    if (jar.gfx && jar.gfx.active) {
      const cell = scene.state.grid[jar.r] && scene.state.grid[jar.r][jar.c];
      if (cell === 'T') jar.gfx.setVisible(true);
    }
  }

  if (shattered.length) {
    for (const j of shattered) {
      if (j.gfx && j.gfx.active) {
        scene.tweens.killTweensOf(j.gfx);
        j.gfx.destroy();
      }
    }
    scene.state.jars = scene.state.jars.filter((j) => !shattered.includes(j));
    refreshHud(scene);
  }

  for (const em of scene.state.emeralds) {
    if (em.gfx && em.gfx.active) {
      const cell = scene.state.grid[em.r] && scene.state.grid[em.r][em.c];
      if (cell === 'T') em.gfx.setVisible(true);
    }
  }
}

// ---------- enemies ----------

function isDiggerEnemy(type) {
  return type === 'gemini';
}

function enemyInterval(type) {
  if (type === 'gemini') return ENEMY_DIG_MS;
  if (type === 'grok') return ENEMY_BOSS_MS; // Grok is the fastest non-digger
  return ENEMY_CHASE_MS;
}

function processEnemyRespawns(scene, time) {
  if (!scene.state.enemyRespawnQueue) return;
  const rng = Phaser.Math.RND;
  const pending = [];
  for (const item of scene.state.enemyRespawnQueue) {
    if (time < item.at) { pending.push(item); continue; }
    // Find a dirt pocket to spawn (carve a 1-tile pocket far from both players)
    let placed = false;
    for (let tries = 0; tries < 30 && !placed; tries += 1) {
      const c = rng.between(1, COLS - 2);
      const r = rng.between(Math.floor(ROWS / 2), ROWS - 2);
      // Avoid spawning inside an entity's tile
      if (findJarAt(scene, c, r) || findEmeraldAt(scene, c, r) || findMateAt(scene, c, r) || findEnemyAt(scene, c, r)) continue;
      // Avoid spawning on a player
      const p1 = scene.state.players.p1; const p2 = scene.state.players.p2;
      if (p1.alive && p1.col === c && p1.row === r) continue;
      if (p2.alive && p2.col === c && p2.row === r) continue;
      // Keep a little distance from players
      const distP1 = Math.abs(p1.col - c) + Math.abs(p1.row - r);
      const distP2 = Math.abs(p2.col - c) + Math.abs(p2.row - r);
      if (Math.min(distP1, distP2) < 5) continue;
      scene.state.grid[r][c] = 'T';
      redrawGrid(scene);
      spawnEnemy(scene, c, r, item.type);
      // little portal poof
      spawnShatter(scene, tx(c), ty(r), 0x9f85ff, 10);
      placed = true;
    }
    if (!placed) pending.push({ at: time + 1500, type: item.type });
  }
  scene.state.enemyRespawnQueue = pending;
}

function updateEnemies(scene, time, delta) {
  processEnemyRespawns(scene, time);
  const players = [scene.state.players.p1, scene.state.players.p2].filter((p) => p.alive);
  if (players.length === 0) return;

  for (const e of scene.state.enemies) {
    if (!e.alive) continue;
    // Gemini sparkle rotates slowly for identity
    if (e.type === 'gemini') {
      e.rot = (e.rot + delta * 0.0025) % (Math.PI * 2);
      e.gfx.rotation = e.rot;
    }
    const interval = enemyInterval(e.type);
    if (time < e.moveReadyAt) continue;
    // Pick closest player
    let target = players[0];
    let bestD = Math.abs(target.col - e.c) + Math.abs(target.row - e.r);
    for (const p of players) {
      const d = Math.abs(p.col - e.c) + Math.abs(p.row - e.r);
      if (d < bestD) { bestD = d; target = p; }
    }
    // Desired direction
    const options = [];
    if (target.col > e.c) options.push({ dc: 1, dr: 0 });
    if (target.col < e.c) options.push({ dc: -1, dr: 0 });
    if (target.row > e.r) options.push({ dc: 0, dr: 1 });
    if (target.row < e.r) options.push({ dc: 0, dr: -1 });
    if (options.length === 0) options.push({ dc: 1, dr: 0 });

    // OpenAI: tunnel only. Gemini/Copilot: can dig.
    let picked = null;
    // Try preferred axis first (largest delta)
    const preferHoriz = Math.abs(target.col - e.c) >= Math.abs(target.row - e.r);
    const ordered = preferHoriz
      ? options.sort((a, b) => Math.abs(b.dc) - Math.abs(a.dc))
      : options.sort((a, b) => Math.abs(b.dr) - Math.abs(a.dr));

    // If a non-digger has been stuck for 2+ ticks, let it dig as a last resort
    const stuckOverride = !isDiggerEnemy(e.type) && (e.stuckCount || 0) >= 2;

    for (const opt of ordered) {
      const nc = e.c + opt.dc;
      const nr = e.r + opt.dr;
      if (!inB(nc, nr)) continue;
      if (scene.state.grid[nr][nc] === 'D' && !isDiggerEnemy(e.type) && !stuckOverride) continue;
      if (findJarAt(scene, nc, nr)) continue;
      if (findEnemyAt(scene, nc, nr)) continue;
      picked = opt; break;
    }

    if (!picked) {
      for (const opt of [{ dc: 1, dr: 0 }, { dc: -1, dr: 0 }, { dc: 0, dr: 1 }, { dc: 0, dr: -1 }]) {
        const nc = e.c + opt.dc;
        const nr = e.r + opt.dr;
        if (!inB(nc, nr)) continue;
        if (scene.state.grid[nr][nc] === 'D' && !isDiggerEnemy(e.type) && !stuckOverride) continue;
        if (findJarAt(scene, nc, nr)) continue;
        if (findEnemyAt(scene, nc, nr)) continue;
        picked = opt; break;
      }
    }

    if (!picked) {
      e.stuckCount = (e.stuckCount || 0) + 1;
    } else {
      e.stuckCount = 0;
    }
    if (!picked) continue;

    // Dig if digger
    const nc = e.c + picked.dc;
    const nr = e.r + picked.dr;
    if (scene.state.grid[nr][nc] === 'D') {
      scene.state.grid[nr][nc] = 'T';
      redrawGrid(scene);
    }
    e.c = nc; e.r = nr; e.dir = picked;
    e.moveReadyAt = time + interval;
    scene.tweens.add({ targets: e.gfx, x: tx(nc), y: ty(nr), duration: interval * 0.9, ease: 'Linear' });

    // Did we collide with a player?
    for (const p of players) {
      if (p.col === nc && p.row === nr) {
        if (time < p.powerUntil) {
          killEnemy(scene, e, 'ram', p.key);
        } else if (time >= p.iframesUntil) {
          hitPlayer(scene, p, time);
        }
      }
    }
  }
}

function killEnemy(scene, e, cause, killerKey) {
  if (!e.alive) return;
  e.hp -= (cause === 'jar' || cause === 'ram') ? 2 : 1;
  if (e.hp > 0) {
    scene.tweens.add({ targets: e.gfx, alpha: 0.3, duration: 80, yoyo: true, repeat: 1 });
    return;
  }
  e.alive = false;
  const shatterColors = {
    openai: 0x10a37f, gemini: 0x8b4bff, grok: 0xffffff,
  };
  spawnShatter(scene, tx(e.c), ty(e.r), shatterColors[e.type] || 0xffffff, 14);
  if (e.gfx && e.gfx.active) { scene.tweens.killTweensOf(e.gfx); e.gfx.destroy(); }
  const bonusBase = { openai: 300, gemini: 500, grok: 400 };
  let bonus = bonusBase[e.type] || 300;
  if (cause === 'jar' || cause === 'ram') bonus = Math.round(bonus * 1.5);
  // Credit to the actor if known; else nearest alive player
  let credited = null;
  if (killerKey && scene.state.players[killerKey] && scene.state.players[killerKey].alive !== undefined) {
    credited = scene.state.players[killerKey];
  }
  if (!credited) {
    const both = [scene.state.players.p1, scene.state.players.p2];
    let best = null; let bestD = Infinity;
    for (const p of both) {
      if (!p.alive) continue;
      const d = Math.abs(p.col - e.c) + Math.abs(p.row - e.r);
      if (d < bestD) { bestD = d; best = p; }
    }
    credited = best;
  }
  if (credited) {
    credited.score += bonus;
    const popColor = credited.key === 'p1' ? '#ffb347' : '#5ab8ff';
    showFloatingScore(scene, tx(e.c), ty(e.r), `+${bonus} ${enemyTypeLabel(e.type)}`, popColor);
  }
  // Queue respawn with a rotated type (cycling through full roster so every competitor appears)
  if (cause !== 'cleanup') {
    scene.state.enemyRespawnQueue = scene.state.enemyRespawnQueue || [];
    if (scene.state.enemyRespawnQueue.length < 4) {
      const roster = ['openai', 'gemini', 'grok'];
      const idx = (scene.state.enemySpawnIdx || 0) % roster.length;
      const nextType = roster[idx];
      scene.state.enemySpawnIdx = idx + 1;
      scene.state.enemyRespawnQueue.push({
        at: scene.time.now + Phaser.Math.Between(ENEMY_RESPAWN_MIN_MS, ENEMY_RESPAWN_MAX_MS),
        type: nextType,
      });
    }
  }
  playSound(scene, 'kill');
  scene.cameras.main.shake(90, 0.004);
  refreshHud(scene);
}

// ---------- beams ----------

function fireBeam(scene, p) {
  if (!p.alive) return;
  // Only 1 active beam per player
  if (scene.state.beams.some((b) => b.owner === p.key)) return;
  const d = p.lastDir.dc === 0 && p.lastDir.dr === 0 ? { dc: 1, dr: 0 } : p.lastDir;
  const gfx = scene.add.graphics();
  gfx.setDepth(9);
  scene.playfield.entityLayer.add(gfx);
  const b = {
    x: p.px,
    y: p.py,
    dx: d.dc * BEAM_SPEED,
    dy: d.dr * BEAM_SPEED,
    dc: d.dc, dr: d.dr,
    owner: p.key,
    gfx,
    bornAt: scene.time.now,
  };
  drawBeamGfx(b.gfx, b);
  scene.state.beams.push(b);
  playSound(scene, 'beam');
}

function drawBeamGfx(g, b) {
  g.clear();
  const horiz = b.dc !== 0;
  if (horiz) {
    g.fillStyle(COLORS.beam, 1);
    g.fillRect(-12, -2, 24, 4);
    g.fillStyle(COLORS.beamInner, 1);
    g.fillRect(-10, -1, 20, 2);
  } else {
    g.fillStyle(COLORS.beam, 1);
    g.fillRect(-2, -12, 4, 24);
    g.fillStyle(COLORS.beamInner, 1);
    g.fillRect(-1, -10, 2, 20);
  }
  g.x = b.x; g.y = b.y;
}

function updateBeams(scene, time, delta) {
  const dt = delta / 1000;
  const stillAlive = [];
  for (const b of scene.state.beams) {
    b.x += b.dx * dt;
    b.y += b.dy * dt;
    b.gfx.x = b.x; b.gfx.y = b.y;
    // Find tile
    const tc = Math.floor((b.x - OX) / TILE);
    const tr = Math.floor((b.y - OY) / TILE);
    if (!inB(tc, tr) || time - b.bornAt > BEAM_LIFE_MS) {
      b.gfx.destroy();
      continue;
    }
    if (scene.state.grid[tr][tc] === 'D') {
      // Hit dirt — absorbed
      b.gfx.destroy();
      spawnShatter(scene, b.x, b.y, COLORS.beam, 4);
      continue;
    }
    const enemy = findEnemyAt(scene, tc, tr);
    if (enemy) {
      killEnemy(scene, enemy, 'beam', b.owner);
      if (b.gfx && b.gfx.active) b.gfx.destroy();
      continue;
    }
    stillAlive.push(b);
  }
  scene.state.beams = stillAlive;
}

// ---------- mate gourd spawn ----------

function updateMate(scene, time) {
  if (scene.state.mates.length > 0) return;
  if (time < scene.state.mateSpawnAt) return;
  // Pick a tunnel tile
  for (let tries = 0; tries < 30; tries += 1) {
    const c = Phaser.Math.Between(1, COLS - 2);
    const r = Phaser.Math.Between(2, ROWS - 2);
    if (scene.state.grid[r][c] === 'T' && !findJarAt(scene, c, r) && !findEmeraldAt(scene, c, r) && !findEnemyAt(scene, c, r, true)) {
      spawnMate(scene, c, r);
      return;
    }
  }
  scheduleNextMate(scene);
}

function scheduleNextMate(scene) {
  scene.state.mateSpawnAt = scene.time.now + Phaser.Math.Between(MATE_SPAWN_MIN_MS, MATE_SPAWN_MAX_MS);
}

function updatePowerModes(scene, time) {
  for (const p of [scene.state.players.p1, scene.state.players.p2]) {
    // flash when in power mode
    if (p.gfx && p.powerUntil > time) {
      p.gfx.alpha = 0.6 + 0.4 * Math.sin(time / 60);
    } else if (p.gfx) {
      if (p.iframesUntil > time) {
        p.gfx.alpha = (Math.floor(time / 90) % 2 === 0) ? 0.4 : 1;
      } else {
        p.gfx.alpha = 1;
      }
    }
  }
}

// ---------- level complete / finish match ----------

function checkLevelComplete(scene) {
  if (scene.state.levelAdvancing) return;
  if (scene.state.emeralds.length === 0 && scene.state.emeraldsTotal > 0) {
    scene.state.levelAdvancing = true;
    advanceLevel(scene);
  }
}

function advanceLevel(scene) {
  const nextLayer = scene.state.layer + 1;
  const p1 = scene.state.players.p1;
  const p2 = scene.state.players.p2;
  const bonus = 1000 * (scene.state.layer + 1);
  p1.score += bonus;
  p2.score += bonus;
  showFloatingScore(scene, GAME_WIDTH / 2 - 80, OY + PLAY_H / 2 - 50, `+${bonus} P1`, '#ffb347');
  showFloatingScore(scene, GAME_WIDTH / 2 + 80, OY + PLAY_H / 2 - 50, `+${bonus} P2`, '#5ab8ff');
  playSound(scene, 'jackpot');
  refreshHud(scene);
  if (nextLayer >= LEVEL_COUNT) {
    scene.hud.status.setText('CONTEXT RESTORED — VICTORY!');
    showLevelBanner(scene, 'CONTEXT RESTORED', `All ${LEVEL_COUNT} layers cleared — well dug, Claudder.`);
    scene.time.delayedCall(1800, () => playVictoryDance(scene));
  } else {
    scene.hud.status.setText(`LAYER CLEAR — descending to ${PAL(nextLayer).name}`);
    showLevelBanner(scene, `LAYER ${scene.state.layer + 1} CLEAR  +${bonus}`, `Descending into ${PAL(nextLayer).name}…`);
    scene.time.delayedCall(1100, () => buildLevel(scene, nextLayer));
  }
}

function playVictoryDance(scene) {
  scene.state.phase = 'dance';
  const c = scene.add.container(0, 0);
  c.setDepth(30);
  c.add(scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x050810, 1));

  c.add(
    scene.add.text(GAME_WIDTH / 2, 120, 'NEVER GIVE UP!', {
      fontFamily: 'monospace', fontSize: '52px', color: '#ffd84d', fontStyle: 'bold',
    }).setOrigin(0.5),
  );

  // Male dancer: pastel clothes, sunglasses, 3 cycling poses on the beat
  const d = scene.add.graphics();
  d.setPosition(GAME_WIDTH / 2, 400).setScale(6);
  c.add(d);
  const POSES = [
    [[-10, -17, 3, 8], [7, -17, 3, 8]],   // arms up (celebrate)
    [[-13, -7, 7, 3], [6, -7, 7, 3]],     // arms out wide
    [[-9, -6, 3, 8], [6, -6, 3, 8]],      // arms down
  ];
  let pose = 0;
  const drawPose = () => {
    d.clear();
    d.fillStyle(0x3a2010, 1); d.fillRect(-5, -20, 10, 3);    // hair
    d.fillStyle(0xfad6a0, 1); d.fillCircle(0, -15, 5);       // head
    d.fillStyle(0, 1); d.fillRect(-5, -16, 10, 2);           // sunglasses
    d.fillStyle(0xc8b0ff, 1); d.fillRect(-6, -9, 12, 10);    // pastel shirt
    d.fillStyle(0x9fc8e8, 1); d.fillRect(-6, 1, 12, 8);      // pastel pants
    d.fillStyle(0xfad6a0, 1);
    POSES[pose].forEach((a) => d.fillRect(...a));
  };
  drawPose();
  scene.time.addEvent({
    delay: 500, repeat: -1,
    callback: () => { pose = (pose + 1) % 3; drawPose(); },
  });

  scene.time.delayedCall(9000, () => {
    c.destroy();
    if (scene.state.players) finishMatch(scene);
    else showStartScreen(scene);
  });
}

function finishMatch(scene) {
  scene.state.phase = 'gameover';
  const p1 = scene.state.players.p1;
  const p2 = scene.state.players.p2;
  const total = p1.score + p2.score;
  let winner = 'p1';
  let winnerLabel = 'P1';
  if (p2.score > p1.score) { winner = 'p2'; winnerLabel = 'P2'; }
  else if (p1.score === p2.score) { winnerLabel = 'DRAW'; }
  scene.state.winner = winner;
  scene.state.winnerLabel = winnerLabel;
  scene.state.nameEntry = {
    letters: [],
    row: 0,
    col: 0,
    moveCooldownUntil: 0,
    confirmCooldownUntil: 0,
    lastMoveVector: { x: 0, y: 0 },
  };

  scene.endGame.summary.setText(
    `P1 ${p1.score}    P2 ${p2.score}    TOTAL ${total}\n` +
    `LAYERS CLEARED: ${scene.state.layer + 1}/${LEVEL_COUNT}  ·  BEST: ${winnerLabel}`,
  );
  scene.endGame.saveStatus.setText(scene.state.saveStatus);
  refreshNameEntry(scene);
  updateLetterGridHighlight(scene);
  refreshLeaderboard(scene);
  scene.endGame.container.setVisible(true);
}

// ---------- particles ----------

function spawnShatter(scene, x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const g = scene.add.rectangle(x, y, 3, 3, color, 1);
    g.setDepth(12);
    const a = Math.random() * Math.PI * 2;
    const dist = 14 + Math.random() * 26;
    scene.tweens.add({
      targets: g,
      x: x + Math.cos(a) * dist,
      y: y + Math.sin(a) * dist,
      alpha: 0,
      duration: 380,
      onComplete: () => g.destroy(),
    });
  }
}

function spawnDigPuff(scene, x, y) {
  for (let i = 0; i < 4; i += 1) {
    const g = scene.add.rectangle(x, y, 2, 2, 0xa07040, 0.8);
    g.setDepth(12);
    const a = Math.random() * Math.PI * 2;
    scene.tweens.add({
      targets: g,
      x: x + Math.cos(a) * 10,
      y: y + Math.sin(a) * 10,
      alpha: 0,
      duration: 220,
      onComplete: () => g.destroy(),
    });
  }
}

// ---------- HUD refresh ----------

function refreshHud(scene) {
  const p1 = scene.state.players && scene.state.players.p1;
  const p2 = scene.state.players && scene.state.players.p2;
  if (!p1 || !p2) return;
  scene.hud.p1Score.setText(`${p1.score}`);
  scene.hud.p1Lives.setText(heartsText(p1.lives));
  scene.hud.p2Score.setText(`${p2.score}`);
  scene.hud.p2Lives.setText(heartsText(p2.lives));
  scene.hud.layer.setText(
    `LAYER ${scene.state.layer + 1}/${LEVEL_COUNT} · ${PAL(scene.state.layer).name}`,
  );
  const collected = scene.state.emeraldsTotal - scene.state.emeralds.length;
  if (scene.hud.progress) {
    scene.hud.progress.setText(`INSIGHTS  ${collected} / ${scene.state.emeraldsTotal}`);
    // Pulse progress text when 1 left
    if (scene.state.emeralds.length === 1 && !scene.hud.progress._pulsing) {
      scene.hud.progress._pulsing = true;
      scene.tweens.add({ targets: scene.hud.progress, scale: 1.12, duration: 340, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else if (scene.state.emeralds.length !== 1 && scene.hud.progress._pulsing) {
      scene.hud.progress._pulsing = false;
      scene.tweens.killTweensOf(scene.hud.progress);
      scene.hud.progress.setScale(1);
    }
  }
}

function heartsText(n) {
  const lives = Math.max(0, n);
  if (lives === 0) return '— — —';
  return '♥ '.repeat(lives).trim();
}

// ---------- name entry ----------

function handleNameEntry(scene, time) {
  const entry = scene.state.nameEntry;
  const controls = scene.controls;

  const axisX = getHorizontalMenuAxis(controls);
  const axisY = getVerticalMenuAxis(controls);

  if (
    time >= entry.moveCooldownUntil &&
    (axisX !== 0 || axisY !== 0) &&
    (entry.lastMoveVector.x !== axisX || entry.lastMoveVector.y !== axisY)
  ) {
    moveLetterSelection(scene, axisX, axisY);
    entry.moveCooldownUntil = time + 180;
    playSound(scene, 'click');
  }

  entry.lastMoveVector = { x: axisX, y: axisY };

  if (
    time >= entry.confirmCooldownUntil &&
    consumeAnyPressedControl(scene, ['P1_1', 'P2_1', 'P1_2', 'P2_2', 'START1', 'START2'])
  ) {
    entry.confirmCooldownUntil = time + 160;
    playSound(scene, 'select');
    activateCurrentLetter(scene);
  }
}

function moveLetterSelection(scene, axisX, axisY) {
  const entry = scene.state.nameEntry;

  if (axisY !== 0) {
    entry.row = Phaser.Math.Wrap(entry.row + axisY, 0, LETTER_GRID.length);
    entry.col = Math.min(entry.col, LETTER_GRID[entry.row].length - 1);
  }

  if (axisX !== 0) {
    entry.col = Phaser.Math.Wrap(entry.col + axisX, 0, LETTER_GRID[entry.row].length);
  }

  updateLetterGridHighlight(scene);
}

function updateLetterGridHighlight(scene) {
  const entry = scene.state.nameEntry;
  for (const item of scene.endGame.gridLabels) {
    const active = item.row === entry.row && item.col === entry.col;
    item.cell.setFillStyle(active ? COLORS.accent : COLORS.cell, active ? 1 : 0.95);
    item.cell.setStrokeStyle(2, active ? COLORS.white : COLORS.frame, active ? 1 : 0.8);
    item.label.setColor(active ? '#0b0f18' : '#f7ffd8');
  }
}

function activateCurrentLetter(scene) {
  const entry = scene.state.nameEntry;
  const selectedValue = LETTER_GRID[entry.row][entry.col];

  if (selectedValue === 'DEL') {
    entry.letters.pop();
    refreshNameEntry(scene);
    return;
  }

  if (selectedValue === 'END') {
    if (entry.letters.length === 0) {
      scene.endGame.saveStatus.setText('Pick at least one character before saving.');
      return;
    }
    submitHighScore(scene);
    return;
  }

  if (entry.letters.length >= WINNING_NAME_LENGTH) {
    entry.letters.shift();
  }

  entry.letters.push(selectedValue);
  refreshNameEntry(scene);
}

function refreshNameEntry(scene) {
  const letters = scene.state.nameEntry.letters.slice();
  while (letters.length < WINNING_NAME_LENGTH) letters.push('_');
  scene.endGame.nameValue.setText(letters.join(' '));
}

function submitHighScore(scene) {
  if (scene.state.phase !== 'gameover') return;
  const initials = scene.state.nameEntry.letters.join('').slice(0, WINNING_NAME_LENGTH) || '???';
  const p1 = scene.state.players.p1;
  const p2 = scene.state.players.p2;
  const total = p1.score + p2.score;

  const entry = {
    name: initials,
    winner: scene.state.winnerLabel,
    score: total,
    detail: `${scene.state.layer}`,
    savedAt: new Date().toISOString().slice(0, 10),
  };

  scene.state.saveStatus = `SAVED ${initials}! Press START to play again.`;
  scene.endGame.saveStatus.setText(scene.state.saveStatus);
  scene.state.phase = 'saved';

  persistHighScore(entry)
    .then((nextScores) => {
      scene.state.highScores = nextScores;
      refreshLeaderboard(scene);
      refreshStartScreenLeaderboard(scene);
    })
    .catch(() => {
      scene.state.saveStatus = 'Could not save the score, but the run stands.';
      if (scene.state.phase === 'saved') {
        scene.endGame.saveStatus.setText(scene.state.saveStatus);
      }
    });
}

function refreshLeaderboard(scene) {
  const lines = scene.state.highScores.length
    ? scene.state.highScores.map((entry, index) => {
        const rank = String(index + 1).padStart(2, '0');
        const score = String(entry.score).padStart(6, ' ');
        return `${rank} ${entry.name.padEnd(3, ' ')} ${score} L${entry.detail}`;
      })
    : ['NO SAVED SCORES YET'];
  scene.endGame.leaderboard.setText(lines.join('\n'));
}

// ---------- storage ----------

async function persistHighScore(entry) {
  const existing = await loadHighScores();
  const nextScores = existing
    .concat(entry)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.savedAt < right.savedAt ? 1 : -1;
    })
    .slice(0, MAX_HIGH_SCORES);
  await storageSet(STORAGE_KEY, nextScores);
  return nextScores;
}

async function loadHighScores() {
  const result = await storageGet(STORAGE_KEY);
  if (!result.found || !Array.isArray(result.value)) return [];
  return result.value.filter(isHighScoreEntry).slice(0, MAX_HIGH_SCORES);
}

function isHighScoreEntry(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.winner === 'string' &&
    typeof value.score === 'number' &&
    typeof value.detail === 'string' &&
    typeof value.savedAt === 'string'
  );
}

function getStorage() {
  if (window.platanusArcadeStorage) return window.platanusArcadeStorage;
  return {
    async get(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? { found: false, value: null } : { found: true, value: JSON.parse(raw) };
      } catch {
        return { found: false, value: null };
      }
    },
    async set(key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
  };
}

async function storageGet(key) { return getStorage().get(key); }
async function storageSet(key, value) { return getStorage().set(key, value); }

// ---------- audio ----------

function startAmbientMusic(scene) {
  if (scene.state.musicStarted) return;
  scene.state.musicStarted = true;
  try {
    const ctx = scene.sound.context;
    if (!ctx) return;

    // Master bus
    const out = ctx.createGain();
    out.gain.value = 0.22;
    out.connect(ctx.destination);

    // 120 BPM, I-V-vi-IV in D major (D - A - Bm - G). Chorus fits exactly 1 loop.
    const BEAT = 0.5;
    const CHORD_BEATS = 4;
    const BAR = BEAT * CHORD_BEATS;
    const LOOP = BAR * 4;

    const BASS_ROOTS = [73.42, 110, 123.47, 98]; // D2, A2, B2, G2

    const CHORDS = [
      [146.83, 185, 220],        // D
      [220, 277.18, 329.63],     // A
      [246.94, 293.66, 369.99],  // Bm
      [196, 246.94, 293.66],     // G
    ];

    // Lead: [freq, duration]. Chorus from game-tune.mid (ch15, t=45.44s), transposed to A major.
    // Notes — A4=440 B4=493.88 C#5=554.37 D5=587.33 E5=659.25 F#5=739.99
    const LEAD = [
      [440,.125],[493.88,.125],[587.33,.125],[493.88,.125],[739.99,.5],[739.99,.25],[659.25,.75],
      [440,.125],[493.88,.125],[587.33,.125],[493.88,.125],[659.25,.5],[659.25,.25],[587.33,.375],
      [554.37,.125],[493.88,.25],
      [440,.125],[493.88,.125],[587.33,.125],[493.88,.125],[587.33,.5],[659.25,.25],[554.37,.375],
      [493.88,.125],[440,.25],[440,.25],[659.25,.75],[587.33,1],
    ];

    // Drum-ish kick on every beat (short sine thump)
    function scheduleKicks(t0) {
      const steps = Math.round(LOOP / BEAT);
      for (let i = 0; i < steps; i += 1) {
        const t = t0 + i * BEAT;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
        osc.connect(g); g.connect(out);
        g.gain.setValueAtTime(0.35, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t); osc.stop(t + 0.22);
      }
      scene.time.delayedCall(LOOP * 1000, () => scheduleKicks(t0 + LOOP));
    }

    // Bass: eighth-note root pulses under each chord
    function scheduleBass(t0) {
      BASS_ROOTS.forEach((f, bar) => {
        for (let k = 0; k < CHORD_BEATS * 2; k += 1) {
          const t = t0 + bar * BAR + k * (BEAT / 2);
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = f;
          osc.connect(g); g.connect(out);
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.start(t); osc.stop(t + 0.25);
        }
      });
      scene.time.delayedCall(LOOP * 1000, () => scheduleBass(t0 + LOOP));
    }

    // Chord pad (sustained triad per bar, warm saw)
    function scheduleChords(t0) {
      CHORDS.forEach((chord, bar) => {
        const start = t0 + bar * BAR;
        chord.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = f;
          osc.connect(g); g.connect(out);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.06, start + 0.08);
          g.gain.setValueAtTime(0.06, start + BAR - 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, start + BAR);
          osc.start(start); osc.stop(start + BAR + 0.05);
        });
      });
      scene.time.delayedCall(LOOP * 1000, () => scheduleChords(t0 + LOOP));
    }

    // Lead melody (square wave, punchy)
    function scheduleLead(t0) {
      let cursor = 0;
      LEAD.forEach((n) => {
        const t = t0 + cursor;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = n[0];
        osc.connect(g); g.connect(out);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.09, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + n[1]);
        osc.start(t); osc.stop(t + n[1] + 0.05);
        cursor += n[1];
      });
      scene.time.delayedCall(cursor * 1000, () => scheduleLead(t0 + cursor));
    }

    const t0 = ctx.currentTime + 0.25;
    scheduleKicks(t0);
    scheduleBass(t0);
    scheduleChords(t0);
    scheduleLead(t0);
  } catch (_) {}
}

function playSound(scene, type) {
  try {
    const ctx = scene.sound && scene.sound.context ? scene.sound.context : new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'wobble') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.linearRampToValueAtTime(210, now + 0.18);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now); osc.stop(now + 0.22);
    } else if (type === 'dig') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now); osc.stop(now + 0.06);
    } else if (type === 'emerald') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'jarland') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === 'shatter') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.32);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'beam') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.14);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === 'kill') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now); osc.stop(now + 0.22);
    } else if (type === 'death') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.5);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      osc.start(now); osc.stop(now + 0.54);
    } else if (type === 'mate') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
      // Second note (major chord-ish)
      const osc2 = ctx.createOscillator(); const g2 = ctx.createGain();
      osc2.type = 'triangle'; osc2.frequency.setValueAtTime(659.25, now + 0.08);
      osc2.connect(g2); g2.connect(ctx.destination);
      g2.gain.setValueAtTime(0.12, now + 0.08);
      g2.gain.linearRampToValueAtTime(0.001, now + 0.28);
      osc2.start(now + 0.08); osc2.stop(now + 0.28);
      const osc3 = ctx.createOscillator(); const g3 = ctx.createGain();
      osc3.type = 'triangle'; osc3.frequency.setValueAtTime(783.99, now + 0.16);
      osc3.connect(g3); g3.connect(ctx.destination);
      g3.gain.setValueAtTime(0.12, now + 0.16);
      g3.gain.linearRampToValueAtTime(0.001, now + 0.38);
      osc3.start(now + 0.16); osc3.stop(now + 0.38);
    } else if (type === 'jackpot') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.12);
      osc.frequency.linearRampToValueAtTime(1320, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
      osc.start(now); osc.stop(now + 0.36);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'select') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    }
  } catch (_) {}
}
