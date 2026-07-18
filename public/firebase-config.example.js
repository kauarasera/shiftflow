// ============================================================
// FIREBASE CONFIGURATION — EXAMPLE FILE
// ============================================================
// Rename this to firebase-config.js and fill in your own project's
// values from: Firebase Console > Project Settings > General >
// Your apps > SDK setup and configuration.
//
// Never commit real API keys or passwords to a public repository.
// ============================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ============================================================
// ADMIN PANEL LOGIN
// ============================================================
// admin.html uses real Firebase Authentication (email + password) —
// there's no password stored in code. Create admin accounts in:
// Firebase Console > Authentication > Users > Add user
// ============================================================

// ============================================================
// APP CHECK — invisible bot verification (reCAPTCHA v3)
// ============================================================
// 1. Create a reCAPTCHA v3 key at https://www.google.com/recaptcha/admin/create
// 2. Register it in Firebase Console > App Check
// 3. Paste the Site Key below
// 4. Enforce it for Cloud Firestore under App Check > APIs
//
// While this is still the placeholder text, the app runs normally
// without this extra protection layer — it fails open, not closed.
// ============================================================
const APPCHECK_SITE_KEY = "YOUR_RECAPTCHA_V3_SITE_KEY";
