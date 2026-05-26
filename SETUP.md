# PinnacleQuiz — Setup Guide
## GitHub + Vercel + Supabase Deployment

---

## 1. Supabase Setup

### A) Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `pinnacle-quiz`, choose your region

### B) Run Database Schema
1. Dashboard → SQL Editor → New Query
2. Paste the entire contents of `src/lib/supabase-schema.sql`
3. Click **Run**

### C) Enable Google OAuth
1. Dashboard → Authentication → Providers → **Google** → Enable
2. Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://your-app.vercel.app` (add localhost:5173 for dev)
   - Authorized redirect URIs: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client Secret** back to Supabase → Google provider → Save

### D) Get Your API Keys
1. Dashboard → Settings → API
2. Copy **Project URL** and **anon public** key

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project-id.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Start dev server
npm run dev
```

---

## 3. GitHub Setup

```bash
git init
git add .
git commit -m "Initial PinnacleQuiz commit"
git remote add origin https://github.com/YOUR_USERNAME/pinnacle-quiz.git
git push -u origin main
```

---

## 4. Vercel Deployment

1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select your `pinnacle-quiz` repo
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. **Environment Variables** — add both:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
7. Click **Deploy**

After deploy, add your Vercel domain to:
- Supabase → Authentication → URL Configuration → Site URL: `https://your-app.vercel.app`
- Supabase → Authentication → URL Configuration → Redirect URLs: `https://your-app.vercel.app/**`
- Google Cloud Console → Authorized JavaScript origins

---

## 5. Environment Variables Summary

| Variable | Where to find |
|----------|--------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

---

## 6. User Roles

| Role | Can do |
|------|--------|
| **Student** | Play quizzes, join lobbies, use Math Arena, earn XP |
| **Teacher** | Everything above + create quizzes, host games, view analytics |
| **Parent** | View child's progress dashboard |

---

## Supabase Authentication Flow

```
User visits site → AuthGuard → checks session
  ├─ No session → AuthPage (Landing / Sign In / Sign Up)
  │     ├─ Google OAuth → redirect → callback → profile upsert → app
  │     └─ Email/Password → sign up → verify email → sign in → app
  └─ Has session → fetch profile from profiles table → render app
```
