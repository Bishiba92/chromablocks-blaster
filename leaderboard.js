const LEADERBOARD_STORAGE = {
  LOCAL: "chromablockBlaster.localLeaderboard",
  PENDING: "chromablockBlaster.pendingLeaderboardSubmissions",
  PLAYER_NAME: "chromablockBlaster.playerName",
  PUBLIC_NAME: "chromablockBlaster.publicLeaderboardName"
};

const GAME_VERSION = "v14";
const ONLINE_LEADERBOARD_MODE = "best_score_per_user";

window.ChromablockLeaderboard = {
  getPlayerName,
  setPlayerName,
  getPublicLeaderboardName,
  setPublicLeaderboardName,
  saveScore,
  getLocalScores,
  getOnlineScores,
  syncPendingScores,
  isOnlineAvailable,
  getStatus,
  getOnlineRankForScore,
  getCurrentUserOnlineEntry,
  submitPendingForLocalId,
  signInWithGoogle,
  signOut,
  getAuthUser,
  isSignedIn
};

function getPlayerName() {
  let name = localStorage.getItem(LEADERBOARD_STORAGE.PLAYER_NAME);
  if (!name) {
    name = `Player_${Math.floor(1000 + Math.random() * 9000)}`;
    setPlayerName(name);
  }
  return name;
}

function setPlayerName(name) {
  const finalName = sanitizeLeaderboardName(name);
  localStorage.setItem(LEADERBOARD_STORAGE.PLAYER_NAME, finalName);
  return finalName;
}

function getPublicLeaderboardName() {
  let name = localStorage.getItem(LEADERBOARD_STORAGE.PUBLIC_NAME);

  if (!name) {
    name = localStorage.getItem(LEADERBOARD_STORAGE.PLAYER_NAME) || getPlayerName();
    name = setPublicLeaderboardName(name);
  }

  return name;
}

function setPublicLeaderboardName(name) {
  const finalName = sanitizeLeaderboardName(name);
  localStorage.setItem(LEADERBOARD_STORAGE.PUBLIC_NAME, finalName);
  localStorage.setItem(LEADERBOARD_STORAGE.PLAYER_NAME, finalName);
  return finalName;
}

function sanitizeLeaderboardName(name) {
  const cleaned = String(name || "")
    .trim()
    .replace(/[^\w\sÅÄÖåäö\-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 18);

  return cleaned || `Player_${Math.floor(1000 + Math.random() * 9000)}`;
}

async function saveScore(scoreData) {
  const entry = normalizeScoreEntry({ ...scoreData, playerName: getPublicLeaderboardName() });

  saveLocalScore(entry);

  // Online leaderboard uses one best-score document per signed-in user.
  // If the player is signed out, keep only their best pending score locally.
  if (await isOnlineAvailable() && isSignedIn()) {
    try {
      const submitResult = await submitOnlineScore(entry);
      await syncPendingScores();

      return {
        savedLocal: true,
        submittedOnline: submitResult.submitted,
        skippedNotHighScore: submitResult.skippedNotHighScore
      };
    } catch (err) {
      console.warn("Online score submit failed, queueing if candidate is useful:", err);
      queuePendingScore(entry);
      return { savedLocal: true, submittedOnline: false, queued: true };
    }
  }

  queuePendingScore(entry);
  return {
    savedLocal: true,
    submittedOnline: false,
    queued: true,
    requiresSignIn: await isOnlineAvailable() && !isSignedIn()
  };
}

function normalizeScoreEntry(scoreData) {
  const now = Date.now();

  return {
    id: cryptoRandomId(),
    playerName: setPublicLeaderboardName(scoreData.playerName || getPublicLeaderboardName()),
    score: Math.max(0, Math.floor(Number(scoreData.score) || 0)),
    createdAtLocal: now,
    date: new Date(now).toISOString(),
    gameVersion: GAME_VERSION,
    stats: {
      linesCleared: Math.max(0, Math.floor(Number(scoreData.stats?.linesCleared) || 0)),
      perfectLines: Math.max(0, Math.floor(Number(scoreData.stats?.perfectLines) || 0)),
      piecesPlaced: Math.max(0, Math.floor(Number(scoreData.stats?.piecesPlaced) || 0)),
      highestCombo: Math.max(0, Math.floor(Number(scoreData.stats?.highestCombo) || 0)),
      durationMs: Math.max(0, Math.floor(Number(scoreData.stats?.durationMs) || 0))
    }
  };
}

function saveLocalScore(entry) {
  const scores = getLocalScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score || a.createdAtLocal - b.createdAtLocal);
  localStorage.setItem(LEADERBOARD_STORAGE.LOCAL, JSON.stringify(scores.slice(0, 50)));
}

function getLocalScores() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE.LOCAL) || "[]");
  } catch {
    return [];
  }
}

function getPendingScores() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_STORAGE.PENDING) || "[]");
  } catch {
    return [];
  }
}

function savePendingScores(scores) {
  localStorage.setItem(LEADERBOARD_STORAGE.PENDING, JSON.stringify(scores));
}

function queuePendingScore(entry) {
  // Avoid spamming Firestore after sign-in:
  // keep only the single best pending score locally.
  const pending = getPendingScores();
  const currentBest = pending.reduce((best, item) => {
    return !best || item.score > best.score ? item : best;
  }, null);

  if (!currentBest || entry.score > currentBest.score) {
    savePendingScores([entry]);
  }
}

async function isOnlineAvailable() {
  const fb = window.ChromablockFirebase;
  return Boolean(
    navigator.onLine &&
    fb &&
    fb.enabled &&
    fb.db
  );
}

function isSignedIn() {
  return Boolean(window.ChromablockFirebase?.currentUser);
}

