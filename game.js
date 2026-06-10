const GRID_SIZE = 9;
const STORAGE = {
  HIGH: "chromablockBlaster.highScore",
  OPTIONS: "chromablockBlaster.options",
  STATS: "chromablockBlaster.stats",
  ACHIEVEMENTS: "chromablockBlaster.achievements",
  ADVENTURE: "chromablockBlaster.adventureProgress"
};

const SHAPES = [
  // Complexity 1: very easy
  { name: "1x1", complexity: 1, cells: [[0,0]] },
  { name: "2x1", complexity: 1, cells: [[0,0],[1,0]] },
  { name: "1x2", complexity: 1, cells: [[0,0],[0,1]] },
  { name: "3x1", complexity: 1, cells: [[0,0],[1,0],[2,0]] },
  { name: "1x3", complexity: 1, cells: [[0,0],[0,1],[0,2]] },
  { name: "2x2 L", complexity: 1, cells: [[0,0],[0,1],[1,1]] },
  { name: "2x2 L mirror", complexity: 1, cells: [[1,0],[0,1],[1,1]] },
  { name: "2x2 L rot", complexity: 1, cells: [[0,0],[1,0],[0,1]] },
  { name: "2x2 L mirror rot", complexity: 1, cells: [[0,0],[1,0],[1,1]] },

  // Complexity 2: easy-medium
  { name: "T up", complexity: 2, cells: [[0,1],[1,1],[2,1],[1,0]] },
  { name: "T down", complexity: 2, cells: [[0,0],[1,0],[2,0],[1,1]] },
  { name: "T left", complexity: 2, cells: [[1,0],[1,1],[1,2],[0,1]] },
  { name: "T right", complexity: 2, cells: [[0,0],[0,1],[0,2],[1,1]] },
  { name: "3x2 L", complexity: 2, cells: [[0,0],[0,1],[1,1],[2,1]] },
  { name: "3x2 L mirror", complexity: 2, cells: [[2,0],[0,1],[1,1],[2,1]] },
  { name: "3x2 L rot", complexity: 2, cells: [[0,0],[1,0],[2,0],[0,1]] },
  { name: "3x2 L mirror rot", complexity: 2, cells: [[0,0],[1,0],[2,0],[2,1]] },

  // Complexity 3: medium
  { name: "2x2", complexity: 3, cells: [[0,0],[1,0],[0,1],[1,1]] },
  { name: "4x1", complexity: 3, cells: [[0,0],[1,0],[2,0],[3,0]] },
  { name: "1x4", complexity: 3, cells: [[0,0],[0,1],[0,2],[0,3]] },
  { name: "3x2 Z", complexity: 3, cells: [[0,0],[1,0],[1,1],[2,1]] },
  { name: "3x2 Z mirror", complexity: 3, cells: [[1,0],[2,0],[0,1],[1,1]] },
  { name: "2x3 Z rot", complexity: 3, cells: [[0,0],[0,1],[1,1],[1,2]] },
  { name: "2x3 Z mirror rot", complexity: 3, cells: [[1,0],[0,1],[1,1],[0,2]] },
  { name: "Cross", complexity: 3, cells: [[1,0],[0,1],[1,1],[2,1],[1,2]] },

  // Complexity 4: hard
  { name: "2x3", complexity: 4, cells: [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]] },
  { name: "3x2", complexity: 4, cells: [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]] },

  // Complexity 5: expert / boss piece
  { name: "3x3", complexity: 5, cells: [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1],[0,2],[1,2],[2,2]] }
];

const COMPLEXITY_SPAWN_WEIGHTS = {
  1: 60,
  2: 25,
  3: 12,
  4: 3,
  5: 1
};

const COLORS = [
  "#9b2b41", // Red
  "#20ac43", // Green
  "#165090", // Blue
  "#ffcc00", // Yellow
  "#771ca5", // Purple
  "#7c5115", // Orange
  "#26948b", // Teal
  "#5c2f22", // Brown
  "#964970"  // Pink
];


const NAMED_COLORS = {
  red: "#9b2b41",
  green: "#20ac43",
  blue: "#165090",
  yellow: "#ffcc00",
  purple: "#771ca5",
  orange: "#7c5115",
  teal: "#26948b",
  brown: "#5c2f22",
  pink: "#964970"
};

const COLOR_NAMES_BY_HEX = Object.fromEntries(
  Object.entries(NAMED_COLORS).map(([name, hex]) => [hex.toLowerCase(), name])
);

const STARTING_COLOR_COUNT = 2;
const COLOR_UNLOCK_INTERVAL = 300;
const TREASURE_CHANCE_PER_PIECE = 0.18;
const RAINBOW_PIECE_CHANCE = 0.08;
const BOARD_CLEAR_BONUS = 250;

function getUnlockedColorCount() {
  if (currentGameMode === "adventure" && currentAdventureLevel?.availableColors?.length) {
    return currentAdventureLevel.availableColors.length;
  }

  return STARTING_COLOR_COUNT + getEndlessExtraColorCount(score);
}

function getEndlessExtraColorCount(currentScore) {
  // Endless color progression:
  // first new color at 300, then at 1200, 2400, 4800, 9600, ...
  if (currentScore < 300) return 0;

  let extra = 1;
  let threshold = 1200;

  while (currentScore >= threshold && extra < COLORS.length - STARTING_COLOR_COUNT) {
    extra++;
    threshold *= 2;
  }

  return extra;
}

function getUnlockedColors() {
  return COLORS.slice(0, Math.min(COLORS.length, getUnlockedColorCount()));
}

function getRandomUnlockedColor() {
  const unlockedCount = getUnlockedColorCount();

  // After the named color sequence is fully unlocked, start adding true random colors.
  if (unlockedCount > COLORS.length) {
    const namedColorChance = 0.75;
    if (Math.random() > namedColorChance) return makeRandomColor();
  }

  const pool = getUnlockedColors();
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 72 + Math.floor(Math.random() * 22);
  const lightness = 48 + Math.floor(Math.random() * 12);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const MUSIC_TRACKS = [
  "audio/music_monume_retro_arcade_game_music.mp3",
  "audio/music_leberch_travel.mp3",
  "audio/music_monume_retro_arcade_game_music_2.mp3",
  "audio/music_alex_morgan_underwater_dreamscape.mp3",
  "audio/music_tobylane_save_as.mp3",
  "audio/music_freemusicforvideo_retro_arcade_game_music.mp3",
  "audio/music_alex_morgan_idm_glitch_experiment.mp3"
];


const COMBO_METER_MAX = 100;
const COMBO_CLEAR_GAIN = 42;
const COMBO_MISS_LOSS = 36;

const DEFAULT_STATS = {
  gamesPlayed: 0,
  highScore: 0,
  highestCombo: 0,
  totalLinesCleared: 0,
  perfectColorLines: 0,
  treasureTilesPopped: 0,
  treasureActions: 0,
  rainbowPiecesPlaced: 0,
  bestTreasureMultiplier: 1,
  boardClears: 0,
  blocksPlaced: 0,
  piecesPlaced: 0,
  threeByThreePlaced: 0
};

const RANKS = [
  { name: "Novice", lines: 0 },
  { name: "Builder", lines: 25 },
  { name: "Architect", lines: 100 },
  { name: "Engineer", lines: 250 },
  { name: "Master Builder", lines: 500 },
  { name: "Chromablast Legend", lines: 1000 }
];

const ACHIEVEMENTS = [
  { id: "first_blast", name: "First Blast", desc: "Clear your first line.", test: () => stats.totalLinesCleared >= 1 },
  { id: "combo_3", name: "Combo Spark", desc: "Reach combo x3.", test: () => stats.highestCombo >= 3 },
  { id: "combo_5", name: "Combo Beast", desc: "Reach combo x5.", test: () => stats.highestCombo >= 5 },
  { id: "combo_10", name: "Combo Lord", desc: "Reach combo x10.", test: () => stats.highestCombo >= 10 },
  { id: "perfect_10", name: "Color Adept", desc: "Clear 10 perfect-color lines.", test: () => stats.perfectColorLines >= 10 },
  { id: "perfect_50", name: "Chromatic Master", desc: "Clear 50 perfect-color lines.", test: () => stats.perfectColorLines >= 50 },
  { id: "pieces_100", name: "Block Handler", desc: "Place 100 pieces.", test: () => stats.piecesPlaced >= 100 },
  { id: "pieces_500", name: "Architect", desc: "Place 500 pieces.", test: () => stats.piecesPlaced >= 500 },
  { id: "three_by_three", name: "The Impossible Square", desc: "Place a 3x3 piece.", test: () => stats.threeByThreePlaced >= 1 },
  { id: "treasure_1", name: "Golden Dust", desc: "Pop your first treasure tile.", test: () => stats.treasureTilesPopped >= 1 },
  { id: "treasure_10", name: "Treasure Hunter", desc: "Pop 10 treasure tiles.", test: () => stats.treasureTilesPopped >= 10 },
  { id: "treasure_50", name: "Golden Touch", desc: "Pop 50 treasure tiles.", test: () => stats.treasureTilesPopped >= 50 },
  { id: "treasure_mult_3", name: "Triple Treasure", desc: "Get a 3x treasure action.", test: () => stats.bestTreasureMultiplier >= 3 },
  { id: "board_clear_1", name: "Clean Slate", desc: "Clear the entire board.", test: () => stats.boardClears >= 1 },
  { id: "board_clear_5", name: "Wipeout", desc: "Clear the entire board 5 times.", test: () => stats.boardClears >= 5 },
  { id: "board_clear_25", name: "Perfectionist", desc: "Clear the entire board 25 times.", test: () => stats.boardClears >= 25 },
  { id: "board_clear_100", name: "Chromablast Ascendant", desc: "Clear the entire board 100 times.", test: () => stats.boardClears >= 100 },
  { id: "score_1000", name: "Four Digits", desc: "Score 1000 points in one run.", test: () => score >= 1000 },
  { id: "score_3000", name: "Blaster Elite", desc: "Score 3000 points in one run.", test: () => score >= 3000 }
];

const MANUAL_ACHIEVEMENTS = {
  cat_introduction: { id: "cat_introduction", name: "Introduction Cleared", desc: "Complete every Introduction level." },
  cat_introduction_3: { id: "cat_introduction_3", name: "Introduction Perfect", desc: "Earn 3 stars on every Introduction level." },
  cat_beginner: { id: "cat_beginner", name: "Beginner Cleared", desc: "Complete every Beginner level." },
  cat_beginner_3: { id: "cat_beginner_3", name: "Beginner Perfect", desc: "Earn 3 stars on every Beginner level." },
  cat_steelworks: { id: "cat_steelworks", name: "Steelworks Cleared", desc: "Complete every Steelworks level." },
  cat_steelworks_3: { id: "cat_steelworks_3", name: "Steelworks Perfect", desc: "Earn 3 stars on every Steelworks level." },
  cat_color_locks: { id: "cat_color_locks", name: "Color Locks Cleared", desc: "Complete every Color Locks level." },
  cat_color_locks_3: { id: "cat_color_locks_3", name: "Color Locks Perfect", desc: "Earn 3 stars on every Color Locks level." },
  cat_precision: { id: "cat_precision", name: "Precision Cleared", desc: "Complete every Precision level." },
  cat_precision_3: { id: "cat_precision_3", name: "Precision Perfect", desc: "Earn 3 stars on every Precision level." },
  cat_legend: { id: "cat_legend", name: "Legend Cleared", desc: "Complete every Legend level." },
  cat_legend_3: { id: "cat_legend_3", name: "Legend Perfect", desc: "Earn 3 stars on every Legend level." },
  all_adventure: { id: "all_adventure", name: "Campaign Complete", desc: "Complete every Adventure level." },
  all_adventure_3: { id: "all_adventure_3", name: "Chromablock Legend", desc: "Earn 3 stars on every Adventure level." }
};


let board, bgTextures, pieces, score, highScore, comboLevel, comboMeter, missesSinceLine, dragging;
let previousUnlockedColorCount = STARTING_COLOR_COUNT;
let stats = loadStats();
let unlockedAchievements = loadAchievements();
let lastPreviewWasValid = false;
let currentTrack = -1;
let activePointerId = null;
let runStartedAt = 0;
let currentGameMode = "endless";
  setTimeout(updateGameNavButton, 0);
let adventureLevels = [];
let currentAdventureLevel = null;
let adventureProgress = loadAdventureProgress();
let adventureMoveCount = 0;
let adventurePieceQueueIndex = 0;
let audioUnlocked = false;
let cheatBuffer = '';
let lastGameOverLocalScoreId = null;
let scoreHistory = [];
let scoreSourceTotals = {};
let scoreTurnNumber = 0;

const COMBO_INVENTORY_LIMIT = 7;

const COMBO_ITEM_DEFS = [
  { type: "pickaxe", minCombo: 2, weight: 52, icon: "⛏", name: "Pickaxe", desc: "Remove a single block." },
  { type: "bomb3x3", minCombo: 2, weight: 24, icon: "💣", name: "3×3 Bomb", desc: "Remove a 3×3 area centered on the selected tile." },

  { type: "reroll", minCombo: 4, weight: 18, icon: "🔁", name: "Reroll", desc: "Drop onto one available piece to replace only that piece." },
  { type: "tnt", minCombo: 4, weight: 14, icon: "🧨", name: "TNT", desc: "Remove blocks in a radius-2 diamond." },
  { type: "cross", minCombo: 4, weight: 14, icon: "✚", name: "Cross Blast", desc: "Remove the selected row and column." },
  { type: "prism", minCombo: 4, weight: 14, icon: "◆", name: "Rainbow Prism", desc: "Convert blocks in a radius-2 diamond into rainbow blocks." },

  { type: "rerollAll", minCombo: 6, weight: 10, icon: "🔀", name: "Reroll All", desc: "Generate a completely new set of 3 available pieces." },
  { type: "rocket", minCombo: 6, weight: 8, icon: "🚀", name: "Rocket", desc: "Remove blocks in a radius-5 diamond." },
  { type: "diamondPrism", minCombo: 6, weight: 8, icon: "◇", name: "Diamond Prism", desc: "Convert blocks in a radius-4 diamond into rainbow blocks." }
];

let comboInventory = [];
let comboItemInstanceCounter = 0;
let activeComboItemDrag = null;
let lastComboItemGameOverWarningAt = 0;


let lastPlacedCells = [];
let pendingAdventureResult = null;
let glintTimer = null;
const PLAYER_NAME_STORAGE_KEY = "chromablockBlaster.playerName";
const USERNAME_SEEN_STORAGE_KEY = "chromablockBlaster.usernamePromptSeen";
let currentScreenName = 'main';
let options = loadOptions();

const screens = {
  main: document.getElementById("mainMenu"),
  mode: document.getElementById("modeSelectMenu"),
  levels: document.getElementById("levelSelectMenu"),
  options: document.getElementById("optionsMenu"),
  help: document.getElementById("helpMenu"),
  stats: document.getElementById("statsMenu"),
  leaderboard: document.getElementById("leaderboardMenu"),
  credits: document.getElementById("creditsMenu"),
  game: document.getElementById("gameScreen"),
  over: document.getElementById("gameOverScreen")
};

const gridEl = document.getElementById("grid");
const fxLayer = document.getElementById("fxLayer");
const piecesEl = document.getElementById("pieces");

const audio = {
  place: document.getElementById("sndPlace"),
  clear: document.getElementById("sndClear"),
  combo: document.getElementById("sndCombo"),
  bad: document.getElementById("sndBad"),
  preview: document.getElementById("sndPreview"),
  perfect: document.getElementById("sndPerfect"),
  multiline: document.getElementById("sndMultiline"),
  massive: document.getElementById("sndMassive"),
  gameover: document.getElementById("sndGameOver"),
  music: document.getElementById("music")
};

document.getElementById("gameNavBtn")?.addEventListener("click", () => {
  clearAdventureResultState();
  if (currentGameMode === "adventure") {
    hideAdventureResultOverlay?.();
    openLevelSelect();
  } else {
    stopTileGlints();
    clearAdventureHintBar?.();
    showScreen("main");
  }
});

document.getElementById("playBtn").addEventListener("click", () => showScreen("mode"));
document.getElementById("endlessModeBtn").addEventListener("click", startEndlessGame);
document.getElementById("adventureModeBtn").addEventListener("click", openLevelSelect);
document.getElementById("optionsBtn").addEventListener("click", () => showScreen("options"));
document.getElementById("helpBtn").addEventListener("click", () => showScreen("help"));
document.getElementById("statsBtn").addEventListener("click", () => {
  renderStatsScreen();
  showScreen("stats");
});

document.getElementById("leaderboardBtn").addEventListener("click", () => {
  renderLeaderboardScreen("local");
  showScreen("leaderboard");
});

document.getElementById("creditsBtn").addEventListener("click", () => showScreen("credits"));

document.getElementById("savePublicLeaderboardNameBtn").addEventListener("click", () => {
  const input = document.getElementById("publicLeaderboardNameInput");
  const saved = window.ChromablockLeaderboard.setPublicLeaderboardName(input?.value || "");
  if (input) input.value = saved;
  showToast("NAME SAVED", saved);
  updateAuthUi();
  updateGlobalUi();
  renderLeaderboardScreen("local");
});

document.getElementById("mainLoginBtn")?.addEventListener("click", async () => {
  try {
    await window.ChromablockLeaderboard.signInWithGoogle();
    updateMainPlayerBox();
    updateAuthUi();
  } catch (err) {
    console.error("Main login failed:", err);
    showToast("LOGIN FAILED", err.message || "Google sign-in failed");
  }
});

document.getElementById("googleSignInBtn").addEventListener("click", async () => {
  try {
    setLeaderboardStatus("Opening Google sign-in...");
    await window.ChromablockLeaderboard.signInWithGoogle();
    updateAuthUi();
    setLeaderboardStatus(window.ChromablockLeaderboard.getStatus());
    renderLeaderboardScreen("online");
  } catch (err) {
    console.error("Google sign-in failed:", err);
    setLeaderboardStatus(`Google sign-in failed: ${err.message || err}`);
  }
});

document.getElementById("googleSignOutBtn").addEventListener("click", async () => {
  await window.ChromablockLeaderboard.signOut();
  updateAuthUi();
  renderLeaderboardScreen("local");
});

document.getElementById("syncLeaderboardBtn").addEventListener("click", async () => {
  setLeaderboardStatus("Syncing...");
  const result = await window.ChromablockLeaderboard.syncPendingScores();
  if (result.requiresSignIn) {
    setLeaderboardStatus(`Sign in with Google to upload pending scores. Pending: ${result.remaining}.`);
  } else {
    setLeaderboardStatus(`Synced ${result.synced}. Remaining ${result.remaining}.`);
  }
  renderLeaderboardScreen("online");
});

document.getElementById("showOnlineLeaderboardBtn").addEventListener("click", () => renderLeaderboardScreen("online"));
document.getElementById("showLocalLeaderboardBtn").addEventListener("click", () => renderLeaderboardScreen("local"));

window.addEventListener("chromablock-auth-changed", () => {
  updateAuthUi();
  if (currentScreenName === "leaderboard") renderLeaderboardScreen("online");
  updateGlobalUi();
  if (currentScreenName === "over") updateGameOverLeaderboardPanel(score);
});

document.getElementById("gameOverGoogleSignInBtn").addEventListener("click", async () => {
  const status = document.getElementById("gameOverLeaderboardStatus");

  try {
    if (status) status.textContent = "Opening Google sign-in...";
    await window.ChromablockLeaderboard.signInWithGoogle();

    if (lastGameOverLocalScoreId) {
      if (status) status.textContent = "Uploading score...";
      const result = await window.ChromablockLeaderboard.submitPendingForLocalId(lastGameOverLocalScoreId);

      if (result.submittedOnline) {
        if (status) status.textContent = "New online high score uploaded. Calculating position...";
        await updateGameOverLeaderboardPanel(score);
      } else if (result.skippedNotHighScore) {
        if (status) status.textContent = "Signed in. This score did not beat your online high score.";
        await updateGameOverLeaderboardPanel(score);
      } else {
        await updateGameOverLeaderboardPanel(score);
      }
    } else {
      await updateGameOverLeaderboardPanel(score);
    }
  } catch (err) {
    console.error("Game-over Google sign-in/upload failed:", err);
    if (status) status.textContent = `Sign-in failed: ${err.message || err}`;
  }
});

document.getElementById("gameOverViewLeaderboardBtn").addEventListener("click", () => {
  renderLeaderboardScreen("online");
  showScreen("leaderboard");
});

document.getElementById("confirmUsernameBtn").addEventListener("click", confirmFirstRunUsername);
document.getElementById("firstRunUsernameInput").addEventListener("keydown", e => {
  if (e.key === "Enter") confirmFirstRunUsername();
});

document.addEventListener("pointerdown", unlockAudioOnce, { once: true });
document.addEventListener("keydown", unlockAudioOnce, { once: true });
window.addEventListener("resize", () => { updateResponsiveLayout(); updateScrollIndicators(); });
window.addEventListener("orientationchange", () => setTimeout(() => { syncMobileGameNavPlacement(); updateResponsiveLayout(); updateScrollIndicators(); }, 180));

function unlockAudioOnce() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  // Browsers often block media until direct user input.
  // This primes the audio elements without requiring visible UI changes.
  for (const key of Object.keys(audio)) {
    const el = audio[key];
    if (!el || key === "music") continue;
    try {
      el.volume = el.volume || 1;
      el.play().then(() => {
        el.pause();
        el.currentTime = 0;
      }).catch(() => {});
    } catch {}
  }

  if (options.music) {
    startMusic();
  }
}

