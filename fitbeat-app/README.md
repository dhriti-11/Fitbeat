# FitBeat — Deployment Guide

This is a static site (index.html) backed by one serverless API route
(`/api/storage.js`) that persists data — users, appointments, updates,
client diet/calendar/progress data, and reviews — in a real Redis database.

## 1. The video file

Your original upload was ~135MB, which GitHub rejects (100MB limit), so
it's been compressed to `fitbeat-showcase.mp4` (960x540, ~13MB, audio
stripped since it autoplays muted anyway). This fits fine in the repo.
If you want higher quality later, re-compress with a higher resolution/
bitrate, or host it externally (Vercel Blob, Cloudinary, YouTube unlisted)
and update the two `<source src="fitbeat-showcase.mp4">` tags in
`index.html`.

## 2. Push this project to GitHub

```bash
cd fitbeat-app
git init
git add .
git commit -m "FitBeat site"
gh repo create fitbeat --private --source=. --push
# (or push to a GitHub repo you create manually)
```

## 3. Import into Vercel

1. Go to https://vercel.com/new and import the GitHub repo.
2. Framework preset: choose **Other**. No build command needed — it's static + one API route.
3. Deploy. It'll go live even without the database connected yet (storage
   calls will just fail silently until step 4).

## 4. Connect the database (Upstash Redis via Vercel Marketplace)

Vercel's own "Vercel KV" was retired in favor of Marketplace integrations.
Use Upstash Redis (free tier is plenty for this app):

1. In your Vercel project → **Storage** tab → **Marketplace Database Providers** → **Upstash** → **Redis**.
2. Create a database and connect it to this project. Vercel automatically
   injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` as environment variables
   — `api/storage.js` already reads these, no extra config needed.
3. Redeploy the project (Vercel usually prompts you to redeploy after
   connecting storage) so the new env vars take effect.

## 5. Local development

```bash
npm install
npx vercel login
npx vercel link        # link to the Vercel project you created
npx vercel env pull .env.development.local
npx vercel dev          # runs the site + /api locally on http://localhost:3000
```

## 6. Trainer login emails

Trainer vs. client routing is controlled by the `TRAINER_EMAILS` list
inside `index.html` (search for `const TRAINERS = [`). Update the six
`email:` fields to your real trainer addresses whenever you're ready —
anyone signing in with an email NOT in that list is created as a client
automatically.
