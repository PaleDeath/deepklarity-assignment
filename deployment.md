# Deployment Guide

Deploy your Wiki Quiz App in under 5 minutes.

## Prerequisites
- A **GitHub account**
- A **Render** account (for Backend & Database)
- A **Vercel** account (for Frontend)

---

## Step 1: Push to GitHub

1. Create a new repository on GitHub (e.g., `wiki-quiz-app`).
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   # replace with your actual repo URL
   git remote add origin https://github.com/YOUR_USERNAME/wiki-quiz-app.git
   git push -u origin main
   ```

---

## Step 2: Deploy Backend (Render)

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repo.
4. Settings:
   - **Name**: `wiki-quiz-backend`
   - **Region**: Closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` (Important!)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m gunicorn main:app -k uvicorn.workers.UvicornWorker`
     (Or if that fails: `   `)
5. **Environment Variables** (Scroll down to "Advanced" or "Env Vars"):
   - `GEMINI_API_KEY`: Paste your key
   - `PYTHON_VERSION`: `3.11.0` (optional but good)
6. **Database Setup**:
   - Render used to give free Postgres with Web Services, but now they are separate. 
   - Go to Dashboard -> **New +** -> **PostgreSQL**.
   - Create a database (e.g. `wiki-quiz-db`).
   - Copy the **Internal Database URL**.
   - Go back to your Web Service -> Environment Variables.
   - Add `DATABASE_URL`: Paste the Internal Database URL.
   - Add `PYTHONPATH`: `.`
7. Click **Create Web Service**. Wait for it to go live.
8. **Copy your backend URL** (e.g., `https://wiki-quiz-backend.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel)

1. Log in to [vercel.com](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your `wiki-quiz-app` repo.
4. **Project Settings**:
   - **Framework Preset**: Vite (should detect auto)
   - **Root Directory**: Click "Edit" and select `frontend`.
5. **Environment Variables**:
   - name: `VITE_API_URL`
   - value: Your Render Backend URL (e.g., `https://wiki-quiz-backend.onrender.com`) **without trailing slash**.
6. Click **Deploy**.

---

## Step 4: Verify

1. Open your Vercel app URL.
2. Enter a Wikipedia URL.
3. If it generates a quiz, you're done! 🎉

## Troubleshooting

- **CORS Error**: Ensure your Backend URL in Vercel is correct (check the "Network" tab in DevTools).
- **503 Error**: Check Render logs. If it says "Gemini API Error", it's the rate limit (wait for prompt retry).
- **Database Error**: Ensure `DATABASE_URL` is set in Render Env Vars.