document.addEventListener("keydown", e => {
  handleCheatInput(e);

  if (e.key !== "Escape") return;

  e.preventDefault();

  // If dragging, cancel drag first rather than leaving the current screen.
  if (dragging) {
    clearPreview();
    dragging.sourceEl.style.visibility = "";
    cleanupDrag();
    return;
  }

  handleEscapeNavigation();
});

function handleCheatInput(e) {
  if (currentScreenName !== "game") return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length !== 1) return;

  cheatBuffer = (cheatBuffer + e.key.toLowerCase()).slice(-12);

  if (cheatBuffer.endsWith("new")) {
    cheatBuffer = "";
    rerollAvailablePiecesCheat();
  }
}

function rerollAvailablePiecesCheat() {
  if (currentScreenName !== "game") return;

  generatePieces();
  renderPieces();

  showCheatToast("Fresh Set");
  playSound("preview");
  haptic(18);

  if (!anyRemainingPieceCanFit()) {
    showToast("WARNING", "No current piece fits");
  }
}

function showCheatToast(text) {
  const el = document.createElement("div");
  el.className = "cheat-toast";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function handleEscapeNavigation() {
  clearAdventureResultState();
  if (currentScreenName === "main") return;

  // ESC from game returns to main menu, matching the visible Main Menu button.
  // ESC from all menu/detail screens also returns to main.
  stopMusic();
  loadAdventureLevels();
  showScreen("main");
  maybePromptForUsername();
  updateAuthUi();
}
document.getElementById("adventureRetryBtn")?.addEventListener("click", () => {
  hideAdventureResultOverlay();
  if (currentAdventureLevel) startAdventureLevel(currentAdventureLevel.id);
});

document.getElementById("adventureNextBtn")?.addEventListener("click", () => {
  const nextId = pendingAdventureResult?.nextLevelId;
  hideAdventureResultOverlay();

  if (nextId) startAdventureLevel(nextId);
  else openLevelSelect();
});

document.getElementById("adventureMapBtn")?.addEventListener("click", () => {
  hideAdventureResultOverlay();
  openLevelSelect();
});
document.getElementById("retryBtn").addEventListener("click", () => {
  hideEndlessGameOverOverlay();
  if (currentGameMode === "adventure" && currentAdventureLevel) startAdventureLevel(currentAdventureLevel.id);
  else startEndlessGame();
});
document.querySelectorAll(".backMenuBtn").forEach(btn => btn.addEventListener("click", () => {
  hideEndlessGameOverOverlay();
  stopTileGlints();
  clearAdventureHintBar();
  showScreen("main");
}));
document.getElementById("saveOptionsBtn").addEventListener("click", saveOptionsFromMenu);

init();

function init() {
  console.log("[Game] init() called.");
  highScore = Math.max(Number(localStorage.getItem(STORAGE.HIGH) || 0), stats.highScore || 0);
  document.getElementById("menuHighScore").textContent = highScore;
  document.getElementById("highScore").textContent = highScore;
  applyOptionsToControls();
  applyOptionsToCss();
  showScreen("main");
}

function updateGameNavButton() {
  const btn = document.getElementById("gameNavBtn");
  if (!btn) return;

  btn.textContent = currentGameMode === "adventure" ? "Level Select" : "Main Menu";
}

function updateScreenChrome(name) {
  updateGameNavButton();
  document.body.classList.toggle("adventure-mode", name === "game" && currentGameMode === "adventure");
  const titleBar = document.getElementById("globalTitleBar");
  if (titleBar) {
    titleBar.classList.toggle("hidden", name === "game");
  }

  document.querySelectorAll(".screen.active .menu-card, .screen.active .help-card, .screen.active .leaderboard-card, .screen.active .stats-card, .screen.active .gameover-card")
    .forEach(ensureScrollIndicators);
}

function ensureScrollIndicators(card) {
  if (!card || card.dataset.scrollIndicatorsReady) return;

  card.dataset.scrollIndicatorsReady = "true";
  card.classList.add("scroll-indicator-host");

  const up = document.createElement("div");
  up.className = "scroll-indicator scroll-up hidden";
  up.textContent = "▲";

  const down = document.createElement("div");
  down.className = "scroll-indicator scroll-down hidden";
  down.textContent = "▼";

  // Important:
  // Up must be the first child so sticky top can pin to the top.
  // Down must be the last child so sticky bottom can pin to the bottom.
  card.prepend(up);
  card.appendChild(down);

  card.addEventListener("scroll", updateScrollIndicators, { passive: true });
}

function updateScrollIndicators() {
  const cards = document.querySelectorAll(".screen.active .menu-card, .screen.active .help-card, .screen.active .leaderboard-card, .screen.active .stats-card, .screen.active .gameover-card, .screen.active .level-select-card, .screen.active .options-card, .screen.active .mode-select-card");

  cards.forEach(card => {
    ensureScrollIndicators(card);

    const up = card.querySelector(":scope > .scroll-up");
    const down = card.querySelector(":scope > .scroll-down");

    // Hide before measuring so arrows do not meaningfully affect detection.
    up?.classList.add("hidden");
    down?.classList.add("hidden");

    const canScroll = card.scrollHeight > card.clientHeight + 8;
    const canUp = canScroll && card.scrollTop > 8;
    const canDown = canScroll && card.scrollTop + card.clientHeight < card.scrollHeight - 8;

    up?.classList.toggle("hidden", !canUp);
    down?.classList.toggle("hidden", !canDown);
  });
}


function showScreen(name) {
  hideEndlessGameOverOverlay();
  if (name !== "game") {
    clearAdventureResultState();
  }
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  currentScreenName = name;
  updateScreenChrome(name);
  renderComboItemBar();
  updateResponsiveLayout();
  setTimeout(() => {
    updateResponsiveLayout();
    updateScrollIndicators();
  }, 80);
  document.getElementById("menuHighScore").textContent = highScore;
  if (name === "stats") renderStatsScreen();
  if (name === "leaderboard") renderLeaderboardScreen("local");

  if (audioUnlocked && options.music) startMusic();
}

function startEndlessGame() {
  clearItemSaveWarningState();
  console.info("[Combo Items] Starting Endless: item bar should be visible and reset.");
  clearAdventureResultState();
  currentGameMode = "endless";
  lastComboItemGameOverWarningAt = 0;
  currentAdventureLevel = null;
  clearAdventureHintBar();
  adventureMoveCount = 0;
  adventurePieceQueueIndex = 0;
  document.getElementById("adventureHud")?.classList.add("hidden");
  board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  bgTextures = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => randTextureIndex())
  );
  pieces = [];
  score = 0;
  resetScoreLog();
  resetComboItems();
  comboLevel = 0;
  comboMeter = 0;
  missesSinceLine = 0;
  dragging = null;
  previousUnlockedColorCount = STARTING_COLOR_COUNT;
  stats.gamesPlayed++;
  runStartedAt = Date.now();
  saveStats();
  updateResponsiveLayout();
  buildGrid();
  generatePieces();
  updateHud();
  showScreen("game");
  startTileGlints();
  startMusic();
}

function buildGrid() {
  gridEl.innerHTML = "";
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.style.setProperty("--bg-tile-img", `url("img/backgroundCube${bgTextures[y][x]}.png")`);
      gridEl.appendChild(cell);
    }
  }
}

function generatePieces() {
  if (currentGameMode === "adventure") {
    generateAdventurePieces();
  } else {
    pieces = Array.from({ length: 3 }, (_, id) => makeRandomPiece(id));
  }

  renderPieces();

  if (currentGameMode === "adventure") {
    if (!anyPieceCanFit()) adventureFail("No pieces fit.");
  } else if (!anyPieceCanFit()) {
    triggerEndlessGameOverIfNoItemCanSave("No newly generated piece fits.");
  }
}

function makeRandomPiece(id) {
  const shape = getWeightedRandomShape();
  const rainbow = Math.random() < RAINBOW_PIECE_CHANCE;

  return {
    id,
    name: shape.name,
    complexity: shape.complexity,
    cells: normalizeCells(shape.cells),
    color: rainbow ? "#ffffff" : getRandomUnlockedColor(),
    texture: randTextureIndex(),
    tileTextures: shape.cells.map(() => randTextureIndex()),
    rainbow,
    treasureIndex: rainbow ? -1 : getTreasureIndex(shape.cells),
    used: false
  };
}


function makePieceFromPreset(id, preset) {
  const shape = SHAPES.find(s => s.name.toLowerCase() === String(preset.shape).toLowerCase()) || SHAPES[0];
  const color = NAMED_COLORS[preset.color] || preset.color || getAdventureRandomColor();

  return {
    id,
    name: shape.name,
    complexity: shape.complexity,
    cells: normalizeCells(shape.cells),
    color,
    texture: randTextureIndex(),
    tileTextures: shape.cells.map(() => randTextureIndex()),
    rainbow: Boolean(preset.rainbow),
    treasureIndex: -1,
    used: false
  };
}

function getAdventureRandomColor() {
  const level = currentAdventureLevel;
  const names = level?.availableColors?.length ? level.availableColors : ["red", "green"];
  const name = names[Math.floor(Math.random() * names.length)];
  return NAMED_COLORS[name] || name;
}

function generateAdventurePieces() {
  const level = currentAdventureLevel;
  pieces = [];

  for (let i = 0; i < 3; i++) {
    const preset = level?.pieceQueue?.[adventurePieceQueueIndex];

    if (preset) {
      pieces.push(makePieceFromPreset(i, preset));
      adventurePieceQueueIndex++;
    } else if (level?.allowRandomPieces) {
      const shape = getWeightedRandomShape();
      pieces.push(makePieceFromPreset(i, {
        shape: shape.name,
        color: getAdventureRandomColor()
      }));
    } else {
      break;
    }
  }
}

function getWeightedRandomShape() {
  // 1x1 exists for Adventure tutorial/preset levels only.
  // It should not appear in Endless because it makes survival too easy.
  const pool = currentGameMode === "endless"
    ? SHAPES.filter(shape => shape.name !== "1x1")
    : SHAPES;

  const totalWeight = pool.reduce((sum, shape) => {
    return sum + (COMPLEXITY_SPAWN_WEIGHTS[shape.complexity] || 1);
  }, 0);

  let roll = Math.random() * totalWeight;

  for (const shape of pool) {
    roll -= COMPLEXITY_SPAWN_WEIGHTS[shape.complexity] || 1;
    if (roll <= 0) return shape;
  }

  return pool[pool.length - 1];
}

function getTreasureIndex(cells) {
  // At most one tile in a complex square can be treasure.
  if (Math.random() > TREASURE_CHANCE_PER_PIECE) return -1;
  return Math.floor(Math.random() * cells.length);
}

function normalizeCells(cells) {
  const minX = Math.min(...cells.map(c => c[0]));
  const minY = Math.min(...cells.map(c => c[1]));
  return cells.map(([x,y]) => [x - minX, y - minY]);
}


function resetComboItems() {
  comboInventory = [];
  comboItemInstanceCounter = 0;
  renderComboItemBar();
}

function renderComboItemBar() {
  const bar = document.getElementById("comboItemBar");
  if (!bar) {
    console.warn("[Combo Items] comboItemBar element is missing from index.html.");
    return;
  }

  const endless = currentGameMode === "endless";
  bar.classList.toggle("hidden", !endless);

  if (!endless) {
    bar.innerHTML = "";
    return;
  }

  const count = comboInventory.length;

  bar.innerHTML = `
    <div class="combo-inventory-count">${count}/${COMBO_INVENTORY_LIMIT}</div>
    <div class="combo-inventory-items" style="--inventory-count: ${Math.max(1, count)};">
      ${comboInventory.map(item => `
        <button
          class="combo-item-slot unlocked ${item.justDropped ? "combo-item-unlock" : ""}"
          data-item-id="${item.instanceId}"
          title="${escapeHtml(item.name)}: ${escapeHtml(item.desc)}"
          aria-label="${escapeHtml(item.name)}"
        >
          <span class="combo-item-icon">${item.icon}</span>
          
        </button>
      `).join("")}
    </div>
  `;

  bar.querySelectorAll(".combo-item-slot[data-item-id]").forEach(slotEl => {
    slotEl.addEventListener("pointerdown", beginComboItemDrag);
  });

  setTimeout(() => {
    comboInventory.forEach(item => item.justDropped = false);
    bar.querySelectorAll(".combo-item-unlock").forEach(el => el.classList.remove("combo-item-unlock"));
  }, 900);

  console.debug("[Combo Items] inventory rendered", {
    currentGameMode,
    inventoryCount: comboInventory.length,
    inventoryLimit: COMBO_INVENTORY_LIMIT,
    items: comboInventory.map(item => ({
      id: item.instanceId,
      type: item.type,
      name: item.name,
      minCombo: item.minCombo
    }))
  });
}

