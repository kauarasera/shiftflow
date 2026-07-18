// ============================================================
// FIREBASE CONFIGURATION — shiftflow-demo (portfolio demo project)
// ============================================================
// This file is gitignored — it only lives locally / in your deploy,
// never in the public GitHub repo.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyD4WPKqjGP8YtO18GlTaldsDsiwNUq3IAI",
  authDomain: "shiftflow-demo.firebaseapp.com",
  projectId: "shiftflow-demo",
  storageBucket: "shiftflow-demo.firebasestorage.app",
  messagingSenderId: "533684616985",
  appId: "1:533684616985:web:3c42cc318312a6733f8f88"
};

// ============================================================
// ADMIN PANEL LOGIN
// ============================================================
// admin.html uses real Firebase Authentication (email + password),
// not a password stored in this file. Create the demo admin
// account in: Firebase Console > Authentication > Users > Add user
// ============================================================

// ============================================================
// APP CHECK — optional for a demo project. Leave as-is (the app
// runs fine without it) or set it up later following the same
// steps as the production project.
// ============================================================
const APPCHECK_SITE_KEY = "COLE_AQUI_A_SITE_KEY";
