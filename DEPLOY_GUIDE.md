# 🚀 Vocabix AI — Deployment Guide

## What's Changed from Previous Version
- ✅ Name changed: **Lexify → Vocabix AI**
- ✅ Logo updated (your V logo applied everywhere)
- ✅ Color theme: Purple → **Teal/Green** (matching your logo)
- ✅ AI changed: **Anthropic → Google Gemini** (FREE, no credit card!)
- ✅ Mobile layout: **Bottom navigation bar** (like a real app)
- ✅ PWA improved: Better service worker, proper icons
- ✅ All grids mobile-responsive (2-col on phone, 4-col on desktop)
- ✅ Safe area support (notch phones like iPhone)
- ✅ Fixed all broken Lexify name references

---

## Step 1 — Get FREE Gemini API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with Google
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)
5. It's **completely FREE** — 15 req/min, 1500 req/day

---

## Step 2 — Deploy Backend (Railway / Render)

### Railway (Recommended — Free tier)
1. Go to **railway.app**, create account
2. New Project → Deploy from GitHub repo → select your backend folder
3. Add environment variables:
   ```
   DATABASE_URL = (Railway gives you PostgreSQL free)
   JWT_SECRET   = any_long_random_string_here
   GEMINI_API_KEY = AIza...your_key_here
   PORT         = 5000
   NODE_ENV     = production
   ```
4. Railway auto-deploys on push

### Render (Alternative Free)
1. Go to **render.com**
2. New → Web Service → connect GitHub
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add same environment variables

---

## Step 3 — Deploy Frontend (Vercel)

1. Go to **vercel.com**, sign in with GitHub
2. New Project → Import your frontend folder
3. Framework: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.railway.app
   ```
5. Deploy!

---

## Step 4 — Database Setup

Run `database_setup.sql` on your PostgreSQL database.
Railway provides free PostgreSQL — just click "Add PostgreSQL" in your project.

---

## Common Errors & Fixes

### "AI feature unavailable"
→ Check that `GEMINI_API_KEY` is set correctly in backend env vars
→ Make sure key starts with `AIza` and has no spaces

### "Cannot connect to API"  
→ In your frontend, make sure API calls go to your backend URL
→ If using Vercel + Railway, add your Railway URL to CORS in backend

### App not loading on mobile
→ Make sure `manifest.json` is in the `public` folder
→ Check that `logo.png` exists in `public` folder

### PWA install button not showing
→ Must be served over HTTPS (Vercel/Railway both do this)
→ Clear browser cache and revisit

---

## PWA — Install as Mobile App

After deploying:
1. Open the website on your phone browser
2. Android Chrome: Menu → **"Add to Home Screen"**
3. iOS Safari: Share button → **"Add to Home Screen"**
4. The app will open like a native app with no browser bar!

---

## Free Resources Used
- **Vercel** — Frontend hosting (free)
- **Railway** — Backend + PostgreSQL (free tier)
- **Google Gemini** — AI API (free tier, 1500 req/day)
- **Dictionary API** — Words from your database

Good luck! 🎉