function getComboDropChance(comboLevelValue) {
  // Drops are guaranteed only on every third combo level: x3, x6, x9, ...
  // This keeps items valuable without flooding the inventory.
  return shouldDropComboItemAtLevel(comboLevelValue) ? 1 : 0;
}

function shouldDropComboItemAtLevel(comboLevelValue) {
  return comboLevelValue >= 3 && comboLevelValue % 3 === 0;
}

function rollComboItemDrop(comboLevelValue) {
  if (currentGameMode !== "endless") return;
  if (!shouldDropComboItemAtLevel(comboLevelValue)) {
    console.debug("[Combo Items] No drop: drops occur every 3 combos only.", {
      comboLevelValue,
      nextDropAt: comboLevelValue < 3 ? 3 : comboLevelValue + (3 - (comboLevelValue % 3 || 3))
    });
    return;
  }

  console.groupCollapsed(`[Combo Items] GUARANTEED DROP | combo ${comboLevelValue} | every 3 combos`);
  console.log("Inventory:", `${comboInventory.length}/${COMBO_INVENTORY_LIMIT}`);

  if (comboInventory.length >= COMBO_INVENTORY_LIMIT) {
    console.info("DROP SKIPPED: inventory full.");
    console.groupEnd();
    return;
  }

  const pool = COMBO_ITEM_DEFS.filter(item => item.minCombo <= comboLevelValue);
  const weightedPool = pool.map(item => ({
    ...item,
    adjustedWeight: getAdjustedComboItemWeight(item, comboLevelValue)
  }));

  console.table(weightedPool.map(item => ({
    type: item.type,
    name: item.name,
    minCombo: item.minCombo,
    baseWeight: item.weight,
    adjustedWeight: Number(item.adjustedWeight.toFixed(2))
  })));
  console.debug("[Combo Items] Weight note: Pickaxe is intentionally weighted higher than Bomb.");

  const item = createComboItemInstance(weightedPickComboItem(weightedPool));
  comboInventory.push(item);

  console.info(`[Combo Items] DROPPED: ${item.name}`, item);
  console.groupEnd();

  showToast("ITEM DROP", item.name);
  renderComboItemBar();
  playSound("perfect");
  haptic([18, 32, 18]);
}

function getAdjustedComboItemWeight(item, comboLevelValue) {
  // Any eligible item can drop at any higher combo, including Pickaxe at x32.
  // Higher-tier items gain relative weight as combo rises.
  const overMinimum = Math.max(0, comboLevelValue - item.minCombo);

  if (item.minCombo >= 6) return item.weight * (1 + overMinimum * 0.18);
  if (item.minCombo >= 4) return item.weight * (1 + overMinimum * 0.08);
  return item.weight;
}

function weightedPickComboItem(pool) {
  const totalWeight = pool.reduce((sum, item) => sum + (item.adjustedWeight ?? item.weight), 0);
  let roll = Math.random() * totalWeight;

  for (const item of pool) {
    roll -= (item.adjustedWeight ?? item.weight);
    if (roll <= 0) return item;
  }

  return pool[pool.length - 1];
}

function createComboItemInstance(def) {
  return {
    ...def,
    instanceId: `combo_item_${Date.now()}_${++comboItemInstanceCounter}`,
    justDropped: true,
    rarityLabel: ""
  };
}


function beginComboItemDrag(e) {
  const instanceId = e.currentTarget?.dataset?.itemId;
  const item = comboInventory.find(i => i.instanceId === instanceId);
  if (!item || currentGameMode !== "endless") return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  if (activePointerId !== null || activeComboItemDrag) return;

  e.preventDefault();

  try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}

  activePointerId = e.pointerId;

  const dragEl = e.currentTarget.cloneNode(true);
  dragEl.classList.add("combo-item-dragging");
  document.body.appendChild(dragEl);

  activeComboItemDrag = {
    item,
    sourceEl: e.currentTarget,
    dragEl,
    currentTarget: null,
    pointerType: e.pointerType
  };

  document.body.classList.add("drag-active");
  e.currentTarget.classList.add("combo-item-source-dragging");

  moveComboItemDrag(e);
  window.addEventListener("pointermove", moveComboItemDrag, { passive: false });
  window.addEventListener("pointerup", endComboItemDrag, { once: true, passive: false });
  window.addEventListener("pointercancel", cancelComboItemDrag, { once: true, passive: false });
}

function moveComboItemDrag(e) {
  if (!activeComboItemDrag || e.pointerId !== activePointerId) return;
  e.preventDefault();

  const size = 58;
  activeComboItemDrag.dragEl.style.left = `${e.clientX - size / 2}px`;
  activeComboItemDrag.dragEl.style.top = `${e.clientY - size / 2}px`;

  updateComboItemPreview(e.clientX, e.clientY);
}

function cancelComboItemDrag(e) {
  if (!activeComboItemDrag || e.pointerId !== activePointerId) return;
  e.preventDefault();
  clearItemPreview();
  cleanupComboItemDrag();
}

function endComboItemDrag(e) {
  if (!activeComboItemDrag || e.pointerId !== activePointerId) return;
  e.preventDefault();

  const target = activeComboItemDrag.currentTarget;
  clearItemPreview();

  if (target && canUseComboItemOnTarget(activeComboItemDrag.item, target)) {
    useComboItem(activeComboItemDrag.item, target);
  } else {
    playSound("bad");
    haptic(24);
  }

  cleanupComboItemDrag();
}

function cleanupComboItemDrag() {
  if (activeComboItemDrag?.dragEl) activeComboItemDrag.dragEl.remove();
  activeComboItemDrag?.sourceEl?.classList.remove("combo-item-source-dragging");
  activeComboItemDrag = null;
  activePointerId = null;
  document.body.classList.remove("drag-active");
  window.removeEventListener("pointermove", moveComboItemDrag);
  window.removeEventListener("pointercancel", cancelComboItemDrag);
}

function updateComboItemPreview(clientX, clientY) {
  clearItemPreview();

  const item = activeComboItemDrag?.item;
  if (!item) return;

  const target = getComboItemTarget(item, clientX, clientY);
  activeComboItemDrag.currentTarget = target;

  const valid = target && canUseComboItemOnTarget(item, target);

  if (item.type === "reroll" || item.type === "rerollAll") {
    if (item.type === "rerollAll") {
      if (!target) return;

      document.querySelectorAll(".piece").forEach(pieceEl => {
        const p = pieces.find(piece => String(piece.id) === String(pieceEl.dataset.id));
        if (p && !p.used) pieceEl.classList.add(valid ? "item-preview-piece-valid item-preview-reroll-all" : "item-preview-piece-invalid");
      });
      return;
    }

    if (target?.pieceEl) target.pieceEl.classList.add(valid ? "item-preview-piece-valid" : "item-preview-piece-invalid");
    return;
  }

  if (!target) return;

  const cells = getComboItemAffectedCells(item, target.x, target.y);
  for (const [x, y] of cells) {
    const cell = getCellEl(x, y);
    if (cell) cell.classList.add(valid ? "item-preview-valid" : "item-preview-invalid");
  }
}

function getComboItemTarget(item, clientX, clientY) {
  if (item.type === "reroll" || item.type === "rerollAll") {
    const el = document.elementFromPoint(clientX, clientY)?.closest?.(".piece");

    // Reroll and Reroll All must be dropped on one of the visible available blocks.
    // This prevents accidental use on the board or empty space.
    if (!el || !piecesEl.contains(el)) return null;

    const piece = pieces.find(p => String(p.id) === String(el.dataset.id));
    if (!piece || piece.used) return null;

    if (item.type === "rerollAll") return { allPieces: true, pieceEl: el };
    return { piece, pieceEl: el };
  }

  const rect = gridEl.getBoundingClientRect();
  if (clientX < rect.left || clientY < rect.top || clientX > rect.right || clientY > rect.bottom) return null;

  const step = getCubePx() + getGapPx();
  const x = Math.floor((clientX - rect.left - getGapPx()) / step);
  const y = Math.floor((clientY - rect.top - getGapPx()) / step);

  if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return null;
  return { x, y };
}

function canUseComboItemOnTarget(item, target) {
  if (!item || !target) return false;

  if (item.type === "reroll") {
    return Boolean(target.piece && !target.piece.used);
  }

  if (item.type === "rerollAll") {
    return Boolean(target.allPieces) && pieces.some(piece => !piece.used);
  }

  if (item.type === "prism" || item.type === "diamondPrism") {
    return getComboItemAffectedCells(item, target.x, target.y)
      .some(([x, y]) => Boolean(board[y][x]));
  }

  return getComboItemAffectedCells(item, target.x, target.y)
    .some(([x, y]) => Boolean(board[y][x]));
}

function getComboItemAffectedCells(item, cx, cy) {
  const cells = [];

  if (item.type === "pickaxe") {
    if (inBounds(cx, cy)) cells.push([cx, cy]);
    return cells;
  }

  if (item.type === "bomb3x3") {
    for (let y = cy - 1; y <= cy + 1; y++) {
      for (let x = cx - 1; x <= cx + 1; x++) {
        if (inBounds(x, y)) cells.push([x, y]);
      }
    }
    return cells;
  }

  if (item.type === "cross") {
    for (let x = 0; x < GRID_SIZE; x++) cells.push([x, cy]);
    for (let y = 0; y < GRID_SIZE; y++) {
      if (y !== cy) cells.push([cx, y]);
    }
    return cells;
  }

  if (item.type === "tnt") return getDiamondCells(cx, cy, 2);
  if (item.type === "rocket") return getDiamondCells(cx, cy, 5);
  if (item.type === "prism") return getDiamondCells(cx, cy, 2);
  if (item.type === "diamondPrism") return getDiamondCells(cx, cy, 4);

  return cells;
}

function getDiamondCells(cx, cy, radius) {
  const cells = [];

  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (!inBounds(x, y)) continue;
      if (Math.abs(x - cx) + Math.abs(y - cy) <= radius) cells.push([x, y]);
    }
  }

  return cells;
}

function useComboItem(item, target) {
  lastBoardClearSource = "item";
  if (!item) return;
  clearItemSaveWarningState();
  console.info("[Combo Items] USING ITEM", {
    id: item.instanceId,
    name: item.name,
    type: item.type,
    target
  });

  if (item.type === "reroll") {
    const idx = pieces.findIndex(p => p.id === target.piece.id);
    if (idx >= 0) {
      pieces[idx] = makeRandomPiece(target.piece.id);
      renderPieces();
      showToast("REROLL", "New block ready");
    }
  } else if (item.type === "rerollAll") {
    // Full hand refresh: replace the entire spawn area with 3 brand-new available pieces.
    pieces = Array.from({ length: 3 }, (_, id) => makeRandomPiece(id));
    renderPieces();
    showToast("REROLL ALL", "3 new blocks");
  } else if (item.type === "prism" || item.type === "diamondPrism") {
    const cells = getComboItemAffectedCells(item, target.x, target.y);
    let converted = 0;
    for (const [x, y] of cells) {
      if (board[y][x] && !board[y][x].rainbow) {
        board[y][x].rainbow = true;
        converted++;
      }
    }
    renderBoard();
    showToast(item.name.toUpperCase(), `${converted} blocks converted`);
  } else {
    const cells = getComboItemAffectedCells(item, target.x, target.y);
    const removed = removeCellsByItem(cells);
    animateShatter(new Set(cells.map(([x,y]) => `${x},${y}`)));
    renderBoard();
    showToast(item.name.toUpperCase(), `${removed} blocks removed`);
  }

  consumeComboItem(item.instanceId);
  updateItemStats(item);
  renderComboItemBar();
  playSound("clear");
  haptic([18, 28, 18]);
  afterComboItemUse();
}

function consumeComboItem(instanceId) {
  comboInventory = comboInventory.filter(item => item.instanceId !== instanceId);
}

function removeCellsByItem(cells) {
  let removed = 0;

  for (const [x, y] of cells) {
    const block = board[y][x];
    if (!block) continue;

    // Steel frames absorb one hit.
    if (block.type === "steel" && block.steelFrame) {
      block.steelFrame = false;
      block.type = "normal";
      removed++;
      continue;
    }

    board[y][x] = null;
    removed++;
  }

  return removed;
}

function updateItemStats(item) {
  stats.comboItemsUsed = (stats.comboItemsUsed || 0) + 1;
  const key = `${item.type}ItemsUsed`;
  stats[key] = (stats[key] || 0) + 1;
  saveStats();
}


function isBoardActuallyEmpty() {
  if (typeof isBoardEmpty === "function") return isBoardEmpty();
  return board.every(row => row.every(cell => !cell));
}

function afterComboItemUse() {
  updateHud();
  renderPieces();
  if (anyRemainingPieceCanFit() || pieces.every(p => p.used)) clearItemSaveWarningState();

  if (isBoardActuallyEmpty() && lastBoardClearSource === "placement") {
    console.log("[Board Clear] Legitimate board clear awarded.");
    handleBoardClear();
  }

  setTimeout(() => {
    if (pieces.every(p => p.used)) {
      generatePieces();
    } else if (!anyRemainingPieceCanFit()) {
      triggerEndlessGameOverIfNoItemCanSave("No remaining piece fits after using an item.");
    }
  }, 150);
}


function hasAnyBoardBlock() {
  return board.some(row => row.some(Boolean));
}

function getGameSavingComboItems() {
  if (currentGameMode !== "endless") return [];

  return comboInventory.filter(item => {
    if (!item) return false;

    if (item.type === "reroll" || item.type === "rerollAll") {
      return pieces.some(piece => !piece.used);
    }

    if (
      item.type === "pickaxe" ||
      item.type === "bomb3x3" ||
      item.type === "cross" ||
      item.type === "tnt" ||
      item.type === "rocket"
    ) {
      return hasAnyBoardBlock();
    }

    // Prism items convert color but do not remove/reroll, so they should not prevent game over.
    return false;
  });
}


function setItemSaveWarningState(active) {
  document.body.classList.toggle("item-save-warning", Boolean(active));
  console.debug("[Combo Items] item-save-warning border state:", Boolean(active));
}

function clearItemSaveWarningState() {
  setItemSaveWarningState(false);
}

function shouldDelayEndlessGameOverForComboItem(reason = "No pieces fit.") {
  const savingItems = getGameSavingComboItems();

  if (!savingItems.length) return false;

  const now = Date.now();
  const itemNames = savingItems.map(item => item.name).join(", ");

  console.info("[Combo Items] Game over delayed because a usable item may save the run.", {
    reason,
    availableItems: savingItems.map(item => ({
      id: item.instanceId,
      name: item.name,
      type: item.type,
      minCombo: item.minCombo
    })),
    unusedPieces: pieces.filter(piece => !piece.used).map(piece => ({
      id: piece.id,
      name: piece.name
    })),
    boardBlocks: board.flat().filter(Boolean).length
  });

  setItemSaveWarningState(true);

  if (now - lastComboItemGameOverWarningAt > 1600) {
    console.info("[Combo Items] ITEM AVAILABLE:", `${itemNames} can save the run`);
    lastComboItemGameOverWarningAt = now;
  }

  return true;
}

function triggerEndlessGameOverIfNoItemCanSave(reason = "No pieces fit.") {
  if (shouldDelayEndlessGameOverForComboItem(reason)) return false;

  clearItemSaveWarningState();
  gameOver();
  return true;
}

function clearItemPreview() {
  document.querySelectorAll(".item-preview-valid, .item-preview-invalid")
    .forEach(c => c.classList.remove("item-preview-valid", "item-preview-invalid"));

  document.querySelectorAll(".item-preview-piece-valid, .item-preview-piece-invalid")
    .forEach(c => c.classList.remove("item-preview-piece-valid", "item-preview-piece-invalid"));
}

function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE;
}


function renderPieces() {
  piecesEl.innerHTML = "";
  for (const piece of pieces) {
    const dims = getDims(piece.cells);
    const el = document.createElement("div");
    el.className = "piece" + (piece.used ? " used" : "") + (piece.rainbow ? " rainbow-piece" : "");
    el.dataset.id = piece.id;
    el.title = `${piece.name} — Complexity ${piece.complexity}/5`;
    el.style.gridTemplateColumns = `repeat(${dims.w}, var(--cube))`;
    el.style.gridTemplateRows = `repeat(${dims.h}, var(--cube))`;

    for (let y = 0; y < dims.h; y++) {
      for (let x = 0; x < dims.w; x++) {
        const exists = piece.cells.some(([cx, cy]) => cx === x && cy === y);
        const c = document.createElement("div");
        c.className = exists ? "mini-cell filled" : "empty-mini";
        if (exists) {
          const cellIndex = piece.cells.findIndex(([cx, cy]) => cx === x && cy === y);
          if (cellIndex === piece.treasureIndex) c.classList.add("treasure");
          if (piece.rainbow) c.classList.add("rainbow");
          c.style.setProperty("--block-color", piece.color);
          c.style.setProperty("--tile-img", `url("img/baseCube${piece.tileTextures?.[cellIndex] ?? piece.texture}.png")`);
        }
        el.appendChild(c);
      }
    }

    el.addEventListener("pointerdown", e => beginDrag(e, piece, el));
    piecesEl.appendChild(el);
  }

  renderComboItemBar();
}

