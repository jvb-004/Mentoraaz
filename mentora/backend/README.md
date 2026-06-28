# Mentora — Backend (v1)

A real, working backend for Mentora: a Baku-based platform connecting parents/students
with verified tutors, coaches, and instructors.

This is not a mockup. Every endpoint here talks to a real SQLite database, passwords
are properly hashed, sessions are real signed cookies, and the verification-hiding
logic is enforced in the database query itself (not just hidden in the UI).

## What's built

- **Auth**: signup, login, logout, session cookies, account deletion
- **Tutor profiles**: create/edit, subjects by category, pricing, location, online/offline
- **Verification system**: tutors are completely hidden from search until an admin
  approves at least one credential. This is enforced at the query level — there is no
  code path that shows an unverified tutor in search results.
- **Credentials**: upload diplomas/certificates/links, pending → approved/rejected by admin
- **Real chat**: conversations, messages, read receipts, attachments, a lightweight
  safety flag for messages that try to move off-platform very early in a new conversation
- **Reviews**: only from users who've actually messaged that tutor (prevents fake reviews)
- **Billing structure**: boost (pay to be featured for 7 days) and Mentora Pro
  (monthly subscription) — fully working logic, using a mock charge path until a real
  payment provider is wired in (see note below)
- **Admin**: credential review queue, approve/reject, basic stats, report queue
- **File uploads**: credentials and photos, validated file types, size limits

## Running it locally

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET to a random string, set ADMIN_EMAILS to your own email
node server.js
```

The server starts on http://localhost:4000. The database file (mentora.db) is
created automatically on first run — it's a real SQLite file using Node's built-in
node:sqlite module, so there's no native compilation step and no extra service to run.

### Quick test

```bash
curl http://localhost:4000/api/health
```

## Important: the "hidden until verified" rule

Per your decision: a tutor's profile never appears in search or public profile
lookups until an admin has approved at least one of their submitted credentials.
This isn't a display filter — the SQL query itself only ever selects
is_hidden = 0 AND verification_status = 'verified'. A tutor can fully build their
profile (bio, subjects, price, photo) while invisible, so they aren't blocked from
preparing — they just won't be found until reviewed.

As the platform owner, you'll use the /api/admin/pending-credentials endpoint to see
what's waiting on you, and approve/reject from there. This is currently a manual,
human-reviewed step by design — there's no shortcut here, because this is the entire
trust mechanism the product depends on.

## About payments

Stripe does not currently support payouts to businesses based in Azerbaijan. This
doesn't block building or testing Mentora's paywall — routes/billing.js is built so
all the logic (what a boost unlocks, for how long, what Pro includes) is fully real
and testable right now using a mock charge path. When you're ready to take real money,
you have two practical options:

1. Incorporate in a Stripe-supported country (Stripe Atlas can incorporate a US company
   from anywhere for roughly $500 plus ongoing costs) and use real Stripe
2. Use a local Azerbaijani payment gateway once your business is registered there

Either way, only the createCharge() function in routes/billing.js needs to change —
nothing else in the app does.

## What this environment cannot do (and what that means for you)

This backend was built and tested inside a sandboxed development environment, which
means:

- It is not currently reachable from the public internet — it only runs locally right now
- It cannot send real SMS or emails (no external network access for that here)
- The database is a local file, not a hosted production database

None of this is a flaw in the code — it's just the difference between "built and
tested" and "deployed." See DEPLOY.md for the concrete next step: putting this exact
code on a real host so it's live on the internet.

## Project structure

```
backend/
  server.js              main app, auth routes
  db.js                  database schema and connection
  auth.js                password hashing, JWT sessions, middleware
  routes/
    tutors.js            search, profiles, subjects, credentials, reviews
    messages.js          conversations, chat, reporting
    uploads.js           file upload handling
    billing.js           boost and subscription logic
    admin.js              credential review queue, stats
  uploads/                uploaded files (gitignored)
  .env.example            config template
```

## What's next

This is a real v1 backend. The next pieces, in rough order:

1. Frontend — connect the actual UI (the designs we built) to these real endpoints
   instead of hardcoded demo data
2. Deploy — see DEPLOY.md
3. Real payment provider — once your business entity is set up
4. Real SMS/email — for verification codes and notifications
5. A proper admin role system — right now it's an env-var email allowlist, which is
   fine for one founder reviewing credentials, but will need real roles as you grow
