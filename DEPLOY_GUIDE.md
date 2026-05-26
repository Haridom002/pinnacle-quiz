# ═══════════════════════════════════════════════════════════════
# PINNACLE QUIZ — COMPLETE DEPLOYMENT GUIDE
# GitHub + Vercel + Supabase — Step by Step
# ═══════════════════════════════════════════════════════════════

---

## OVERVIEW

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Vercel    │────▶│  Supabase   │
│  (code)     │     │  (hosting)  │     │ (DB + Auth) │
└─────────────┘     └─────────────┘     └─────────────┘

Total time: ~25 minutes
Cost: FREE on all three platforms

---

## PART 1 — SUPABASE SETUP (10 min)

### Step 1.1 — Create Supabase account
1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Click "New project"
4. Fill in:
   - Organization: your name or school name
   - Project name: pinnacle-quiz
   - Database password: create a STRONG password (save it!)
   - Region: pick closest to Ghana (Europe West)
5. Click "Create new project" — wait ~2 minutes

### Step 1.2 — Run the database schema
1. In Supabase dashboard → click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy the ENTIRE contents of: src/lib/supabase-schema.sql
4. Paste it into the editor
5. Click "Run" (green button)
6. You should see: "Success. No rows returned"

### Step 1.3 — Get your API keys
1. In Supabase dashboard → Settings (gear icon, bottom left)
2. Click "API" in the settings menu
3. Copy these two values — you'll need them later:
   - Project URL:  https://xxxxxxxxxxxx.supabase.co
   - anon public:  eyJhbGci... (long string)