function beginDrag(e, piece, sourceEl) {
  if (piece.used) return;

  // Mouse must use left button. Touch/stylus generally report button as 0 or -1.
  if (e.pointerType === "mouse" && e.button !== 0) return;

  // Prevent multi-touch or second mouse interactions from fighting the active drag.
  if (activePointerId !== null) return;
  activePointerId = e.pointerId;

  e.preventDefault();

  try {
    sourceEl.setPointerCapture(e.pointerId);
  } catch {}

  const dims = getDims(piece.cells);
  const step = getCubePx() + getGapPx();
  const isTouchLike = e.pointerType === "touch" || e.pointerType === "pen";

  dragging = {
    piece,
    sourceEl,
    dragEl: sourceEl.cloneNode(true),
    dims,
    visualW: dims.w * step - getGapPx(),
    visualH: dims.h * step - getGapPx(),
    pointerType: e.pointerType,
    touchLift: isTouchLike ? Math.max(getCubePx() * 1.35, 54) : 0,
    currentDrop: null
  };

  dragging.dragEl.classList.add("dragging");
  document.body.appendChild(dragging.dragEl);
  document.body.classList.add("drag-active");
  sourceEl.style.visibility = "hidden";

  moveDrag(e);

  window.addEventListener("pointermove", moveDrag, { passive: false });
  window.addEventListener("pointerup", endDrag, { once: true, passive: false });
  window.addEventListener("pointercancel", cancelDrag, { once: true, passive: false });
}

function moveDrag(e) {
  if (!dragging || e.pointerId !== activePointerId) return;
  e.preventDefault();

  // Mouse: piece is centered on pointer.
  // Touch/pen: piece is lifted above pointer so the finger does not cover the preview.
  dragging.dragEl.style.left = `${e.clientX - dragging.visualW / 2}px`;
  dragging.dragEl.style.top = `${e.clientY - dragging.visualH / 2 - dragging.touchLift}px`;

  // Preview remains based on the actual pointer position.
  updatePreview(e.clientX, e.clientY);
}

function endDrag(e) {
  if (!dragging || e.pointerId !== activePointerId) return;
  e.preventDefault();

  const drop = dragging.currentDrop;
  clearPreview();

  if (drop && canPlace(dragging.piece, drop.x, drop.y)) {
    haptic(12);
    placePiece(dragging.piece, drop.x, drop.y);
  } else {
    haptic(24);
    playSound("bad");
    dragging.sourceEl.style.visibility = "";
  }

  cleanupDrag();
}

function cancelDrag(e) {
  if (!dragging || e.pointerId !== activePointerId) return;
  e.preventDefault();

  clearPreview();
  dragging.sourceEl.style.visibility = "";
  cleanupDrag();
}

function cleanupDrag() {
  if (dragging?.dragEl) dragging.dragEl.remove();

  document.body.classList.remove("drag-active");
  dragging = null;
  activePointerId = null;

  window.removeEventListener("pointermove", moveDrag);
  window.removeEventListener("pointercancel", cancelDrag);
}

function updatePreview(clientX, clientY) {
  clearPreview();
  if (!options.ghostPreview) return;

  const drop = getSmartDrop(clientX, clientY, dragging.piece);
  dragging.currentDrop = drop;
  if (!drop) return;

  const valid = canPlace(dragging.piece, drop.x, drop.y);
  if (valid && !lastPreviewWasValid) playSound("preview");
  lastPreviewWasValid = valid;

  for (const [dx, dy] of dragging.piece.cells) {
    const cell = getCellEl(drop.x + dx, drop.y + dy);
    if (cell) cell.classList.add(valid ? "preview-valid" : "preview-invalid");
  }

  if (valid) {
    const predicted = getPredictedClearLines(dragging.piece, drop.x, drop.y);
    previewClearLines(predicted);
  }
}

function getSmartDrop(clientX, clientY, piece) {
  const rect = gridEl.getBoundingClientRect();
  const step = getCubePx() + getGapPx();
  const dims = dragging?.dims || getDims(piece.cells);

  const mouseGridX = (clientX - rect.left - getGapPx()) / step;
  const mouseGridY = (clientY - rect.top - getGapPx()) / step;

  let x = Math.round(mouseGridX - dims.w / 2);
  let y = Math.round(mouseGridY - dims.h / 2);

  x = clamp(x, 0, GRID_SIZE - dims.w);
  y = clamp(y, 0, GRID_SIZE - dims.h);

  const margin = step * (dragging?.pointerType === "touch" ? 2.1 : 1.35);
  if (
    clientX < rect.left - margin || clientY < rect.top - margin ||
    clientX > rect.right + margin || clientY > rect.bottom + margin
  ) return null;

  return { x, y };
}


function resetScoreLog() {
  scoreHistory = [];
  scoreSourceTotals = {
    linePoints: 0,
    comboBonus: 0,
    multipliedBase: 0,
    treasureBonus: 0,
    total: 0
  };
  scoreTurnNumber = 0;
}

function calculateScoreBreakdown(clearInfo, comboLevelValue, treasureMultiplier, rainbowBlastMultiplier) {
  const baseLineRaw = clearInfo.lines.length * GRID_SIZE;
  const comboBonus = comboLevelValue * 5;
  const colorMultiplier = clearInfo.colorMatches > 0 ? getUnlockedColorCount() : 1;
  const multiLineMultiplier = clearInfo.lines.length > 1 ? clearInfo.lines.length : 1;
  const additiveBase = baseLineRaw + comboBonus;
  const multiplierProduct = colorMultiplier * multiLineMultiplier * treasureMultiplier * rainbowBlastMultiplier;
  const total = additiveBase * multiplierProduct;

  return {
    turn: ++scoreTurnNumber,
    timestamp: new Date().toISOString(),
    linesCleared: clearInfo.lines.length,
    baseLineRaw,
    colorLinePoints: baseLineRaw,
    colorMultiplier,
    multiLineMultiplier,
    comboBonus,
    comboLevel: comboLevelValue,
    additiveBase,
    treasureCount: clearInfo.treasureCount,
    treasureMultiplier,
    rainbowBlastTier: clearInfo.rainbowBlastTier || 0,
    rainbowBlastLabel: getRainbowBlastLabel(clearInfo.rainbowBlastTier || 0),
    rainbowBlastMultiplier,
    uniqueColorBlastColors: clearInfo.uniqueColorBlastColors || [],
    multiplierProduct,
    multipliedBase: total,
    multipliedCombo: comboBonus * multiplierProduct,
    total,
    formula: `(${baseLineRaw} + ${comboBonus}) × ${colorMultiplier} × ${multiLineMultiplier} × ${treasureMultiplier} × ${rainbowBlastMultiplier} = ${total}`
  };
}

function addScoreFromBreakdown(breakdown) {
  const previousScore = score;
  score += breakdown.total;

  scoreSourceTotals.linePoints += breakdown.colorLinePoints;
  scoreSourceTotals.comboBonus += breakdown.comboBonus;
  scoreSourceTotals.multipliedBase += breakdown.multipliedBase;
  scoreSourceTotals.treasureBonus += breakdown.treasureMultiplier > 1 ? breakdown.total - ((breakdown.additiveBase || (breakdown.colorLinePoints + breakdown.comboBonus)) * breakdown.colorMultiplier * breakdown.multiLineMultiplier * breakdown.rainbowBlastMultiplier) : 0;
  scoreSourceTotals.total += breakdown.total;

  breakdown.previousScore = previousScore;
  breakdown.newScore = score;

  scoreHistory.unshift(breakdown);
  scoreHistory = scoreHistory.slice(0, 40);

  consoleLogScoreBreakdown(breakdown);

  try {
    localStorage.setItem("chromablockBlaster.scoreDiagnostics", JSON.stringify({
      scoreSourceTotals,
      recentScoreHistory: scoreHistory.slice(0, 20)
    }));
  } catch {}

  return breakdown.total;
}

function consoleLogScoreBreakdown(b) {
  const colorNames = (b.uniqueColorBlastColors || []).map(formatColorForLog).join(", ") || "None";
  const rainbowText = b.rainbowBlastLabel ? `${b.rainbowBlastLabel} ×${b.rainbowBlastMultiplier}` : "None";

  console.groupCollapsed(`%cSCORE EVENT +${b.total} | ${b.formula}`, "color:#ffe66b;font-weight:bold;");
  console.log("Turn:", b.turn);
  console.log("Lines cleared:", b.linesCleared);
  console.log("Unique color blast colors:", colorNames);
  console.log("Rainbow reward:", rainbowText);
  console.log("Base line raw:", `${b.linesCleared} lines × ${GRID_SIZE} = ${b.baseLineRaw}`);
  console.log("Combo bonus:", `combo ${b.comboLevel} × 5 = ${b.comboBonus}`);
  console.log("Additive base:", `${b.baseLineRaw} + ${b.comboBonus} = ${b.additiveBase}`);
  console.log("Multipliers:", `Color ×${b.colorMultiplier} | Multi-line ×${b.multiLineMultiplier} | Treasure ×${b.treasureMultiplier} | Rainbow ×${b.rainbowBlastMultiplier}`);
  console.log("Formula:", `(${b.baseLineRaw} + ${b.comboBonus}) × ${b.colorMultiplier} × ${b.multiLineMultiplier} × ${b.treasureMultiplier} × ${b.rainbowBlastMultiplier} = ${b.total}`);
  console.log("Score:", `${b.previousScore} + ${b.total} = ${b.newScore}`);
  console.table({
    baseLineRaw: b.baseLineRaw,
    comboBonus: b.comboBonus,
    additiveBase: b.additiveBase,
    colorMultiplier: b.colorMultiplier,
    multiLineMultiplier: b.multiLineMultiplier,
    treasureMultiplier: b.treasureMultiplier,
    rainbowBlastMultiplier: b.rainbowBlastMultiplier,
    total: b.total
  });
  console.groupEnd();
}

function formatColorForLog(color) {
  if (!color) return "None";
  const found = Object.entries(NAMED_COLORS).find(([, value]) => value === color);
  return found ? found[0].toUpperCase() : color;
}






function placePiece(piece, x, y) {
  lastBoardClearSource = "placement";
  clearItemSaveWarningState();

  for (let i = 0; i < piece.cells.length; i++) {
    const [dx, dy] = piece.cells[i];
    const placedX = x + dx;
    const placedY = y + dy;

    board[placedY][placedX] = {
      color: piece.color,
      texture: piece.tileTextures?.[i] ?? piece.texture,
      treasure: i === piece.treasureIndex,
      rainbow: piece.rainbow
    };

    lastPlacedCells.push([placedX, placedY]);
  }

  piece.used = true;

  if (currentGameMode === "adventure") {
    adventureMoveCount++;
    updateAdventureHud();
  }

  stats.piecesPlaced++;
  stats.blocksPlaced += piece.cells.length;
  if (piece.name === "3x3") stats.threeByThreePlaced++;
  if (piece.rainbow) stats.rainbowPiecesPlaced++;
  saveStats();
  renderBoard();
  playSound("place");

  const clearInfo = getActualClearInfo(lastPlacedCells);

  if (clearInfo.cells.size > 0) {
    animateShatter(clearInfo.cells);

    comboLevel++;
    rollComboItemDrop(comboLevel);
    missesSinceLine = 0;

    const treasureMultiplier = 1 + clearInfo.treasureCount;
    const rainbowBlastMultiplier = clearInfo.rainbowBlastMultiplier || 1;
    const scoreBreakdown = calculateScoreBreakdown(clearInfo, comboLevel, treasureMultiplier, rainbowBlastMultiplier);
    const actionValue = addScoreFromBreakdown(scoreBreakdown);

    comboMeter = Math.min(COMBO_METER_MAX, comboMeter + COMBO_CLEAR_GAIN);
    stats.totalLinesCleared += clearInfo.lines.length;
    stats.perfectColorLines += clearInfo.colorMatches;
    stats.treasureTilesPopped += clearInfo.treasureCount;
    if (clearInfo.treasureCount > 0) stats.treasureActions++;
    stats.bestTreasureMultiplier = Math.max(stats.bestTreasureMultiplier || 1, treasureMultiplier);
    stats.highestCombo = Math.max(stats.highestCombo, comboLevel);
    saveStats();

    checkAchievements();
    checkColorUnlock();

    haptic(clearInfo.lines.length >= 2 ? [18, 35, 28] : 18);
    playClearSound(clearInfo);
    notifyClear(clearInfo, treasureMultiplier, actionValue);
    updateHud();
    renderPieces();

    // Important: do NOT check game-over until the cleared cells are actually removed.
    // Otherwise a remaining piece may look impossible before the line clear opens space.
    setTimeout(() => {
      applyClearResult(clearInfo);
      applyRainbowBlastEffect(clearInfo);

      renderBoard();
      renderPieces();

      if (currentGameMode === "adventure") {
        if (checkAdventureComplete()) return;

        if (checkAdventureMoveLimitFailed()) return;

        if (pieces.every(p => p.used)) {
          generatePieces();
        } else if (!anyRemainingPieceCanFit()) {
          adventureFail("No pieces fit.");
        }
        return;
      }

      const boardCleared = isBoardEmpty();
      if (boardCleared) {
        handleBoardClear();
      }

      setTimeout(() => {
        if (pieces.every(p => p.used)) {
          generatePieces();
        } else if (!anyRemainingPieceCanFit()) {
          triggerEndlessGameOverIfNoItemCanSave("No remaining piece fits after line clear.");
        }
      }, boardCleared ? 2500 : 0);
    }, 230);

    return;
  }

  missesSinceLine++;
  comboMeter = Math.max(0, comboMeter - COMBO_MISS_LOSS);
  if (missesSinceLine >= 2 || comboMeter <= 0) {
    comboLevel = 0;
    comboMeter = 0;
    missesSinceLine = 0;
  }

  if (currentGameMode === "adventure") {
    if (checkAdventureComplete()) return;
    if (checkAdventureMoveLimitFailed()) return;

    if (pieces.every(p => p.used)) {
      generatePieces();
    } else if (!anyRemainingPieceCanFit()) {
      adventureFail("No pieces fit.");
    }

    updateHud();
    renderPieces();
    return;
  }

  if (pieces.every(p => p.used)) {
    generatePieces();
  } else if (!anyRemainingPieceCanFit()) {
    triggerEndlessGameOverIfNoItemCanSave("No remaining piece fits after placement.");
  }

  updateHud();
  renderPieces();
}

function playClearSound(clearInfo) {
  if (clearInfo.treasureCount > 0) {
    playSound("perfect");
  }

  if (clearInfo.lines.length >= 3 || (clearInfo.lines.length >= 2 && clearInfo.colorMatches > 0)) {
    playSound("massive");
  } else if (clearInfo.lines.length >= 2) {
    playSound("multiline");
  } else if (clearInfo.colorMatches > 0) {
    playSound("perfect");
  } else {
    playSound(clearInfo.comboLevel > 1 ? "combo" : "clear");
  }

  if (comboLevel > 1) playSound("combo");
}

function getPredictedClearLines(piece, x, y) {
  const temp = board.map(row => row.slice());
  const touchedCells = piece.cells.map(([dx, dy]) => [x + dx, y + dy]);
  for (const [dx, dy] of piece.cells) {
    const idx = piece.cells.findIndex(([cx, cy]) => cx === dx && cy === dy);
    temp[y + dy][x + dx] = {
      color: piece.color,
      texture: piece.tileTextures?.[idx] ?? piece.texture,
      treasure: idx === piece.treasureIndex,
      rainbow: piece.rainbow
    };
  }
  return getClearLinesFromBoard(temp, touchedCells);
}

function getActualClearInfo(touchedCells = null) {
  const lines = getClearLinesFromBoard(board, touchedCells);
  const cells = new Set();
  let points = 0;
  let colorMatches = 0;

  for (const line of lines) {
    const lineBlocks = line.cells.map(([x,y]) => board[y][x]);
    const realColors = lineBlocks.filter(b => b && !b.rainbow).map(b => b.color);
    const sameColor = lineBlocks.length > 0 && (
      realColors.length === 0 || realColors.every(c => c === realColors[0])
    );
    line.sameColor = sameColor;
    line.matchColor = realColors[0] || null;
    if (sameColor) colorMatches++;

    // Base scoring is always 9 per cleared line.
    // Color/multiline/treasure/rainbow are applied later as external multipliers.
    points += GRID_SIZE;

    for (const [x,y] of line.cells) cells.add(`${x},${y}`);
  }

  let treasureCount = 0;
  for (const key of cells) {
    const [x, y] = key.split(",").map(Number);
    if (board[y][x]?.treasure) treasureCount++;
  }

  const uniqueColorBlastColors = [...new Set(
    lines
      .filter(line => line.sameColor && line.matchColor)
      .map(line => line.matchColor)
  )];

  const rainbowBlastTier = uniqueColorBlastColors.length;
  const rainbowBlastMultiplier =
    rainbowBlastTier >= 4 ? 8 :
    rainbowBlastTier === 3 ? 4 :
    rainbowBlastTier === 2 ? 2 :
    1;

  return {
    lines,
    cells,
    points,
    colorMatches,
    treasureCount,
    uniqueColorBlastColors,
    rainbowBlastTier,
    rainbowBlastMultiplier
  };
}

