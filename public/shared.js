// ============================================================
// SHARED UTILITIES
// ============================================================
// Used by both index.html (staff-facing) and admin.html (admin
// panel). Previously these lived duplicated in both files — kept
// here once, imported by both, so a fix or rule change only needs
// to happen in one place.
// ============================================================

// ── Normalise a staff number: uppercase, strip full-width ASCII
// variants, strip anything that isn't a plain letter or digit
// (spaces, zero-width characters, stray punctuation, etc.) ──
export function normaliseStaff(raw) {
  let s = String(raw).trim().toUpperCase();
  s = s.replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  return s.replace(/[^A-Z0-9]/g, '');
}

// ── Auto-fix name capitalisation (e.g. "joao paulo" -> "Joao Paulo") ──
export function toTitleCase(str) {
  return String(str).trim().toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── Validate name: requires first AND last name, each with at
// least 3 letters (e.g. "Ana Silva" passes, "Lu" or "Jo Silva"
// don't). Letters, spaces, apostrophes and hyphens only — covers
// names like "N'dri" or "Jean-Paul". Blocks numbers and stray
// symbols (e.g. someone pasting "Name -558157" from WhatsApp
// instead of typing their name). ──
export function isValidName(name) {
  const trimmed = String(name).trim();
  const validChars = /^[A-Za-zÀ-ÖØ-öø-ÿ'\- ]+$/;
  if (!validChars.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false; // need first name + last name
  return words.every(w => (w.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length >= 3);
}

// ── Safe Firestore document ID from a staff number ──
export function safeDocId(staffNumber) {
  return staffNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ── Display date as DD-MM-YYYY ────────────────────────────
// NOTE: internal storage/comparisons stay YYYY-MM-DD (string-safe,
// no timezone bugs). This is ONLY for what the person sees on screen.
export function formatDateDisplay(iso) {
  if (!iso) return '';
  const parts = String(iso).split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

// ── Inline form message helpers ───────────────────────────
export function showMsg(el, text, type) {
  el.textContent = text;
  el.className   = `msg show ${type === 'error' ? 'msg-error' : 'msg-success'}`;
}
export function clearMsg(el) { el.textContent = ''; el.className = 'msg'; }
