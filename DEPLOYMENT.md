# Deployment Guide for Developer Productivity Analyzer

## Deploy Backend to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy Backend
```bash
cd backend
vercel
```
Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? **productivity-backend** (or any name)
- Directory? **./** (current directory)

### Step 3: Set Environment Variable
After deployment, go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

Add:
- **Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://behraanuj_db_user:EvT2xhRIOu0iv7cf@cluster0.a1gppft.mongodb.net/productivity?retryWrites=true&w=majority`

### Step 4: Get Your Backend URL
After deployment, Vercel will give you a URL like:
```
https://productivity-backend-xxx.vercel.app
```

---

## Deploy Frontend to Vercel

### Step 1: Update API URLs in Frontend

Update `frontend/src/tracker.js` and `frontend/src/dashboard.js`:
Replace `http://localhost:5001` with your Vercel backend URL.

### Step 2: Deploy Frontend
```bash
cd frontend
vercel
```

---

## Alternative: Deploy Frontend to GitHub Pages

### Step 1: Add homepage to package.json
Add this to `frontend/package.json`:
```json
"homepage": "https://yourusername.github.io/productivity-analyzer"
```

### Step 2: Install gh-pages
```bash
cd frontend
npm install gh-pages --save-dev
```

### Step 3: Add deploy scripts to package.json
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build",
  ...
}
```

### Step 4: Deploy
```bash
npm run deploy
```

---

## Quick Summary

| Component | Deploy To | Command |
|-----------|-----------|---------|
| Backend | Vercel | `cd backend && vercel` |
| Frontend | Vercel | `cd frontend && vercel` |
| Frontend | GitHub Pages | `cd frontend && npm run deploy` |

**Note:** For GitHub Pages, you still need to host the backend on Vercel/Render since GitHub Pages only serves static files.