function getClearLinesFromBoard(b, touchedCells = null) {
  const lines = [];

  const touchedRows = new Set();
  const touchedCols = new Set();

  if (Array.isArray(touchedCells) && touchedCells.length) {
    for (const [x, y] of touchedCells) {
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        touchedRows.add(y);
        touchedCols.add(x);
      }
    }
  } else {
    for (let i = 0; i < GRID_SIZE; i++) {
      touchedRows.add(i);
      touchedCols.add(i);
    }
  }

  for (const y of touchedRows) {
    if (b[y].every(Boolean)) {
      lines.push({ type: "row", index: y, cells: Array.from({length: GRID_SIZE}, (_,x) => [x,y]) });
    }
  }

  for (const x of touchedCols) {
    const full = Array.from({length: GRID_SIZE}, (_,y) => b[y][x]).every(Boolean);
    if (full) {
      lines.push({ type: "col", index: x, cells: Array.from({length: GRID_SIZE}, (_,y) => [x,y]) });
    }
  }

  return lines;
}

function previewClearLines(lines) {
  for (const line of lines) {
    for (const [x,y] of line.cells) {
      getCellEl(x,y)?.classList.add("preview-clear");
    }
  }
}

function notifyClear(info, treasureMultiplier = 1, actionValue = 0) {
  const multipliers = [];

  const rainbowLabel = getRainbowBlastLabel(info.rainbowBlastTier || 0);
  const uniqueColors = info.uniqueColorBlastColors || [];

  let main;
  let toastClass = "";
  let toastColor = "";

  if ((info.rainbowBlastTier || 0) >= 2) {
    main = rainbowLabel;
    toastClass = "toast-rainbow-text";
  } else if (info.colorMatches > 0) {
    main = "COLOR BLAST";
    toastClass = "toast-color-text";
    toastColor = uniqueColors[0] || "";
  } else if (info.lines.length >= 3) {
    main = `${info.lines.length} LINE MEGA BLAST`;
  } else if (info.lines.length === 2) {
    main = "DOUBLE BLAST";
  } else {
    main = "LINE BLAST";
  }

  if (info.colorMatches > 0) multipliers.push(`COLOR x${getUnlockedColorCount()}`);
  if (info.lines.length > 1) multipliers.push(`MULTI x${info.lines.length}`);
  if ((info.rainbowBlastMultiplier || 1) > 1) multipliers.push(`RAINBOW x${info.rainbowBlastMultiplier}`);
  if (treasureMultiplier > 1) multipliers.push(`TREASURE x${treasureMultiplier}`);
  if (comboLevel > 1) multipliers.push(`COMBO x${comboLevel}`);

  showToast(main, multipliers.join(" • "), { className: toastClass, color: toastColor });
}

function showToast(main, sub = "", options = {}) {
  const layer = document.getElementById("toastLayer");
  layer?.querySelectorAll(".toast").forEach(existing => existing.remove());
  const el = document.createElement("div");
  el.className = `toast ${options.className || ""}`.trim();

  if (options.color) {
    el.style.setProperty("--toast-action-color", options.color);
  }

  el.innerHTML = `${main}${sub ? `<small>${sub}</small>` : ""}`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function animateShatter(cellSet) {
  const cube = getCubePx();
  const gap = getGapPx();
  const step = cube + gap;

  for (const key of cellSet) {
    const [x, y] = key.split(",").map(Number);
    const block = board[y][x];
    const color = block?.color || "#ffffff";
    const texture = block?.texture ?? 0;

    for (let i = 0; i < 5; i++) {
      const shard = document.createElement("div");
      shard.className = "shard" + (block?.treasure ? " treasure" : "") + (block?.rainbow ? " rainbow" : "");
      shard.style.left = `${gap + x * step + cube * (0.18 + Math.random() * 0.58)}px`;
      shard.style.top = `${gap + y * step + cube * (0.18 + Math.random() * 0.58)}px`;
      shard.style.setProperty("--block-color", color);
      shard.style.setProperty("--tile-img", `url("img/baseCube${texture}.png")`);
      shard.style.setProperty("--dx", `${-45 + Math.random() * 90}px`);
      shard.style.setProperty("--dy", `${-60 + Math.random() * 100}px`);
      shard.style.setProperty("--rot", `${-240 + Math.random() * 480}deg`);
      fxLayer.appendChild(shard);
      setTimeout(() => shard.remove(), 760);
    }
  }
}

function isBoardEmpty() {
  return board.every(row => row.every(cell => !cell));
}

function handleBoardClear() {
  score += BOARD_CLEAR_BONUS;
  stats.boardClears++;
  saveStats();
  updateHud();
  checkAchievements();

  runBoardClearAnimation();

  showToast("BOARD WIPE", `+${BOARD_CLEAR_BONUS} clean slate bonus`);
  playSound("massive");
  haptic([35, 35, 35, 35, 80]);
  launchConfetti(90);
}

function runBoardClearAnimation() {
  const cells = [...document.querySelectorAll(".cell")];

  const flash = document.createElement("div");
  flash.className = "board-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 850);

  cells.forEach((cell, index) => {
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const hue = Math.floor(((x + y * GRID_SIZE) / (GRID_SIZE * GRID_SIZE)) * 360);
    const texture = randTextureIndex();

    cell.style.setProperty("--rainbow-hue", hue);
    cell.style.setProperty("--tile-img", `url("img/baseCube${texture}.png")`);

    setTimeout(() => {
      cell.classList.add("board-wipe-fill", "board-wipe-rainbow");
    }, index * 8);
  });

  // Three rainbow charge loops before detonation.
  setTimeout(() => {
    cells.forEach(cell => cell.classList.add("board-wipe-detonate"));
  }, 1650);

  // Let the explosion linger for half a second.
  setTimeout(() => {
    cells.forEach(cell => {
      cell.classList.remove("board-wipe-fill", "board-wipe-rainbow", "board-wipe-detonate");
      cell.style.removeProperty("--rainbow-hue");
      cell.style.removeProperty("--tile-img");
    });
    renderBoard();
  }, 2475);
}


function getRainbowBlastLabel(tier) {
  if (tier >= 4) return "SPECTRUM MANIA!";
  if (tier === 3) return "TRIPLE RAINBOW";
  if (tier === 2) return "RAINBOW BLAST";
  if (tier === 1) return "COLOR BLAST";
  return null;
}

function applyRainbowBlastEffect(clearInfo) {
  const tier = clearInfo?.rainbowBlastTier || 0;
  if (tier < 2) return;

  if (tier >= 4) {
    convertEntireBoardAndPiecesToRainbow();
    return;
  }

  convertBoardCellsNearClearedCellsToRainbow(clearInfo.cells, tier === 3 ? 3 : 1);
}

function convertEntireBoardAndPiecesToRainbow() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (board[y][x]) board[y][x].rainbow = true;
    }
  }

  for (const piece of pieces) {
    if (!piece.used) piece.rainbow = true;
  }
}

