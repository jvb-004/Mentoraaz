# Deploying Mentora — Getting It Live on the Internet

This is the concrete path from "running on my machine" to "live at a real URL."

## Recommended host: Railway

Railway is a good fit here because it runs a normal Node.js server (no rewrite needed),
supports persistent storage for the SQLite file, and has a generous free tier for early
testing. (Render and Fly.io are reasonable alternatives if you'd rather compare.)

### Steps

1. **Push this code to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Mentora backend v1"
   ```
   Create a new repository on GitHub, then push:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/mentora-backend.git
   git push -u origin main
   ```

2. **Create a Railway account** at railway.app (free to start, GitHub login works)

3. **New Project → Deploy from GitHub repo** → select your mentora-backend repo

4. **Set environment variables** in Railway's dashboard (under your project's "Variables" tab):
   - `JWT_SECRET` — generate a real random string, for example by running
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
     locally and pasting the output
   - `ADMIN_EMAILS` — your real email address(es), comma-separated
   - `NODE_ENV` — set to `production`
   - `PORT` — Railway sets this automatically, you don't need to set it yourself

5. **Add a persistent volume** for the database and uploads folder, so they survive
   restarts/redeploys (Railway: Project Settings → Volumes → mount at `/app/uploads`
   and wherever mentora.db lives). Without this, every redeploy wipes your data —
   fine for testing, not fine once real tutors and parents are using it.

6. **Deploy.** Railway will run `npm install` then `node server.js` automatically. You'll
   get a real URL like `mentora-backend-production.up.railway.app`.

7. **Custom domain (optional, later)** — once you've bought a domain (e.g. mentora.app),
   Railway lets you point it at your deployed app under Settings → Domains.

## Before you open this to real users

A short, honest checklist — each of these is a real gap between "deployed" and
"ready for real people," and skipping them is how startups get burned:

- [ ] **HTTPS** — Railway provides this automatically on their domains; if you add a
      custom domain, make sure it's also serving over HTTPS, not HTTP
- [ ] **Real email/SMS verification at signup** — right now anyone can sign up with
      any email, no confirmation step. Add this before opening registration publicly
      (Twilio for SMS, or a transactional email service like Resend/Postmark for email)
- [ ] **Rate limiting** — add a package like `express-rate-limit` on the signup/login
      routes specifically, so the app can't be hammered by bots
- [ ] **Terms of Service + Privacy Policy** — real pages, linked from signup, reviewed
      by a lawyer familiar with Azerbaijan's Personal Data Law
- [ ] **A real plan for reviewing credentials promptly** — the verification system only
      works if pending submissions get reviewed within a reasonable time, or tutors will
      give up waiting
- [ ] **Backups** — set up automatic daily backups of the database once real user data
      is in it (Railway has backup add-ons, or you can script a simple cron export)
- [ ] **A way to actually reach you** — a real support email or contact method, since
      users will eventually have account issues or report problems

## What stays exactly the same code-wise

Nothing in the backend code needs to change to deploy it — this is the same server.js,
same routes, same database schema you've already tested locally. Deployment is purely
an infrastructure step, not a rewrite.
