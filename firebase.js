/*
  Chromablock Blaster Firebase Setup Guide
  =======================================

  This file is intentionally safe by default.
  The game works fully offline without Firebase.

  To activate online leaderboards:

  STEP 1 — Create Firebase Project
  --------------------------------
  1. Go to https://console.firebase.google.com/
  2. Create a new project.
  3. Disable Google Analytics unless you specifically want it.

  STEP 2 — Create a Web App
  -------------------------
  1. In Firebase Project Settings, click "Add app".
  2. Choose Web app.
  3. Copy the firebaseConfig object.

  STEP 3 — Enable Authentication
  -------------------------------
  1. Go to Build > Authentication.
  2. Click "Get started".
  3. Go to Sign-in method.
  4. Enable Google.
  5. Add your production domain to Authorized domains.

  STEP 4 — Enable Firestore
  -------------------------
  1. Go to Build > Firestore Database.
  2. Create database.
  3. Start in production mode if publishing publicly.
  4. Pick a region close to your expected players.

  STEP 5 — Add Firebase SDK scripts to index.html
  -----------------------------------------------
  This project currently does NOT include Firebase SDK scripts by default,
  because it should run offline and from local files without errors.

  If you deploy to a server, add these BEFORE firebase.js:

  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js"></script>

  STEP 6 — Paste your Firebase config below
  -----------------------------------------
  Replace the placeholder values in FIREBASE_CONFIG.

  STEP 7 — Set ENABLE_FIREBASE_LEADERBOARD to true
  -----------------------------------------------
  Change:

    ENABLE_FIREBASE_LEADERBOARD: false

  to:

    ENABLE_FIREBASE_LEADERBOARD: true

  STEP 8 — Firestore collection
  -----------------------------
  Scores will be stored in this collection:

    leaderboards_global

  IMPORTANT:
  This version uses one document per signed-in user:
    leaderboards_global/{uid}

  The online leaderboard stores only each user's best score.
  Lower scores are not uploaded. New high scores replace the existing document.

  Each document looks like:

    {
      playerName: "Player",
      score: 1234,
      createdAt: server timestamp,
      gameVersion: "v14",
      stats: {
        linesCleared: 10,
        perfectLines: 2,
        piecesPlaced: 30,
        highestCombo: 4,
        durationMs: 180000
      }
    }

  STEP 9 — Basic Firestore security rules
  ---------------------------------------
  Client-side leaderboards are never perfectly cheat-proof.
  These rules add basic sanity limits.

  In Firestore Rules, start with something like:

  rules_version = '2';

  service cloud.firestore {
    match /databases/{database}/documents {
      match /leaderboards_global/{scoreId} {
        allow read: if true;

        allow create: if
          request.auth != null &&

          request.resource.data.uid == request.auth.uid &&

          request.resource.data.playerName is string &&
          request.resource.data.playerName.size() >= 1 &&
          request.resource.data.playerName.size() <= 18 &&

          request.resource.data.score is int &&
          request.resource.data.score >= 0 &&
          request.resource.data.score <= 1000000 &&

          request.resource.data.gameVersion is string &&
          request.resource.data.gameVersion.size() <= 20 &&

          request.resource.data.stats.linesCleared is int &&
          request.resource.data.stats.linesCleared >= 0 &&
          request.resource.data.stats.linesCleared <= 10000 &&

          request.resource.data.stats.piecesPlaced is int &&
          request.resource.data.stats.piecesPlaced >= 0 &&
          request.resource.data.stats.piecesPlaced <= 100000 &&

          request.resource.data.createdAt == request.time;

        allow update, delete: if false;
      }
    }
  }

  This rule means:
  - Anyone can read leaderboard documents.
  - Only signed-in Google users can create score documents.
  - Users can only submit scores under their own Firebase Auth UID.
  - The submitted uid must match Firebase Auth.
  - The public playerName may be a chosen pseudonym.
  - No one can edit or delete leaderboard entries from the client.

  STEP 10 — Better anti-cheat later
  --------------------------------
  For a serious public leaderboard, use Firebase Auth + Cloud Functions:
  - Send score attempt to a Cloud Function.
  - Validate score plausibility server-side.
  - Write accepted scores from the function.
  - Reject suspicious runs.

  STEP 11 — Deployment
  --------------------
  Firebase SDK generally works best when the game is served from a web server,
  not opened directly as file://.
*/

window.CHROMABLOCK_FIREBASE_SETTINGS = {
  ENABLE_FIREBASE_LEADERBOARD: true,

  FIREBASE_CONFIG: {
    apiKey: "AIzaSyDcXZ8WXvwDxT9DPsf_1_sFjLdiyPUDdAs",
    authDomain: "chromablock-blaster.firebaseapp.com",
    projectId: "chromablock-blaster",
    storageBucket: "chromablock-blaster.firebasestorage.app",
    messagingSenderId: "393340965928",
    appId: "1:393340965928:web:d8672a0d93782ee285d11d",
    measurementId: "G-D7SWW4YZP8"
  },

  COLLECTION_NAME: "leaderboards_global",
  MAX_ONLINE_SCORES: 25
};

(function initChromablockFirebase() {
  const settings = window.CHROMABLOCK_FIREBASE_SETTINGS;

  window.ChromablockFirebase = {
    enabled: false,
    db: null,
    auth: null,
    provider: null,
    currentUser: null,
    collectionName: settings.COLLECTION_NAME,
    maxScores: settings.MAX_ONLINE_SCORES,
    initError: null
  };

  console.log("[Firebase] Initializing Chromablock Firebase layer...");

  if (!settings.ENABLE_FIREBASE_LEADERBOARD) {
    window.ChromablockFirebase.initError = "Firebase leaderboard disabled in firebase.js.";
    console.warn("[Firebase]", window.ChromablockFirebase.initError);
    return;
  }

  if (!window.firebase) {
    window.ChromablockFirebase.initError = "Firebase SDK scripts are missing from index.html.";
    console.error("[Firebase]", window.ChromablockFirebase.initError);
    return;
  }

  if (!firebase.auth) {
    window.ChromablockFirebase.initError = "Firebase Auth SDK script is missing from index.html.";
    console.error("[Firebase]", window.ChromablockFirebase.initError);
    return;
  }

  if (!firebase.firestore) {
    window.ChromablockFirebase.initError = "Firebase Firestore SDK script is missing from index.html.";
    console.error("[Firebase]", window.ChromablockFirebase.initError);
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(settings.FIREBASE_CONFIG);
    }

    window.ChromablockFirebase.db = firebase.firestore();
    window.ChromablockFirebase.auth = firebase.auth();
    window.ChromablockFirebase.provider = new firebase.auth.GoogleAuthProvider();
    window.ChromablockFirebase.provider.setCustomParameters({ prompt: "select_account" });

    window.ChromablockFirebase.auth.onAuthStateChanged(user => {
      window.ChromablockFirebase.currentUser = user || null;
      console.log("[Firebase Auth] Auth state changed:", user ? {
        uid: user.uid,
        displayName: user.displayName
      } : "signed out");
      window.dispatchEvent(new CustomEvent("chromablock-auth-changed", {
        detail: {
          signedIn: Boolean(user),
          uid: user?.uid || null,
          displayName: user?.displayName || null
        }
      }));
    });

    window.ChromablockFirebase.enabled = true;
    console.log("[Firebase] Initialized successfully.", {
      projectId: settings.FIREBASE_CONFIG.projectId,
      collectionName: settings.COLLECTION_NAME
    });
  } catch (err) {
    console.warn("Firebase initialization failed:", err);
    window.ChromablockFirebase.initError = err?.message || String(err);
  }
})();