function convertBoardCellsNearClearedCellsToRainbow(clearedCellKeys, maxDepth) {
  const visited = new Set();
  const queue = [];

  for (const key of clearedCellKeys) {
    const [x, y] = key.split(",").map(Number);
    queue.push({ x, y, depth: 0 });
    visited.add(`${x},${y}`);
  }

  while (queue.length) {
    const current = queue.shift();
    if (current.depth >= maxDepth) continue;

    const neighbors = [
      [current.x + 1, current.y],
      [current.x - 1, current.y],
      [current.x, current.y + 1],
      [current.x, current.y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;

      const nKey = `${nx},${ny}`;
      if (visited.has(nKey)) continue;
      visited.add(nKey);

      if (board[ny][nx]) board[ny][nx].rainbow = true;
      queue.push({ x: nx, y: ny, depth: current.depth + 1 });
    }
  }
}

function applyClearResult(clearInfo) {
  const cellMeta = new Map();

  for (const line of clearInfo.lines) {
    for (const [x, y] of line.cells) {
      const key = `${x},${y}`;
      const existing = cellMeta.get(key) || { perfect: false, colors: [] };
      if (line.sameColor) existing.perfect = true;
      if (line.matchColor) existing.colors.push(line.matchColor);
      cellMeta.set(key, existing);
    }
  }

  for (const key of clearInfo.cells) {
    const [x, y] = key.split(",").map(Number);
    const block = board[y][x];
    if (!block) continue;

    const meta = cellMeta.get(key) || { perfect: false, colors: [] };

    if (block.type === "steel" && block.steelFrame) {
      block.steelFrame = false;
      block.type = "normal";
      block.objective = Boolean(block.objective);
      continue;
    }

    if (block.type === "colorLocked") {
      const matchesColor = meta.colors.some(c => c === block.color);
      if (!meta.perfect || !matchesColor) continue;
    }

    board[y][x] = null;
  }
}

async function loadAdventureLevels() {
  console.log("[Adventure] Initializing level loader...");
  console.log("[Adventure] Current URL:", window.location.href);
  console.log("[Adventure] Protocol:", window.location.protocol);

  if (window.location.protocol === "file:") {
    console.warn("[Adventure] Running from file://. Browser fetch for JSON files is often blocked. Using embedded fallback levels.");
    adventureLevels = getEmbeddedAdventureLevels();
    console.log(`[Adventure] Embedded fallback loaded: ${adventureLevels.length} level(s).`, adventureLevels);
    return;
  }

  try {
    console.log("[Adventure] Fetching levels/manifest.json...");
    const manifestResponse = await fetch("levels/manifest.json", { cache: "no-store" });

    console.log("[Adventure] Manifest response:", {
      ok: manifestResponse.ok,
      status: manifestResponse.status,
      statusText: manifestResponse.statusText,
      url: manifestResponse.url
    });

    if (!manifestResponse.ok) {
      throw new Error(`Manifest fetch failed: ${manifestResponse.status} ${manifestResponse.statusText}`);
    }

    const manifest = await manifestResponse.json();
    console.log("[Adventure] Manifest data:", manifest);

    if (!Array.isArray(manifest)) {
      throw new Error("Manifest is not an array.");
    }

    const loaded = [];

    for (const entry of manifest) {
      console.log("[Adventure] Loading level entry:", entry);

      if (!entry?.id) {
        console.warn("[Adventure] Skipping invalid manifest entry:", entry);
        continue;
      }

      const levelUrl = `levels/${entry.id}.json`;
      console.log(`[Adventure] Fetching ${levelUrl}...`);

      const levelResponse = await fetch(levelUrl, { cache: "no-store" });

      console.log(`[Adventure] Level response for ${entry.id}:`, {
        ok: levelResponse.ok,
        status: levelResponse.status,
        statusText: levelResponse.statusText,
        url: levelResponse.url
      });

      if (!levelResponse.ok) {
        console.warn(`[Adventure] Failed to load level ${entry.id}. Skipping.`);
        continue;
      }

      const level = await levelResponse.json();
      console.log("[Adventure] Loaded level JSON:", level);

      if (!level.id || !Array.isArray(level.startingBlocks)) {
        console.warn("[Adventure] Level missing required fields. Skipping:", level);
        continue;
      }

      loaded.push(level);
    }

    if (!loaded.length) {
      throw new Error("No valid levels loaded from JSON.");
    }

    adventureLevels = loaded;
    console.log(`[Adventure] Successfully loaded ${adventureLevels.length} JSON level(s).`, adventureLevels);
  } catch (err) {
    console.error("[Adventure] Level JSON loading failed. Using embedded fallback levels.", err);
    adventureLevels = getEmbeddedAdventureLevels();
    console.log(`[Adventure] Embedded fallback loaded after error: ${adventureLevels.length} level(s).`, adventureLevels);
  }
}

function getEmbeddedAdventureLevels() {
  console.log("[Adventure] getEmbeddedAdventureLevels() called.");
  return [
  {
    "id": "level-introduction-01",
    "legacyId": "level001",
    "number": 1,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 1,
    "name": "Fill the Gap",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 3,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "2x1",
        "color": "red"
      },
      {
        "shape": "1x2",
        "color": "red"
      }
    ],
    "hint": "Place the 1x1 red block in the single gap.",
    "globalIndex": 1,
    "requiredLevel": null
  },
  {
    "id": "level-introduction-02",
    "legacyId": "level002",
    "number": 2,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 2,
    "name": "Two Gaps",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 4,
    "stars": {
      "three": 2,
      "two": 3,
      "one": 4
    },
    "availableColors": [
      "red"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 4,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "2x1",
        "color": "red"
      }
    ],
    "hint": "Fill both gaps with 1x1 blocks.",
    "globalIndex": 2,
    "requiredLevel": "level-introduction-01"
  },
  {
    "id": "level-introduction-03",
    "legacyId": "level003",
    "number": 3,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 3,
    "name": "Move Limit",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 1,
    "stars": {
      "three": 1,
      "two": 1,
      "one": 1
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "2x1",
        "color": "green"
      },
      {
        "shape": "1x2",
        "color": "green"
      }
    ],
    "hint": "Use the exact piece. The move limit is 1.",
    "globalIndex": 3,
    "requiredLevel": "level-introduction-02"
  },
  {
    "id": "level-introduction-04",
    "legacyId": "level004",
    "number": 4,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 4,
    "name": "Steel Lesson",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 3,
    "stars": {
      "three": 2,
      "two": 3,
      "one": 3
    },
    "availableColors": [
      "blue"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "blue"
      },
      {
        "shape": "1x1",
        "color": "blue"
      },
      {
        "shape": "2x1",
        "color": "blue"
      }
    ],
    "hint": "Clear the steel row once to break the frames, then clear it again.",
    "globalIndex": 4,
    "requiredLevel": "level-introduction-03"
  },
  {
    "id": "level-introduction-05",
    "legacyId": "level005",
    "number": 5,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 5,
    "name": "Steel Cross",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 3,
    "stars": {
      "three": 2,
      "two": 3,
      "one": 3
    },
    "availableColors": [
      "blue"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 0,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 1,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 2,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 3,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 5,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 7,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 8,
        "color": "blue",
        "type": "steel",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "blue"
      },
      {
        "shape": "1x1",
        "color": "blue"
      },
      {
        "shape": "2x1",
        "color": "blue"
      }
    ],
    "hint": "The center tile completes both a row and a column.",
    "globalIndex": 5,
    "requiredLevel": "level-introduction-04"
  },
  {
    "id": "level-introduction-06",
    "legacyId": "level006",
    "number": 6,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 6,
    "name": "First Color Lock",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 2,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 2
    },
    "availableColors": [
      "red"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "red",
        "type": "colorLocked",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "2x1",
        "color": "red"
      },
      {
        "shape": "1x2",
        "color": "red"
      }
    ],
    "hint": "A color-locked block needs a perfect matching color line.",
    "globalIndex": 6,
    "requiredLevel": "level-introduction-05"
  },
  {
    "id": "level-introduction-07",
    "legacyId": "level007",
    "number": 7,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 7,
    "name": "Wrong Color Trap",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 2,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 2
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "red",
        "type": "colorLocked",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "red",
        "type": "normal",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "green"
      },
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "2x1",
        "color": "green"
      }
    ],
    "hint": "The green block clears the line, but not the red color lock. Use red.",
    "globalIndex": 7,
    "requiredLevel": "level-introduction-06"
  },
  {
    "id": "level-introduction-08",
    "legacyId": "level008",
    "number": 8,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 8,
    "name": "Steel and Color",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 3,
    "stars": {
      "three": 2,
      "two": 3,
      "one": 3
    },
    "availableColors": [
      "red"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      },
      {
        "x": 1,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      },
      {
        "x": 2,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      },
      {
        "x": 3,
        "y": 4,
        "color": "red",
        "type": "colorLocked",
        "objective": true
      },
      {
        "x": 5,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      },
      {
        "x": 6,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      },
      {
        "x": 7,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      },
      {
        "x": 8,
        "y": 4,
        "color": "red",
        "type": "steel",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "2x1",
        "color": "red"
      },
      {
        "shape": "1x2",
        "color": "red"
      }
    ],
    "hint": "First clear breaks steel and removes the color lock. Then refill the two gaps.",
    "globalIndex": 8,
    "requiredLevel": "level-introduction-07"
  },
  {
    "id": "level-introduction-09",
    "legacyId": "level009",
    "number": 9,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 9,
    "name": "Dual Objective",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 4,
    "stars": {
      "three": 2,
      "two": 3,
      "one": 4
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 3,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 3,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 0,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 3,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 5,
        "color": "green",
        "type": "normal",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "1x1",
        "color": "green"
      },
      {
        "shape": "2x1",
        "color": "red"
      }
    ],
    "hint": "Complete the red row and the green row.",
    "globalIndex": 9,
    "requiredLevel": "level-introduction-08"
  },
  {
    "id": "level-introduction-10",
    "legacyId": "level010",
    "number": 10,
    "category": "Introduction",
    "categorySlug": "introduction",
    "categoryIndex": 10,
    "name": "The Gatekeeper",
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": 5,
    "stars": {
      "three": 3,
      "two": 4,
      "one": 5
    },
    "availableColors": [
      "red",
      "blue"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [
      {
        "x": 0,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 1,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 2,
        "y": 2,
        "color": "red",
        "type": "colorLocked",
        "objective": true
      },
      {
        "x": 3,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 5,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 6,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 7,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 8,
        "y": 2,
        "color": "red",
        "type": "normal",
        "objective": true
      },
      {
        "x": 0,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 1,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 2,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 3,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 5,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 6,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 7,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 8,
        "y": 6,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 0,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 1,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 2,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 3,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 4,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 5,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 7,
        "color": "blue",
        "type": "steel",
        "objective": true
      },
      {
        "x": 4,
        "y": 8,
        "color": "blue",
        "type": "steel",
        "objective": true
      }
    ],
    "pieceQueue": [
      {
        "shape": "1x1",
        "color": "red"
      },
      {
        "shape": "1x1",
        "color": "blue"
      },
      {
        "shape": "1x1",
        "color": "blue"
      },
      {
        "shape": "2x1",
        "color": "red"
      },
      {
        "shape": "1x2",
        "color": "blue"
      }
    ],
    "hint": "Clear the red color lock, then clear the steel cross twice.",
    "globalIndex": 10,
    "requiredLevel": "level-introduction-09"
  },
  {
    "id": "level-beginner-01",
    "globalIndex": 11,
    "number": 11,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 1,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-introduction-10"
  },
  {
    "id": "level-beginner-02",
    "globalIndex": 12,
    "number": 12,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 2,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-01"
  },
  {
    "id": "level-beginner-03",
    "globalIndex": 13,
    "number": 13,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 3,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-02"
  },
  {
    "id": "level-beginner-04",
    "globalIndex": 14,
    "number": 14,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 4,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-03"
  },
  {
    "id": "level-beginner-05",
    "globalIndex": 15,
    "number": 15,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 5,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-04"
  },
  {
    "id": "level-beginner-06",
    "globalIndex": 16,
    "number": 16,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 6,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-05"
  },
  {
    "id": "level-beginner-07",
    "globalIndex": 17,
    "number": 17,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 7,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-06"
  },
  {
    "id": "level-beginner-08",
    "globalIndex": 18,
    "number": 18,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 8,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-07"
  },
  {
    "id": "level-beginner-09",
    "globalIndex": 19,
    "number": 19,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 9,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-08"
  },
  {
    "id": "level-beginner-10",
    "globalIndex": 20,
    "number": 20,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 10,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-09"
  },
  {
    "id": "level-beginner-11",
    "globalIndex": 21,
    "number": 21,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 11,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-10"
  },
  {
    "id": "level-beginner-12",
    "globalIndex": 22,
    "number": 22,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 12,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-11"
  },
  {
    "id": "level-beginner-13",
    "globalIndex": 23,
    "number": 23,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 13,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-12"
  },
  {
    "id": "level-beginner-14",
    "globalIndex": 24,
    "number": 24,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 14,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-13"
  },
  {
    "id": "level-beginner-15",
    "globalIndex": 25,
    "number": 25,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 15,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-14"
  },
  {
    "id": "level-beginner-16",
    "globalIndex": 26,
    "number": 26,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 16,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-15"
  },
  {
    "id": "level-beginner-17",
    "globalIndex": 27,
    "number": 27,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 17,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-16"
  },
  {
    "id": "level-beginner-18",
    "globalIndex": 28,
    "number": 28,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 18,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-17"
  },
  {
    "id": "level-beginner-19",
    "globalIndex": 29,
    "number": 29,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 19,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-18"
  },
  {
    "id": "level-beginner-20",
    "globalIndex": 30,
    "number": 30,
    "category": "Beginner",
    "categorySlug": "beginner",
    "categoryIndex": 20,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-19"
  },
  {
    "id": "level-steelworks-01",
    "globalIndex": 31,
    "number": 31,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 1,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-beginner-20"
  },
  {
    "id": "level-steelworks-02",
    "globalIndex": 32,
    "number": 32,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 2,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-01"
  },
  {
    "id": "level-steelworks-03",
    "globalIndex": 33,
    "number": 33,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 3,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-02"
  },
  {
    "id": "level-steelworks-04",
    "globalIndex": 34,
    "number": 34,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 4,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-03"
  },
  {
    "id": "level-steelworks-05",
    "globalIndex": 35,
    "number": 35,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 5,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-04"
  },
  {
    "id": "level-steelworks-06",
    "globalIndex": 36,
    "number": 36,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 6,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-05"
  },
  {
    "id": "level-steelworks-07",
    "globalIndex": 37,
    "number": 37,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 7,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-06"
  },
  {
    "id": "level-steelworks-08",
    "globalIndex": 38,
    "number": 38,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 8,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-07"
  },
  {
    "id": "level-steelworks-09",
    "globalIndex": 39,
    "number": 39,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 9,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-08"
  },
  {
    "id": "level-steelworks-10",
    "globalIndex": 40,
    "number": 40,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 10,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-09"
  },
  {
    "id": "level-steelworks-11",
    "globalIndex": 41,
    "number": 41,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 11,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-10"
  },
  {
    "id": "level-steelworks-12",
    "globalIndex": 42,
    "number": 42,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 12,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-11"
  },
  {
    "id": "level-steelworks-13",
    "globalIndex": 43,
    "number": 43,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 13,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-12"
  },
  {
    "id": "level-steelworks-14",
    "globalIndex": 44,
    "number": 44,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 14,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-13"
  },
  {
    "id": "level-steelworks-15",
    "globalIndex": 45,
    "number": 45,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 15,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-14"
  },
  {
    "id": "level-steelworks-16",
    "globalIndex": 46,
    "number": 46,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 16,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-15"
  },
  {
    "id": "level-steelworks-17",
    "globalIndex": 47,
    "number": 47,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 17,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-16"
  },
  {
    "id": "level-steelworks-18",
    "globalIndex": 48,
    "number": 48,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 18,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-17"
  },
  {
    "id": "level-steelworks-19",
    "globalIndex": 49,
    "number": 49,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 19,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-18"
  },
  {
    "id": "level-steelworks-20",
    "globalIndex": 50,
    "number": 50,
    "category": "Steelworks",
    "categorySlug": "steelworks",
    "categoryIndex": 20,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-19"
  },
  {
    "id": "level-color-locks-01",
    "globalIndex": 51,
    "number": 51,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 1,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-steelworks-20"
  },
  {
    "id": "level-color-locks-02",
    "globalIndex": 52,
    "number": 52,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 2,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-01"
  },
  {
    "id": "level-color-locks-03",
    "globalIndex": 53,
    "number": 53,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 3,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-02"
  },
  {
    "id": "level-color-locks-04",
    "globalIndex": 54,
    "number": 54,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 4,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-03"
  },
  {
    "id": "level-color-locks-05",
    "globalIndex": 55,
    "number": 55,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 5,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-04"
  },
  {
    "id": "level-color-locks-06",
    "globalIndex": 56,
    "number": 56,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 6,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-05"
  },
  {
    "id": "level-color-locks-07",
    "globalIndex": 57,
    "number": 57,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 7,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-06"
  },
  {
    "id": "level-color-locks-08",
    "globalIndex": 58,
    "number": 58,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 8,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-07"
  },
  {
    "id": "level-color-locks-09",
    "globalIndex": 59,
    "number": 59,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 9,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-08"
  },
  {
    "id": "level-color-locks-10",
    "globalIndex": 60,
    "number": 60,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 10,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-09"
  },
  {
    "id": "level-color-locks-11",
    "globalIndex": 61,
    "number": 61,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 11,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-10"
  },
  {
    "id": "level-color-locks-12",
    "globalIndex": 62,
    "number": 62,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 12,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-11"
  },
  {
    "id": "level-color-locks-13",
    "globalIndex": 63,
    "number": 63,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 13,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-12"
  },
  {
    "id": "level-color-locks-14",
    "globalIndex": 64,
    "number": 64,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 14,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-13"
  },
  {
    "id": "level-color-locks-15",
    "globalIndex": 65,
    "number": 65,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 15,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-14"
  },
  {
    "id": "level-color-locks-16",
    "globalIndex": 66,
    "number": 66,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 16,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-15"
  },
  {
    "id": "level-color-locks-17",
    "globalIndex": 67,
    "number": 67,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 17,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-16"
  },
  {
    "id": "level-color-locks-18",
    "globalIndex": 68,
    "number": 68,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 18,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-17"
  },
  {
    "id": "level-color-locks-19",
    "globalIndex": 69,
    "number": 69,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 19,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-18"
  },
  {
    "id": "level-color-locks-20",
    "globalIndex": 70,
    "number": 70,
    "category": "Color Locks",
    "categorySlug": "color-locks",
    "categoryIndex": 20,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-19"
  },
  {
    "id": "level-precision-01",
    "globalIndex": 71,
    "number": 71,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 1,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-color-locks-20"
  },
  {
    "id": "level-precision-02",
    "globalIndex": 72,
    "number": 72,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 2,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-01"
  },
  {
    "id": "level-precision-03",
    "globalIndex": 73,
    "number": 73,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 3,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-02"
  },
  {
    "id": "level-precision-04",
    "globalIndex": 74,
    "number": 74,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 4,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-03"
  },
  {
    "id": "level-precision-05",
    "globalIndex": 75,
    "number": 75,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 5,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-04"
  },
  {
    "id": "level-precision-06",
    "globalIndex": 76,
    "number": 76,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 6,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-05"
  },
  {
    "id": "level-precision-07",
    "globalIndex": 77,
    "number": 77,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 7,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-06"
  },
  {
    "id": "level-precision-08",
    "globalIndex": 78,
    "number": 78,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 8,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-07"
  },
  {
    "id": "level-precision-09",
    "globalIndex": 79,
    "number": 79,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 9,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-08"
  },
  {
    "id": "level-precision-10",
    "globalIndex": 80,
    "number": 80,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 10,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-09"
  },
  {
    "id": "level-precision-11",
    "globalIndex": 81,
    "number": 81,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 11,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-10"
  },
  {
    "id": "level-precision-12",
    "globalIndex": 82,
    "number": 82,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 12,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-11"
  },
  {
    "id": "level-precision-13",
    "globalIndex": 83,
    "number": 83,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 13,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-12"
  },
  {
    "id": "level-precision-14",
    "globalIndex": 84,
    "number": 84,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 14,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-13"
  },
  {
    "id": "level-precision-15",
    "globalIndex": 85,
    "number": 85,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 15,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-14"
  },
  {
    "id": "level-precision-16",
    "globalIndex": 86,
    "number": 86,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 16,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-15"
  },
  {
    "id": "level-precision-17",
    "globalIndex": 87,
    "number": 87,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 17,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-16"
  },
  {
    "id": "level-precision-18",
    "globalIndex": 88,
    "number": 88,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 18,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-17"
  },
  {
    "id": "level-precision-19",
    "globalIndex": 89,
    "number": 89,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 19,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-18"
  },
  {
    "id": "level-precision-20",
    "globalIndex": 90,
    "number": 90,
    "category": "Precision",
    "categorySlug": "precision",
    "categoryIndex": 20,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-19"
  },
  {
    "id": "level-legend-01",
    "globalIndex": 91,
    "number": 91,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 1,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-precision-20"
  },
  {
    "id": "level-legend-02",
    "globalIndex": 92,
    "number": 92,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 2,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-01"
  },
  {
    "id": "level-legend-03",
    "globalIndex": 93,
    "number": 93,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 3,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-02"
  },
  {
    "id": "level-legend-04",
    "globalIndex": 94,
    "number": 94,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 4,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-03"
  },
  {
    "id": "level-legend-05",
    "globalIndex": 95,
    "number": 95,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 5,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-04"
  },
  {
    "id": "level-legend-06",
    "globalIndex": 96,
    "number": 96,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 6,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-05"
  },
  {
    "id": "level-legend-07",
    "globalIndex": 97,
    "number": 97,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 7,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-06"
  },
  {
    "id": "level-legend-08",
    "globalIndex": 98,
    "number": 98,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 8,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-07"
  },
  {
    "id": "level-legend-09",
    "globalIndex": 99,
    "number": 99,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 9,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-08"
  },
  {
    "id": "level-legend-10",
    "globalIndex": 100,
    "number": 100,
    "category": "Legend",
    "categorySlug": "legend",
    "categoryIndex": 10,
    "name": "Coming Soon",
    "template": true,
    "disabled": true,
    "gridSize": 9,
    "objective": {
      "type": "clearObjectiveBlocks"
    },
    "moveLimit": null,
    "stars": {
      "three": 1,
      "two": 2,
      "one": 3
    },
    "availableColors": [
      "red",
      "green"
    ],
    "allowRandomPieces": false,
    "startingBlocks": [],
    "pieceQueue": [],
    "hint": "This level template has not been designed yet.",
    "requiredLevel": "level-legend-09"
  }
];
}

function openLevelSelect() {
  console.log("[Adventure] Opening level select...");
  console.log("[Adventure] Current adventureLevels:", adventureLevels);

  if (!adventureLevels || !adventureLevels.length) {
    console.warn("[Adventure] No levels available at openLevelSelect(). Using embedded fallback now.");
    adventureLevels = getEmbeddedAdventureLevels();
  }

  renderLevelSelect();
  showScreen("levels");
}

function isLevelCompleted(levelId) {
  const progress = loadAdventureProgress();
  return Boolean(progress[levelId]?.completed);
}

function isLevelUnlocked(level) {
  if (!level) return false;
  if (!level.requiredLevel) return true;

  const progress = loadAdventureProgress();

  return Boolean(
    progress[level.requiredLevel]?.completed ||
    (level.legacyRequiredLevel && progress[level.legacyRequiredLevel]?.completed)
  );
}

function renderLevelSelect() {
  console.log("[Adventure] Rendering level select...");
  console.log("[Adventure] Level count:", adventureLevels?.length || 0);

  const list = document.getElementById("levelList");
  console.log("[Adventure] levelList element:", list);

  if (!list) {
    console.error("[Adventure] Cannot render levels. #levelList element was not found.");
    return;
  }

  list.innerHTML = "";

  if (!adventureLevels || !adventureLevels.length) {
    console.warn("[Adventure] renderLevelSelect() had no levels. Injecting fallback.");
    adventureLevels = getEmbeddedAdventureLevels();
  }

  const progress = loadAdventureProgress();
  console.log("[Adventure] Loaded adventure progress:", progress);

  const sorted = [...adventureLevels].sort((a, b) => (a.globalIndex || 0) - (b.globalIndex || 0));
  const byCategory = new Map();

  for (const level of sorted) {
    const key = level.category || "Adventure";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(level);
  }

  for (const [categoryName, levels] of byCategory.entries()) {
    const section = document.createElement("section");
    section.className = "level-category-section";

    const title = document.createElement("h3");
    title.className = "level-category-title";
    title.textContent = categoryName;
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "level-grid";

    for (const level of levels) {
      const p = progress[level.id] || (level.legacyId ? progress[level.legacyId] : {}) || {};
      const unlocked = isLevelUnlocked(level);
      const completed = Boolean(p.completed);
      const disabled = Boolean(level.disabled || level.template);
      const playable = unlocked && !disabled;

      const btn = document.createElement("button");
      btn.className = "level-tile";
      btn.classList.toggle("locked", !unlocked);
      btn.classList.toggle("completed", completed);
      btn.classList.toggle("template", disabled);

      btn.innerHTML = `
        <div class="level-tile-num">${level.categoryIndex || level.globalIndex}</div>
        <div class="level-tile-name">${escapeHtml(level.name || level.id)}</div>
        <div class="level-tile-stars">${completed ? "★".repeat(p.stars || 1) + "☆".repeat(3 - (p.stars || 1)) : (!unlocked ? "🔒" : (disabled ? "…" : "○○○"))}</div>
      `;

      if (playable) {
        btn.addEventListener("click", () => {
          console.log("[Adventure] Level clicked:", level.id);
          startAdventureLevel(level.id);
        });
      } else {
        btn.disabled = true;
        btn.title = !unlocked ? "Complete the previous level to unlock this." : "Template level. Coming soon.";
      }

      grid.appendChild(btn);
    }

    section.appendChild(grid);
    list.appendChild(section);
  }

  console.log("[Adventure] Level select render complete.");
}

function startAdventureLevel(levelId) {
  clearItemSaveWarningState();
  console.info("[Combo Items] Starting Adventure: item bar should be hidden.");
  clearAdventureResultState();
  const level = adventureLevels.find(l => l.id === levelId);
  if (!level) return;

  if (!isLevelUnlocked(level) || level.disabled || level.template) {
    showToast("LOCKED", "Complete previous levels first");
    return;
  }

  currentGameMode = "adventure";
  resetComboItems();
  setTimeout(updateGameNavButton, 0);
  document.body.classList.add("adventure-mode");
  currentAdventureLevel = level;
  adventureMoveCount = 0;
  adventurePieceQueueIndex = 0;

  board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  bgTextures = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => randTextureIndex())
  );

  pieces = [];
  score = 0;
  resetScoreLog();
  comboLevel = 0;
  comboMeter = 0;
  missesSinceLine = 0;
  dragging = null;
  runStartedAt = Date.now();

  updateResponsiveLayout();
  buildGrid();
  placeAdventureStartingBlocks(level);
  generatePieces();
  updateHud();
  updateAdventureHud();
  updateAdventureHintBar();
  document.getElementById("adventureHud")?.classList.remove("hidden");
  showScreen("game");
  startTileGlints();
  startMusic();
}

