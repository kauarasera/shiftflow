# ShiftFlow

A production shift sign-up system used daily by ~400 staff at a real facilities company. Built solo, from problem to production, while working in an Operations role — not a formal dev job.

**Live problem it replaced:** shift sign-ups were being handled over WhatsApp with manual counting, which meant whoever had the fastest phone/fingers got the spot. This system replaced that with a fair, first-come-first-served digital booking flow, plus a full admin panel for supervisors.

## 🔗 Try it live

**[shiftflow-demo.netlify.app](https://shiftflow-demo.netlify.app)** — a separate demo project with only fictional data, isolated from the real deployment.

**As staff (booking a shift):**
1. Open the link above
2. Pick the shift labelled **"Test Campus"**
3. Enter any full name + Staff Number **`10001`**
4. Confirm — you'll see the booking go through in real time

Want to see the group-isolation rule reject a booking instead? Use Staff Number **`20002`** (registered to a different group) on the same shift — it'll show a clear "not available for your group" message rather than silently failing.

**As admin (managing shifts and staff):**
1. Go to **[/admin.html](https://shiftflow-demo.netlify.app/admin.html)**
2. Sign in with the demo admin account (real Firebase Authentication — email + password, not a stored password). *Credentials aren't published here on purpose — same reasoning as not committing real secrets to a public repo. Happy to share them directly, just ask.*
3. From here you can create shifts, assign groups, add/import staff, and export data — this is the same panel real supervisors use

## Stack

- Vanilla HTML/CSS/JS (no framework)
- Firebase: Firestore, Authentication, Cloud Functions (Node 20), App Check
- Netlify (static hosting)

## Origin & broader applications

This started as a narrow, real problem: shift sign-ups were happening over WhatsApp with manual counting, which quietly rewarded whoever had the fastest thumbs, not whoever needed the shift most. The fix didn't need to be complicated — it needed to be fair, fast, and hard to game.

Stripped of the "shift" label, what's actually being solved is a general pattern: **limited-capacity slots, eligibility rules, and fair first-come access, with an admin layer to manage it all.** That pattern shows up well outside facilities/cleaning work:

| Context | Same system, different label |
|---|---|
| Healthcare | On-call / rota scheduling by specialty or unit |
| Gyms & studios | Class sign-ups with per-session capacity |
| Education | Workshop, mentoring, or office-hours slots |
| Restaurants | Table reservations by time slot |
| Fleets & logistics | Vehicle or parking spot booking by shift |
| Coworking spaces | Meeting room / desk booking by time block |
| Events & volunteering | Volunteer shift sign-ups at an event |
| Recruiting | Interview slot booking with limited availability |
| Retail / e-commerce | Scheduled pickup or delivery windows |

Swapping the domain is mostly a matter of relabeling `group` (site/campus/department → specialty/level/location) and the shift terminology in the UI — the atomic booking, group isolation, and layered security underneath don't change.

## Key engineering decisions

**Atomic booking, not a naive write.** Every booking runs inside a Firestore transaction that re-reads the shift's live capacity before committing — this prevents overbooking under concurrent load (see [`CONCEPTS.md`](./docs/CONCEPTS.md) for the race condition this closes and why).

**Deterministic document IDs to kill duplicate bookings.** A booking's Firestore document ID *is* the normalised staff number, not a random ID. That turns "does this person already have a booking?" from a separate, racy read into an atomic check inside the same transaction as the write.

**Defense in depth against bots, not a single gate.** Three independent layers: an invisible honeypot + minimum-fill-time check in the client, Firebase App Check (reCAPTCHA v3) at the network edge, and Firestore Security Rules that re-validate every field server-side — so even a script that skips the website entirely still can't write garbage data.

**Group-based access isolation.** Staff and shifts both carry a `group` field (three isolated populations in this deployment). Eligibility is enforced twice: once in the UI for a fast, friendly error, and again in Firestore Rules so it can't be bypassed by talking to the database directly.

## Project structure

```
public/
  index.html                 — staff-facing booking page
  admin.html                 — admin panel (shifts, staff list, Excel import/export)
  shared.js                  — utilities shared by both pages (validation, formatting, messages)
  firebase-config.example.js — copy to firebase-config.js and fill in your own project
firestore.rules              — security rules (test in the Rules Playground before deploying)
docs/
  CONCEPTS.md                — notes on the trickier engineering decisions
```

## Setup (to run your own copy — not needed just to try the demo above)

1. Create a Firebase project (Firestore + Authentication + App Check enabled)
2. Copy `public/firebase-config.example.js` to `public/firebase-config.js` and fill in your project's credentials
3. Publish `firestore.rules` via the Firebase Console (test in the Rules Playground first)
4. Deploy the `public/` folder to any static host (Netlify, Firebase Hosting, etc.)

## Known limitations (and why they're documented, not hidden)

- **No automated tests yet.** Testing has been manual (Firestore Rules Playground + real-world verification) — a natural next step for this codebase.
- **Admin accounts are provisioned manually.** There's no self-service sign-up for the admin panel (by design) — new admin users are added directly in Firebase Console > Authentication. Fine at this team size; would need a proper invite flow at larger scale.

*(Earlier versions of this README described the admin login as a client-side-only password check with no real authentication behind it. That was inaccurate — a closer re-read of the code confirmed `admin.html` uses real Firebase Authentication (`signInWithEmailAndPassword`), and Firestore Rules now enforce `request.auth != null` on every admin write. See [`CONCEPTS.md`](./docs/CONCEPTS.md#4-admin-authentication) for the full story, including the correction.)*

## License

MIT — feel free to learn from this, don't paste it into a production system with real user data without addressing the limitations above first.