function getAuthUser() {
  const user = window.ChromablockFirebase?.currentUser;
  if (!user) return null;

  return {
    uid: user.uid,
    displayName: user.displayName || "Google Player",
    publicName: getPublicLeaderboardName()
  };
}

async function signInWithGoogle() {
  const fb = window.ChromablockFirebase;

  if (!fb?.enabled || !fb.auth || !fb.provider) {
    throw new Error(fb?.initError || "Firebase Auth unavailable.");
  }

  const result = await fb.auth.signInWithPopup(fb.provider);
  return result.user;
}

async function signOut() {
  const fb = window.ChromablockFirebase;
  if (!fb?.auth) return;
  await fb.auth.signOut();
}

function getStatus() {
  const fb = window.ChromablockFirebase;
  const pendingCount = getPendingScores().length;

  if (!navigator.onLine) return `Offline. ${pendingCount} score(s) waiting to sync.`;
  if (!fb?.enabled) return `Local leaderboard active. ${fb?.initError || "Firebase disabled."}`;
  if (!isSignedIn()) return `Online leaderboard available. Sign in with Google to upload scores. ${pendingCount} pending.`;
  return pendingCount > 0 ? `Signed in. ${pendingCount} score(s) waiting to sync.` : "Signed in. Online leaderboard connected.";
}

async function submitOnlineScore(entry) {
  const fb = window.ChromablockFirebase;
  if (!await isOnlineAvailable()) throw new Error("Firebase leaderboard unavailable.");
  if (!isSignedIn()) throw new Error("Google sign-in required to upload scores.");

  const user = fb.currentUser;
  const playerName = getPublicLeaderboardName();
  const docRef = fb.db.collection(fb.collectionName).doc(user.uid);
  const existing = await docRef.get();

  if (existing.exists) {
    const oldScore = Number(existing.data()?.score) || 0;

    if (entry.score <= oldScore) {
      console.log("[Leaderboard] Score not uploaded because it is not a new online high score.", {
        newScore: entry.score,
        oldScore
      });

      return {
        submitted: false,
        skippedNotHighScore: true,
        oldScore
      };
    }
  }

  const payload = {
    uid: user.uid,
    playerName,
    score: entry.score,
    gameVersion: entry.gameVersion,
    stats: entry.stats,
    localId: entry.id,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdAt: existing.exists
      ? existing.data()?.createdAt || firebase.firestore.FieldValue.serverTimestamp()
      : firebase.firestore.FieldValue.serverTimestamp()
  };

  await docRef.set(payload, { merge: true });

  console.log("[Leaderboard] New online high score saved.", {
    uid: user.uid,
    score: entry.score
  });

  return {
    submitted: true,
    skippedNotHighScore: false
  };
}

async function syncPendingScores() {
  if (!await isOnlineAvailable() || !isSignedIn()) {
    return { synced: 0, skipped: 0, remaining: getPendingScores().length, requiresSignIn: await isOnlineAvailable() };
  }

  const pending = getPendingScores();
  const remaining = [];
  let synced = 0;
  let skipped = 0;

  for (const entry of pending) {
    try {
      const result = await submitOnlineScore(entry);

      if (result.submitted) synced++;
      else if (result.skippedNotHighScore) skipped++;
    } catch (err) {
      console.warn("Pending score sync failed:", err);
      remaining.push(entry);
    }
  }

  savePendingScores(remaining);
  return { synced, skipped, remaining: remaining.length };
}

async function getOnlineScores(limit = 50) {
  const fb = window.ChromablockFirebase;
  if (!await isOnlineAvailable()) {
    return [];
  }

  const snapshot = await fb.db
    .collection(fb.collectionName)
    .orderBy("score", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      playerName: data.playerName || "Player",
      score: Number(data.score) || 0,
      date: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : "",
      gameVersion: data.gameVersion || "",
      stats: data.stats || {}
    };
  });
}

async function getOnlineRankForScore(score) {
  if (!await isOnlineAvailable()) {
    return null;
  }

  const fb = window.ChromablockFirebase;
  const numericScore = Math.max(0, Math.floor(Number(score) || 0));

  // Simple global rank: 1 + number of online scores higher than this score.
  // Firestore count() requires a recent SDK/index setup, so we use a query snapshot for now.
  const snapshot = await fb.db
    .collection(fb.collectionName)
    .where("score", ">", numericScore)
    .get();

  return snapshot.size + 1;
}

async function getCurrentUserOnlineEntry() {
  if (!await isOnlineAvailable() || !isSignedIn()) return null;

  const fb = window.ChromablockFirebase;
  const user = fb.currentUser;
  const doc = await fb.db.collection(fb.collectionName).doc(user.uid).get();

  if (!doc.exists) return null;

  const data = doc.data();
  const rank = await getOnlineRankForScore(data.score);

  return {
    id: doc.id,
    uid: user.uid,
    rank,
    playerName: data.playerName,
    score: data.score,
    date: normalizeFirestoreDate(data.updatedAt || data.createdAt)
  };
}

async function submitPendingForLocalId(localId) {
  if (!await isOnlineAvailable()) return { submittedOnline: false, requiresSignIn: false };
  if (!isSignedIn()) return { submittedOnline: false, requiresSignIn: true };

  const pending = getPendingScores();
  const entry = pending.find(s => s.id === localId) || pending.reduce((best, item) => {
    return !best || item.score > best.score ? item : best;
  }, null);

  if (!entry) return { submittedOnline: false, missing: true };

  const result = await submitOnlineScore(entry);
  savePendingScores(pending.filter(s => s.id !== entry.id));

  return {
    submittedOnline: result.submitted,
    skippedNotHighScore: result.skippedNotHighScore
  };
}

function cryptoRandomId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `score_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