function placeAdventureStartingBlocks(level) {
  for (const b of level.startingBlocks || []) {
    if (b.x < 0 || b.y < 0 || b.x >= GRID_SIZE || b.y >= GRID_SIZE) continue;
    const color = NAMED_COLORS[b.color] || b.color || "#ffffff";
    board[b.y][b.x] = {
      color,
      texture: randTextureIndex(),
      treasure: false,
      rainbow: Boolean(b.rainbow),
      type: b.type || "normal",
      steelFrame: b.type === "steel",
      objective: b.objective !== false
    };
  }
  renderBoard();
}

function updateAdventureHud() {
  if (currentGameMode !== "adventure" || !currentAdventureLevel) return;

  const nameEl = document.getElementById("adventureLevelName");
  const movesEl = document.getElementById("adventureMoves");
  const limitEl = document.getElementById("adventureMoveLimit");
  const objEl = document.getElementById("adventureObjectives");

  if (nameEl) nameEl.textContent = currentAdventureLevel.name || currentAdventureLevel.id;
  if (movesEl) movesEl.textContent = adventureMoveCount;
  if (limitEl) limitEl.textContent = currentAdventureLevel.moveLimit ? `/${currentAdventureLevel.moveLimit}` : "";
  if (objEl) objEl.textContent = countObjectiveBlocks();
}

function clearAdventureHintBar() {
  const el = document.getElementById("adventureHintText");
  if (el) {
    el.textContent = "";
    el.classList.add("hidden");
  }

  document.body.classList.remove("adventure-mode");
}

function updateAdventureHintBar() {
  const el = document.getElementById("adventureHintText");
  if (!el) return;

  if (currentGameMode === "adventure" && currentAdventureLevel) {
    el.textContent = currentAdventureLevel.hint || currentAdventureLevel.description || "";
    el.classList.remove("hidden");
  } else {
    el.textContent = "";
    el.classList.add("hidden");
  }
}


function countObjectiveBlocks() {
  let count = 0;
  for (const row of board) {
    for (const block of row) {
      if (block?.objective) count++;
    }
  }
  return count;
}

function getNextAdventureLevelId(levelId) {
  const sorted = [...adventureLevels].sort((a, b) => (a.globalIndex || 0) - (b.globalIndex || 0));
  const idx = sorted.findIndex(l => l.id === levelId);
  if (idx < 0) return null;

  const next = sorted[idx + 1];
  if (!next || next.disabled || next.template) return null;
  return next.id;
}


function clearAdventureResultState() {
  pendingAdventureResult = null;
  hideAdventureResultOverlay?.();

  const overlay = document.getElementById("adventureResultOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function showAdventureResultOverlay({ won, stars = 0, moves = 0, message = "", nextLevelId = null }) {
  const overlay = document.getElementById("adventureResultOverlay");
  const title = document.getElementById("adventureResultTitle");
  const starsEl = document.getElementById("adventureResultStars");
  const msg = document.getElementById("adventureResultMessage");
  const nextBtn = document.getElementById("adventureNextBtn");
  const retryBtn = document.getElementById("adventureRetryBtn");

  if (!overlay || !title || !starsEl || !msg) return;

  pendingAdventureResult = { won, stars, moves, nextLevelId };

  title.textContent = won ? "Level Complete" : "Level Failed";
  starsEl.classList.toggle("lost", !won);
  starsEl.textContent = won ? "★".repeat(stars) + "☆".repeat(3 - stars) : "Try Again";
  msg.textContent = message || (won ? `${stars} star${stars === 1 ? "" : "s"} · ${moves} moves` : "No valid moves remain.");

  nextBtn?.classList.toggle("hidden", !won || !nextLevelId);
  retryBtn?.classList.toggle("hidden", won);

  overlay.classList.remove("hidden");

  if (won) {
    launchConfetti(stars >= 3 ? 120 : 65);
    haptic(stars >= 3 ? [25, 35, 25, 35, 70] : [25, 35, 30]);
  } else {
    haptic([35, 80, 35]);
  }
}

function hideAdventureResultOverlay() {
  document.getElementById("adventureResultOverlay")?.classList.add("hidden");
}


function checkAdventureCategoryAchievements() {
  if (!Array.isArray(adventureLevels) || !adventureLevels.length) return;

  const progress = loadAdventureProgress();
  const categories = new Map();

  for (const level of adventureLevels) {
    if (level.disabled || level.template) continue;
    const key = level.categorySlug || (level.category || "adventure").toLowerCase().replace(/\s+/g, "_");
    if (!categories.has(key)) categories.set(key, []);
    categories.get(key).push(level);
  }

  let allCompleted = true;
  let allPerfect = true;

  for (const [key, levels] of categories.entries()) {
    const completed = levels.length > 0 && levels.every(level => progress[level.id]?.completed || (level.legacyId && progress[level.legacyId]?.completed));
    const perfect = levels.length > 0 && levels.every(level => (progress[level.id]?.stars || progress[level.legacyId]?.stars || 0) >= 3);

    if (completed) unlockAchievement(`cat_${key.replace(/-/g, "_")}`);
    if (perfect) unlockAchievement(`cat_${key.replace(/-/g, "_")}_3`);

    allCompleted = allCompleted && completed;
    allPerfect = allPerfect && perfect;
  }

  if (allCompleted) unlockAchievement("all_adventure");
  if (allPerfect) unlockAchievement("all_adventure_3");
}

function checkAdventureComplete() {
  updateAdventureHud();

  if (countObjectiveBlocks() > 0) return false;

  const stars = calculateAdventureStars(currentAdventureLevel, adventureMoveCount);
  saveAdventureResult(currentAdventureLevel.id, adventureMoveCount, stars);
  checkAdventureCategoryAchievements();

  playSound(stars >= 3 ? "massive" : "perfect");

  const nextLevelId = getNextAdventureLevelId(currentAdventureLevel.id);

  setTimeout(() => {
    showAdventureResultOverlay({
      won: true,
      stars,
      moves: adventureMoveCount,
      nextLevelId,
      message: `${stars} star${stars === 1 ? "" : "s"} · ${adventureMoveCount} moves`
    });
  }, 1000);

  return true;
}

function checkAdventureMoveLimitFailed() {
  const limit = currentAdventureLevel?.moveLimit;
  if (!limit || adventureMoveCount < limit) return false;
  if (countObjectiveBlocks() <= 0) return false;

  adventureFail("Move limit reached.");
  return true;
}

function adventureFail(reason = "Level failed.") {
  playSound("bad");

  setTimeout(() => {
    showAdventureResultOverlay({
      won: false,
      message: reason
    });
  }, 1000);
}

function calculateAdventureStars(level, moves) {
  if (!level?.stars) return 1;
  if (moves <= level.stars.three) return 3;
  if (moves <= level.stars.two) return 2;
  return 1;
}

function loadAdventureProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.ADVENTURE) || "{}");
  } catch {
    return {};
  }
}

function saveAdventureResult(levelId, moves, stars) {
  const progress = loadAdventureProgress();
  const old = progress[levelId] || {};
  const bestMoves = old.bestMoves ? Math.min(old.bestMoves, moves) : moves;
  const bestStars = Math.max(old.stars || 0, stars);
  progress[levelId] = {
    completed: true,
    bestMoves,
    stars: bestStars,
    lastMoves: moves,
    completedAt: new Date().toISOString()
  };

  const level = adventureLevels.find(l => l.id === levelId);
  if (level?.legacyId) {
    progress[level.legacyId] = progress[levelId];
  }
  adventureProgress = progress;
  localStorage.setItem(STORAGE.ADVENTURE, JSON.stringify(progress));
}

function startTileGlints() {
  stopTileGlints();

  glintTimer = setInterval(() => {
    if (currentScreenName !== "game") return;

    // Small chance per pulse; each pulse chooses a few candidate tiles.
    if (Math.random() > 0.72) return;

    const normalCandidates = [...document.querySelectorAll(".cell.filled, .mini-cell.filled")]
      .filter(el => !el.querySelector(".tile-glint"));

    // Treasure/rainbow blocks get extra chances so special tiles feel more alive.
    const specialCandidates = normalCandidates.filter(el =>
      el.classList.contains("treasure") || el.classList.contains("rainbow")
    );

    if (!normalCandidates.length) return;

    const glintCount = Math.random() < 0.12 ? 2 : 1;

    for (let i = 0; i < glintCount; i++) {
      const useSpecial = specialCandidates.length && Math.random() < 0.42;
      const pool = useSpecial ? specialCandidates : normalCandidates;
      const target = pool[Math.floor(Math.random() * pool.length)];
      if (target) spawnTileGlint(target);
    }
  }, 360);
}

function stopTileGlints() {
  if (glintTimer) {
    clearInterval(glintTimer);
    glintTimer = null;
  }

  document.querySelectorAll(".tile-glint").forEach(el => el.remove());
}

function spawnTileGlint(target) {
  const glint = document.createElement("div");

  // Keep the diagonal CSS sweep as the main glint because it reads best as moving light.
  // Use image overlays for the other sparkle types.
  const useSweep = Math.random() < 0.7;

  if (useSweep) {
    glint.className = "tile-glint glint-a";
  } else {
    const imageIndex = Math.floor(Math.random() * 5);
    const imageAnimations = ["glint-img-pop", "glint-img-drift", "glint-img-twinkle"];
    const anim = imageAnimations[Math.floor(Math.random() * imageAnimations.length)];

    glint.className = `tile-glint image-glint ${anim}`;
    glint.style.setProperty("--glint-img", `url("img/glint${imageIndex}.png")`);
  }

  target.appendChild(glint);

  setTimeout(() => glint.remove(), 950);
}

function renderBoard() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = getCellEl(x, y);
      const block = board[y][x];

      cell.style.setProperty("--bg-tile-img", `url("img/backgroundCube${bgTextures[y][x]}.png")`);
      cell.classList.toggle("filled", Boolean(block));
      cell.classList.toggle("treasure", Boolean(block?.treasure));
      cell.classList.toggle("rainbow", Boolean(block?.rainbow));
      cell.classList.toggle("steel", Boolean(block?.steelFrame));
      cell.classList.toggle("color-locked", block?.type === "colorLocked");
      cell.classList.toggle("objective", Boolean(block?.objective));

      if (block) {
        cell.style.setProperty("--block-color", block.color);
        cell.style.setProperty("--tile-img", `url("img/baseCube${block.texture}.png")`);
      } else {
        cell.style.removeProperty("--block-color");
        cell.style.removeProperty("--tile-img");
      }
    }
  }
}

function canPlace(piece, x, y) {
  for (const [dx, dy] of piece.cells) {
    const px = x + dx;
    const py = y + dy;
    if (px < 0 || py < 0 || px >= GRID_SIZE || py >= GRID_SIZE) return false;
    if (board[py][px]) return false;
  }
  return true;
}

function anyPieceCanFit() {
  return pieces.some(p => !p.used && pieceCanFit(p));
}

function anyRemainingPieceCanFit() {
  return pieces.filter(p => !p.used).some(pieceCanFit);
}

function pieceCanFit(piece) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (canPlace(piece, x, y)) return true;
    }
  }
  return false;
}


function showEndlessGameOverOverlay() {
  const overlay = document.getElementById("gameOverScreen");
  if (!overlay) return;

  // Keep game screen active so the board remains visible.
  screens.game?.classList.add("active");
  overlay.classList.add("active", "endless-overlay");
  currentScreenName = "game";
}

function hideEndlessGameOverOverlay() {
  const overlay = document.getElementById("gameOverScreen");
  if (!overlay) return;

  overlay.classList.remove("active", "endless-overlay");
}

function gameOver() {
  const oldHighScore = highScore;
  const isNewHighScore = score > oldHighScore;

  highScore = Math.max(highScore, score);
  stats.highScore = Math.max(stats.highScore || 0, highScore);
  saveStats();
  checkAchievements();
  submitLeaderboardScore().then(() => updateGameOverLeaderboardPanel(score));
  localStorage.setItem(STORAGE.HIGH, String(highScore));

  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalHighScore").textContent = highScore;

  const banner = document.getElementById("newHighScoreBanner");
  banner.classList.toggle("hidden", !isNewHighScore);

  const title = document.getElementById("gameOverTitle");
  title.textContent = isNewHighScore ? "Blasted!" : "Game Over";

  const praise = document.getElementById("gameOverPraise");
  praise.textContent = getGameOverPraise(score, isNewHighScore);

  updateHud();
  haptic(isNewHighScore ? [30, 40, 30, 40, 60] : [35, 80, 35]);
  playSound(isNewHighScore ? "massive" : "gameover");
  setTimeout(() => {
    showEndlessGameOverOverlay();
    updateGameOverLeaderboardPanel(score);
    launchConfetti(isNewHighScore ? 90 : 38);
  }, 1000);
}

function checkColorUnlock() {
  const current = getUnlockedColors().length;
  if (current > previousUnlockedColorCount) {
    previousUnlockedColorCount = current;
    showToast("NEW COLOR", `${current} colors unlocked`);
    playSound("perfect");
  }
}


function maybePromptForUsername() {
  const existingName = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
  const seen = localStorage.getItem(USERNAME_SEEN_STORAGE_KEY);

  if (existingName && seen) return;

  const modal = document.getElementById("usernameModal");
  const input = document.getElementById("firstRunUsernameInput");

  if (!modal || !input) return;

  input.value = existingName || "";
  modal.classList.remove("hidden");

  setTimeout(() => input.focus(), 80);
}

function confirmFirstRunUsername() {
  const modal = document.getElementById("usernameModal");
  const input = document.getElementById("firstRunUsernameInput");

  const raw = input?.value || "";
  let savedName;

  if (window.ChromablockLeaderboard?.setPlayerName) {
    savedName = window.ChromablockLeaderboard.setPublicLeaderboardName(raw);
  } else {
    savedName = sanitizePlayerName(raw);
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, savedName);
  }

  localStorage.setItem(USERNAME_SEEN_STORAGE_KEY, "true");

  if (input) input.value = savedName;
  modal?.classList.add("hidden");

  showToast("WELCOME", savedName);
}

function sanitizePlayerName(name) {
  const cleaned = String(name || "")
    .trim()
    .replace(/[^\w\sÅÄÖåäö\\-]/g, "")
    .slice(0, 18);

  return cleaned || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
}

function updateComboMeter() {
  if (currentGameMode !== "adventure") {
    clearAdventureHintBar();
  }
  const fill = document.getElementById("comboMeterFill");
  const text = document.getElementById("comboMeterText");
  const mult = document.getElementById("comboMultiplierText");
  const wrap = document.querySelector(".combo-meter-wrap");
  if (!fill || !text || !mult) return;

  fill.style.width = `${comboMeter || 0}%`;
  mult.textContent = `x${comboLevel || 0}`;

  if (comboLevel >= 10) text.textContent = "Godlike Combo";
  else if (comboLevel >= 5) text.textContent = "Legendary Combo";
  else if (comboLevel >= 3) text.textContent = "Hot Streak";
  else if (comboLevel >= 1) text.textContent = "Combo Active";
  else text.textContent = "Combo Ready";

  if (wrap && comboLevel > 0) {
    wrap.classList.remove("hot");
    void wrap.offsetWidth;
    wrap.classList.add("hot");
  }
}

function loadStats() {
  try {
    return { ...DEFAULT_STATS, ...JSON.parse(localStorage.getItem(STORAGE.STATS) || "{}") };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveStats() {
  localStorage.setItem(STORAGE.STATS, JSON.stringify(stats));
}

function loadAchievements() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.ACHIEVEMENTS) || "[]");
  } catch {
    return [];
  }
}

function saveAchievements() {
  localStorage.setItem(STORAGE.ACHIEVEMENTS, JSON.stringify(unlockedAchievements));
}

function checkAchievements() {
  let unlockedAny = false;

  for (const achievement of ACHIEVEMENTS) {
    if (!achievement || unlockedAchievements.includes(achievement.id)) continue;

    if (typeof achievement.test !== "function") {
      console.warn("[Achievements] Skipping malformed achievement without test():", achievement);
      continue;
    }

    let passed = false;

    try {
      passed = Boolean(achievement.test());
    } catch (err) {
      console.warn("[Achievements] Achievement test failed:", achievement.id, err);
      continue;
    }

    if (!passed) continue;

    unlockedAchievements.push(achievement.id);
    showAchievementToast(achievement);
    unlockedAny = true;
  }

  if (unlockedAny) saveAchievements();
}


function unlockAchievement(id) {
  if (unlockedAchievements.includes(id)) return;

  const achievement =
    ACHIEVEMENTS.find(a => a.id === id) ||
    MANUAL_ACHIEVEMENTS[id] ||
    { id, name: id, desc: "" };

  unlockedAchievements.push(id);
  saveAchievements();
  showAchievementToast(achievement);
}