### Step 1.4 — Enable Google OAuth (optional but recommended)
1. Supabase dashboard → Authentication → Providers
2. Find "Google" → toggle it ON
3. Leave the page open — you'll need to come back here

   Meanwhile, set up Google OAuth:
   a. Go to https://console.cloud.google.com
   b. Create new project → name it "PinnacleQuiz"
   c. APIs & Services → Credentials → "Create Credentials" → "OAuth 2.0 Client ID"
   d. Application type: Web application
   e. Name: PinnacleQuiz
   f. Authorized JavaScript origins: (leave empty for now)
   g. Authorized redirect URIs: (leave empty for now)
   h. Click Create → Copy the Client ID and Client Secret
   
   Back in Supabase → Google provider:
   - Paste Client ID
   - Paste Client Secret
   - Copy the "Callback URL" shown (you'll add it to Google later)
   - Click Save

### Step 1.5 — Configure Auth settings
1. Supabase → Authentication → URL Configuration
2. Site URL: http://localhost:5173 (for now — update after Vercel deploy)
3. Redirect URLs: add http://localhost:5173/**
4. Click Save

---

## PART 2 — LOCAL SETUP (5 min)

### Step 2.1 — Install Node.js
1. Go to https://nodejs.org
2. Download the LTS version (green button)
3. Install it — accept all defaults
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Type: node --version  → should show v18 or higher

### Step 2.2 — Unzip and prepare the project
1. Unzip pinnacle-quiz-FINAL.zip to a folder on your desktop
2. Open Terminal and navigate to that folder:
   cd Desktop/smart-calc-arena

3. Install dependencies:
   npm install

4. Create your environment file:
   Copy .env.example to a new file called .env.local
   
   Open .env.local and fill it in:
   
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   
   (Use the values you copied in Step 1.3)

5. Test locally:
   npm run dev
   
   Open http://localhost:5173 in your browser
   The app should load! Try signing up.

---

## PART 3 — GITHUB SETUP (5 min)

### Step 3.1 — Create GitHub account
1. Go to https://github.com
2. Sign up for a free account
3. Verify your email

### Step 3.2 — Create a new repository
1. Click the "+" icon (top right) → "New repository"
2. Repository name: pinnacle-quiz
3. Description: PinnacleQuiz — Pinnacle Educational Centre
4. Set to Public (or Private — both work with Vercel)
5. Do NOT initialize with README (we have our own files)
6. Click "Create repository"
7. Copy the repository URL shown (e.g. https://github.com/yourname/pinnacle-quiz.git)

### Step 3.3 — Push your code to GitHub
In your Terminal (inside the smart-calc-arena folder):

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial PinnacleQuiz commit - Pinnacle Educational Centre"

# Connect to GitHub (paste your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/pinnacle-quiz.git

# Push to GitHub
git branch -M main
git push -u origin main
```

4. Go to https://github.com/YOUR_USERNAME/pinnacle-quiz
   You should see all your files there!

---

## PART 4 — VERCEL DEPLOYMENT (5 min)

### Step 4.1 — Create Vercel account
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel

### Step 4.2 — Import your project
1. On Vercel dashboard → click "Add New..." → "Project"
2. Find pinnacle-quiz in the list → click "Import"
3. Framework Preset: Vite (auto-detected)
4. Root Directory: leave as ./ (or smart-calc-arena if needed)
5. Build Command: npm run build
6. Output Directory: dist

### Step 4.3 — Add environment variables (CRITICAL!)
Before clicking Deploy, scroll down to "Environment Variables":

Click "Add" for each one:

Name: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co

Name: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGci... (your anon key)

### Step 4.4 — Deploy!
1. Click "Deploy" (blue button)
2. Wait ~2 minutes
3. You'll see: "🎉 Congratulations! Your project has been deployed."
4. Click "Visit" to see your live site
5. Copy your URL: https://pinnacle-quiz-xxx.vercel.app

---

## PART 5 — CONNECT EVERYTHING (3 min)

### Step 5.1 — Update Supabase with your live URL
1. Supabase → Authentication → URL Configuration
2. Site URL: https://pinnacle-quiz-xxx.vercel.app
3. Redirect URLs — add:
   - https://pinnacle-quiz-xxx.vercel.app/**
   - https://pinnacle-quiz-xxx.vercel.app
4. Click Save

### Step 5.2 — Update Google OAuth (if you set it up)
1. Go to https://console.cloud.google.com
2. Your OAuth 2.0 Client → Edit
3. Authorized JavaScript origins — add:
   https://pinnacle-quiz-xxx.vercel.app
4. Authorized redirect URIs — add:
   https://your-project.supabase.co/auth/v1/callback
   (This is the Callback URL from Supabase Step 1.4)
5. Click Save

### Step 5.3 — Test everything
1. Open your Vercel URL in a browser
2. Try: Sign Up with email → verify email → Sign In ✓
3. Try: Google Sign In ✓
4. Try: Play a quiz ✓
5. Try: Open Math Arena ✓
6. Try: Host a Live Game → get a code ✓
7. Open another tab → Join with the code ✓

---

## PART 6 — FUTURE UPDATES

Every time you make changes to the code:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Vercel automatically redeploys within ~1 minute!

---

## TROUBLESHOOTING

### "Missing Supabase credentials" error
→ Check your .env.local file has the correct keys
→ On Vercel, check Environment Variables are set correctly
→ Redeploy after adding env vars

### Google Sign In not working
→ Check your Google OAuth redirect URI matches exactly
→ Make sure your Vercel domain is in the authorized origins
→ Check Supabase Google provider is enabled and saved

### Music not playing
→ Your browser may be blocking autoplay
→ Click anywhere on the page first (user gesture required)
→ Click the 🎵 button → click ▶ Play
→ Chrome: click the lock icon in address bar → Allow autoplay
→ Or upload your own songs using the 🎵 → "Custom Audio" feature

### "Row Level Security" errors in Supabase
→ Make sure you ran the FULL supabase-schema.sql
→ Check the SQL editor for any error messages
→ Re-run just the RLS policies section

### Blank screen on Vercel
→ Check Vercel deployment logs for errors
→ Make sure VITE_ prefix is on all env variable names
→ Make sure build command is: npm run build
→ Make sure output directory is: dist

---

## CUSTOM DOMAIN (Optional)

To use your own domain (e.g. quiz.pinnacleghana.edu.gh):

1. Vercel → your project → Settings → Domains
2. Add your domain
3. Vercel shows DNS records to add
4. Go to your domain registrar → DNS settings
5. Add the CNAME or A record shown by Vercel
6. Wait 24 hours for DNS to propagate
7. Vercel auto-adds HTTPS/SSL certificate for free

---

## ENVIRONMENT VARIABLES REFERENCE

| Variable | Where to find | Required |
|---|---|---|
| VITE_SUPABASE_URL | Supabase → Settings → API → Project URL | YES |
| VITE_SUPABASE_ANON_KEY | Supabase → Settings → API → anon public | YES |

Note: NEVER share or commit these keys publicly.
The anon key is safe for client-side use (Supabase designed it that way).
Your .env.local is already in .gitignore so it won't be uploaded to GitHub.

---

## SUPPORT CONTACTS

Supabase Docs:   https://supabase.com/docs
Vercel Docs:     https://vercel.com/docs
GitHub Docs:     https://docs.github.com
Vite Docs:       https://vitejs.dev/guide

---
Built for Pinnacle Educational Centre · Veritas et Virtus · EST 2009
