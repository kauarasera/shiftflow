# Engineering notes

Short explanations of the non-obvious decisions in this codebase, for anyone (including future me) wondering "why is it built this way?"

## 1. The race condition in booking (and why a transaction alone doesn't fix it)

**The bug:** two people tapping "Confirm" for the same shift within milliseconds of each other could both pass a "do I already have a booking?" check before either write landed — resulting in two booking documents for the same person, or two people taking the last spot.

**Why a Firestore transaction alone didn't close it:** the duplicate check was a separate read (`getDocs`) *before* the transaction started. Two near-simultaneous requests could both see "no existing booking" during that read, then both proceed to write.

**The fix:** the booking document's ID is the staff's normalised staff number, not a random ID. The existence check now happens *inside* the transaction, on that exact document. Firestore transactions guarantee only one writer wins when two transactions touch the same document — the loser's transaction retries and fails safely with a `DUPLICATE` error, which the UI turns into a clear message instead of a crash.

## 2. Defense in depth, not one gate

Three independent layers protect the booking flow, deliberately not relying on any single one:

1. **Client-side (UI):** an invisible honeypot field and a minimum-fill-time check catch unsophisticated bots.
2. **Network edge:** Firebase App Check (reCAPTCHA v3) verifies traffic is coming from a real browser before it reaches Firestore at all.
3. **Database (Firestore Security Rules):** every field is re-validated server-side on write — staff number format, staff existence, name shape — so even a script that skips the website entirely and talks to Firestore directly still can't write invalid data.

Each layer assumes the one before it can be bypassed. That's the point.

## 3. Group-based access isolation

Staff and shifts each carry a `group` field. A booking is only allowed if the two match. This is enforced twice, on purpose:

- **In the UI**, for a fast, specific error message ("this shift isn't available for your group") without a round trip that fails.
- **In Firestore Rules**, using a nested `get()` to compare the staff's stored group against the shift's group — this is the layer that can't be bypassed, since it runs on the database itself regardless of what code is calling it.

## 4. Admin authentication

`admin.html` is protected by real Firebase Authentication (`signInWithEmailAndPassword`) — not a password stored in the codebase. There's no public sign-up form; admin accounts are created manually in Firebase Console > Authentication > Users, so a valid session there reliably means "someone with project access," not "any visitor."

Firestore Rules enforce this on the database side too: every admin-only write (managing shifts, managing the staff list, deleting a booking) requires `request.auth != null`. Staff booking stays intentionally open with no login — that's the point of the flow — protected instead by the layered defenses in section 2.

**A correction, left in on purpose:** an earlier version of this file (and the README) described the admin login as a client-side-only password check with no real authentication behind it, and left the `blockedStaff` write rule only partially hardened as a result. That was inaccurate — it came from noticing an unused `ADMIN_PASSWORD` constant in the config file without checking whether the login flow actually used it (it didn't; it was dead code from an earlier version, now removed). A closer re-read of `admin.html` surfaced the real `signInWithEmailAndPassword` flow, and the rules were tightened to use `request.auth != null` properly. Keeping this note instead of quietly fixing it — catching and correcting your own wrong assumption is a normal part of building something real, not something to hide.

## 5. Splitting out `shared.js`

Both `index.html` and `admin.html` originally carried their own copies of the same seven small utility functions (staff-number normalisation, name validation, date formatting, message helpers). Same logic, pasted twice — a classic DRY violation: any future change to a validation rule would need to happen in two places, and it's easy to update one and forget the other.

Note this isn't "applying SOLID" in the literal sense — SOLID is an object-oriented design framework, and this codebase is intentionally plain procedural JS with no build step. But the underlying idea (a piece of logic should have one authoritative home) applies regardless of paradigm. The fix was straightforward: extract the seven functions into `shared.js` as ES module exports, and import them where needed. No behaviour changed — this was a pure refactor, verified by re-running the existing manual test checklist after the change.