function showAchievementToast(achievement) {
  const layer = document.getElementById("achievementToastLayer");
  if (!layer) return;

  const el = document.createElement("div");
  el.className = "achievement-toast";
  el.innerHTML = `
    <strong>Achievement Unlocked</strong>
    <span>${achievement.name}</span>
    <small>${achievement.desc}</small>
  `;
  layer.appendChild(el);
  haptic([20, 30, 20]);
  playSound("perfect");
  setTimeout(() => el.remove(), 3300);
}

function getLifetimeRank() {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if ((stats.totalLinesCleared || 0) >= r.lines) rank = r.name;
  }
  return rank;
}

function renderStatsScreen() {
  stats.highScore = Math.max(stats.highScore || 0, highScore || 0);

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  set("lifetimeRank", getLifetimeRank());
  set("statGamesPlayed", stats.gamesPlayed || 0);
  set("statHighScore", stats.highScore || 0);
  set("statHighestCombo", stats.highestCombo || 0);
  set("statTotalLines", stats.totalLinesCleared || 0);
  set("statPerfectLines", stats.perfectColorLines || 0);
  set("statTreasureTiles", stats.treasureTilesPopped || 0);
  set("statRainbowPieces", stats.rainbowPiecesPlaced || 0);
  set("statBestTreasure", `${stats.bestTreasureMultiplier || 1}x`);
  set("statBoardClears", stats.boardClears || 0);
  set("statBlocksPlaced", stats.blocksPlaced || 0);
  set("statPiecesPlaced", stats.piecesPlaced || 0);
  set("stat3x3Placed", stats.threeByThreePlaced || 0);
  set("statAchievements", `${unlockedAchievements.length}/${ACHIEVEMENTS.length}`);

  const list = document.getElementById("achievementList");
  if (!list) return;

  list.innerHTML = "";
  for (const a of ACHIEVEMENTS) {
    const unlocked = unlockedAchievements.includes(a.id);
    const item = document.createElement("div");
    item.className = "achievement-item" + (unlocked ? "" : " locked");
    item.innerHTML = `
      <div class="achievement-icon">${unlocked ? "🏆" : "🔒"}</div>
      <div>
        <strong>${a.name}</strong>
        <small>${a.desc}</small>
      </div>
    `;
    list.appendChild(item);
  }
}


async function updateGameOverLeaderboardPanel(finalScore) {
  const panel = document.getElementById("gameOverLeaderboardPanel");
  const status = document.getElementById("gameOverLeaderboardStatus");
  const signInBtn = document.getElementById("gameOverGoogleSignInBtn");
  const viewBtn = document.getElementById("gameOverViewLeaderboardBtn");

  if (!panel || !status || !window.ChromablockLeaderboard) return;

  const isOnline = await window.ChromablockLeaderboard.isOnlineAvailable?.();
  const user = window.ChromablockLeaderboard.getAuthUser?.();

  if (!isOnline) {
    status.textContent = "Local score saved. Online leaderboard is unavailable.";
    signInBtn?.classList.add("hidden");
    viewBtn?.classList.add("hidden");
    return;
  }

  viewBtn?.classList.remove("hidden");

  if (!user) {
    status.innerHTML = "Local score saved. <strong>Sign in with Google</strong> to upload it if it beats your online high score.";
    signInBtn?.classList.remove("hidden");
    return;
  }

  signInBtn?.classList.add("hidden");

  try {
    status.textContent = "Calculating leaderboard position...";
    const rank = await window.ChromablockLeaderboard.getOnlineRankForScore(finalScore);

    if (rank) {
      const publicName = window.ChromablockLeaderboard.getPublicLeaderboardName?.() || user.displayName;
      status.innerHTML = `Uploaded as <strong>${escapeHtml(publicName)}</strong>. Current leaderboard position: <strong>#${rank}</strong>.`;
    } else {
      const publicName = window.ChromablockLeaderboard.getPublicLeaderboardName?.() || user.displayName;
      status.innerHTML = `Uploaded as <strong>${escapeHtml(publicName)}</strong>. Leaderboard position unavailable.`;
    }
  } catch (err) {
    console.error("Could not calculate leaderboard position:", err);
    const publicName = window.ChromablockLeaderboard.getPublicLeaderboardName?.() || user.displayName;
    status.innerHTML = `Uploaded as <strong>${escapeHtml(publicName)}</strong>. Could not calculate leaderboard position.`;
  }
}

async function submitLeaderboardScore() {
  if (!window.ChromablockLeaderboard) return null;

  const runDuration = runStartedAt ? Date.now() - runStartedAt : 0;

  const publicName = window.ChromablockLeaderboard.getPublicLeaderboardName?.() || window.ChromablockLeaderboard.getPlayerName();
  const result = await window.ChromablockLeaderboard.saveScore({
    playerName: publicName,
    score,
    stats: {
      linesCleared: stats.totalLinesCleared,
      perfectLines: stats.perfectColorLines,
      piecesPlaced: stats.piecesPlaced,
      highestCombo: stats.highestCombo,
      treasureTilesPopped: stats.treasureTilesPopped,
      bestTreasureMultiplier: stats.bestTreasureMultiplier,
      durationMs: runDuration
    }
  });

  // The most recent local score is the score that was just saved.
  const localScores = window.ChromablockLeaderboard.getLocalScores?.() || [];
  const matching = localScores.find(s => s.score === score);
  lastGameOverLocalScoreId = matching?.id || null;

  if (result.submittedOnline) {
    showToast("NEW ONLINE BEST", "Leaderboard updated");
  } else if (result.skippedNotHighScore) {
    showToast("LOCAL SCORE SAVED", "Online best unchanged");
  } else if (result.requiresSignIn) {
    showToast("SCORE SAVED", "Sign in if it is your new best");
  } else if (result.queued) {
    showToast("BEST SCORE SAVED", "Will sync when online");
  }

  return result;
}

function updateMainPlayerBox() {
  const nameEl = document.getElementById("mainPlayerName");
  const loginBtn = document.getElementById("mainLoginBtn");
  if (!nameEl || !window.ChromablockLeaderboard) return;

  const authUser = window.ChromablockLeaderboard.getAuthUser?.();
  const publicName = window.ChromablockLeaderboard.getPublicLeaderboardName?.();

  if (authUser || publicName) {
    nameEl.textContent = publicName || authUser?.displayName || "Player";
    loginBtn?.classList.add("hidden");
  } else {
    nameEl.textContent = "Guest";
    loginBtn?.classList.remove("hidden");
  }
}

function updateGlobalUi() {
  updateMainPlayerBox();
  updateScrollIndicators();
}

function updateAuthUi() {
  if (!window.ChromablockLeaderboard) return;

  const user = window.ChromablockLeaderboard.getAuthUser?.();
  const nameEl = document.getElementById("authUserName");
  const noteEl = document.getElementById("authUserNote");
  const signInBtn = document.getElementById("googleSignInBtn");
  const signOutBtn = document.getElementById("googleSignOutBtn");
  const publicNameInput = document.getElementById("publicLeaderboardNameInput");

  if (publicNameInput && window.ChromablockLeaderboard.getPublicLeaderboardName) {
    publicNameInput.value = window.ChromablockLeaderboard.getPublicLeaderboardName();
  }

  updateMainPlayerBox();

  if (user) {
    if (nameEl) nameEl.textContent = user.displayName;
    if (noteEl) noteEl.textContent = "Signed in. Online scores use your chosen public leaderboard name.";
    signInBtn?.classList.add("hidden");
    signOutBtn?.classList.remove("hidden");
  } else {
    if (nameEl) nameEl.textContent = "Not signed in";
    if (noteEl) noteEl.textContent = "Sign in to upload online leaderboard scores.";
    signInBtn?.classList.remove("hidden");
    signOutBtn?.classList.add("hidden");
  }
}

async function renderLeaderboardScreen(mode = "local") {
  setLeaderboardTab(mode);
  if (!window.ChromablockLeaderboard) return;

  updateAuthUi();
  setLeaderboardStatus(window.ChromablockLeaderboard.getStatus());

  let scores = [];

  if (mode === "online") {
    try {
      await window.ChromablockLeaderboard.syncPendingScores();
      scores = await window.ChromablockLeaderboard.getOnlineScores(50);
      if (scores.length === 0) {
        setLeaderboardStatus("");
        scores = window.ChromablockLeaderboard.getLocalScores();
      } else {
        setLeaderboardStatus("");
      }
    } catch (err) {
      console.warn("Online leaderboard failed:", err);
      setLeaderboardStatus("");
      scores = window.ChromablockLeaderboard.getLocalScores();
    }
  } else {
    scores = window.ChromablockLeaderboard.getLocalScores();
  }

  renderLeaderboardList(scores);
  renderLeaderboardPlayerRank(mode, scores);
}

function setLeaderboardTab(mode) {
  const onlineBtn = document.getElementById("showOnlineLeaderboardBtn");
  const localBtn = document.getElementById("showLocalLeaderboardBtn");

  onlineBtn?.classList.toggle("active", mode === "online");
  localBtn?.classList.toggle("active", mode === "local");
}

async function renderLeaderboardPlayerRank(mode, visibleScores = []) {
  const el = document.getElementById("leaderboardPlayerRank");
  if (!el) return;

  el.classList.add("hidden");
  el.textContent = "";

  if (mode !== "online") return;
  if (!window.ChromablockLeaderboard?.getCurrentUserOnlineEntry) return;
  if (!window.ChromablockLeaderboard?.isSignedIn?.()) return;

  try {
    const entry = await window.ChromablockLeaderboard.getCurrentUserOnlineEntry();
    if (!entry) return;

    const inVisibleTop = visibleScores.some(s => s.uid === entry.uid || s.id === entry.uid);

    if (!inVisibleTop) {
      el.innerHTML = `Your rank: <strong>#${entry.rank}</strong> · ${entry.score}`;
      el.classList.remove("hidden");
    }
  } catch (err) {
    console.warn("Could not render player rank:", err);
  }
}

function renderLeaderboardList(scores) {
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  list.innerHTML = "";

  if (!scores || scores.length === 0) {
    const empty = document.createElement("li");
    empty.innerHTML = `
      <div class="leaderboard-name">No scores yet<span class="leaderboard-meta">Finish a game to save a score.</span></div>
      <div class="leaderboard-score">0</div>
    `;
    list.appendChild(empty);
    return;
  }

  for (const s of scores.slice(0, 50)) {
    const li = document.createElement("li");
    const date = s.date ? new Date(s.date).toLocaleDateString() : "";
    li.innerHTML = `
      <div>
        <span class="leaderboard-name">${escapeHtml(s.playerName || "Player")}</span>
        <span class="leaderboard-meta">${date || s.gameVersion || ""}</span>
      </div>
      <div class="leaderboard-score">${Math.floor(s.score || 0)}</div>
    `;
    list.appendChild(li);
  }
}

function setLeaderboardStatus(text) {
  const el = document.getElementById("leaderboardStatus");
  if (el) el.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getGameOverPraise(finalScore, isNewHighScore) {
  if (isNewHighScore) return "Personal best. That one counts.";
  if (finalScore >= 3000) return "Monster run.";
  if (finalScore >= 2000) return "Strong run.";
  if (finalScore >= 1000) return "Clean blasting.";
  if (finalScore >= 500) return "Solid work.";
  return "Run it back.";
}

function launchConfetti(amount = 40) {
  const colors = ["#ff4d6d", "#ffb703", "#3a86ff", "#06d6a0", "#8338ec", "#fb5607", "#4cc9f0", "#b8f35a"];

  for (let i = 0; i < amount; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = `${Math.random() * 100}vw`;
    c.style.setProperty("--confetti-color", colors[Math.floor(Math.random() * colors.length)]);
    c.style.setProperty("--confetti-x", `${-180 + Math.random() * 360}px`);
    c.style.setProperty("--confetti-rot", `${-720 + Math.random() * 1440}deg`);
    c.style.animationDelay = `${Math.random() * .45}s`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2300);
  }
}

function updateHud() {
  document.getElementById("score").textContent = score;
  document.getElementById("combo").textContent = comboLevel;
  document.getElementById("highScore").textContent = highScore;
  const colorCountEl = document.getElementById("colorCount");
  if (colorCountEl) colorCountEl.textContent = getUnlockedColors().length;
  updateComboMeter();
  if (currentGameMode === "adventure") updateAdventureHud();
}

function clearPreview() {
  document.querySelectorAll(".preview-valid, .preview-invalid, .preview-clear")
    .forEach(c => c.classList.remove("preview-valid", "preview-invalid", "preview-clear"));
}

function getCellEl(x, y) {
  return gridEl.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}

function getDims(cells) {
  return {
    w: Math.max(...cells.map(c => c[0])) + 1,
    h: Math.max(...cells.map(c => c[1])) + 1
  };
}

function getCubePx() {
  return Number(getComputedStyle(document.documentElement).getPropertyValue("--cube").replace("px", ""));
}

function getGapPx() {
  return Number(getComputedStyle(document.documentElement).getPropertyValue("--gap").replace("px", ""));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randTextureIndex() {
  return Math.floor(Math.random() * 10);
}

function loadOptions() {
  const defaults = { ghostPreview: true, sound: true, music: true, cubeSize: 52 };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE.OPTIONS) || "{}") };
  } catch {
    return defaults;
  }
}

function applyOptionsToControls() {
  document.getElementById("ghostToggle").checked = options.ghostPreview;
  document.getElementById("soundToggle").checked = options.sound;
  document.getElementById("musicToggle").checked = options.music;
  document.getElementById("cubeSizeSelect").value = String(options.cubeSize);
}

function saveOptionsFromMenu() {
  options = {
    ghostPreview: document.getElementById("ghostToggle").checked,
    sound: document.getElementById("soundToggle").checked,
    music: document.getElementById("musicToggle").checked,
    cubeSize: Number(document.getElementById("cubeSizeSelect").value)
  };
  localStorage.setItem(STORAGE.OPTIONS, JSON.stringify(options));
  applyOptionsToCss();

  if (options.music && audioUnlocked) startMusic();
  if (!options.music) stopMusic();

  showScreen("main");
}

function applyOptionsToCss() {
  updateResponsiveLayout();
}


function syncMobileGameNavPlacement() {
  // V94: direct HTML layout. Do not move gameplay controls in JS.
}

function updateResponsiveLayout() {
  syncMobileGameNavPlacement();
  const root = document.documentElement;
  const isGame = currentScreenName === "game" || document.getElementById("gameScreen")?.classList.contains("active");
  const isMobile = window.matchMedia("(max-width: 760px), (max-height: 760px)").matches;

  let cube = Number(options.cubeSize || 52);
  let gap = 4;

  if (isGame && isMobile) {
    const vw = window.innerWidth || 360;
    const vh = window.innerHeight || 640;

    const headerReserve = Math.min(150, Math.max(92, vh * 0.18));
    const comboReserve = currentGameMode === "adventure" ? 62 : 74;
    const pieceReserve = Math.min(190, Math.max(132, vh * 0.25));
    const verticalReserve = headerReserve + comboReserve + pieceReserve + 34;

    const byWidth = Math.floor((vw - 20 - (GRID_SIZE + 1) * 2) / GRID_SIZE);
    const byHeight = Math.floor((vh - verticalReserve - (GRID_SIZE + 1) * 2) / GRID_SIZE);

    cube = Math.max(24, Math.min(44, byWidth, byHeight));
    gap = cube <= 30 ? 2 : 3;
  } else if (isMobile) {
    cube = Math.max(34, Math.min(Number(options.cubeSize || 52), 44));
    gap = 3;
  }

  root.style.setProperty("--cube", `${cube}px`);
  root.style.setProperty("--gap", `${gap}px`);
  root.style.setProperty("--effective-cube", `${cube}px`);
}

function haptic(pattern = 10) {
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
}

function playSound(name) {
  if (!options.sound || !audio[name]) return;
  try {
    audio[name].currentTime = 0;
    audio[name].play();
  } catch {}
}

function startMusic() {
  if (!options.music) return;

  if (!audio.music.paused && audio.music.src) return;

  playRandomMusicTrack();
}

function playRandomMusicTrack() {
  if (!options.music) return;

  let next;
  do {
    next = Math.floor(Math.random() * MUSIC_TRACKS.length);
  } while (MUSIC_TRACKS.length > 1 && next === currentTrack);

  currentTrack = next;
  audio.music.src = MUSIC_TRACKS[currentTrack];
  audio.music.volume = .35;
  audio.music.currentTime = 0;

  audio.music.onended = () => playRandomMusicTrack();

  try {
    const playPromise = audio.music.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  } catch {}
}

function stopMusic() {
  try {
    audio.music.pause();
    audio.music.currentTime = 0;
    audio.music.onended = null;
  } catch {}
}


// V90 board-clear suppression for item clears
try {
  const __oldBoardEmptyCheck = window.checkBoardClearBonus;
  if (typeof __oldBoardEmptyCheck === "function") {
    window.checkBoardClearBonus = function(...args){
      if (lastBoardClearSource === "item") {
        const empty = (typeof boardIsEmpty === "function" && isBoardActuallyEmpty()) ||
                      (typeof isBoardEmpty === "function" && isBoardEmpty());
        if (empty) {
          console.log("[Board Clear] Suppressed because board was cleared by item.");
          return false;
        }
      }
      return __oldBoardEmptyCheck.apply(this,args);
    };
  }
} catch(e){}
