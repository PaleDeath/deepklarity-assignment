# Wiki Quiz Generator

Paste a Wikipedia link, get a quiz. This app scrapes the article, sends the text to an AI, and gives you a ready-made quiz with questions, options, explanations, and related topics. You can study with answers visible or take the quiz and get scored.

---

## Tech stack

- **Backend:** Python, FastAPI, SQLAlchemy, BeautifulSoup, LangChain  
- **LLM:** Google Gemini or Groq (configurable via env)  
- **Frontend:** React 18, Vite, Tailwind CSS v4, Axios  
- **Database:** PostgreSQL  

---

## Features

- **Generate quiz** — Enter any English Wikipedia URL and get 5–10 multiple-choice questions (4 options each), with correct answer, short explanation, and difficulty (easy / medium / hard).
- **Study mode** — See the right answers and explanations while you read.
- **Take quiz** — Hide answers, pick options, then check your score.
- **Quiz history** — All generated quizzes are saved; open the Past Quizzes tab to see the list.
- **Details modal** — Click “Details” on any history row to open the full quiz in the same layout as on the generate tab.
- **URL preview** — While you type a valid Wikipedia URL, the app fetches and shows the article title.
- **Caching** — Same URL is not scraped again; the stored quiz is returned from the database.
- **Related topics** — Each quiz suggests Wikipedia topics for further reading, with links.

---

## How to run locally

### 1. Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Windows (CMD):** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

Then:

```bash
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` — e.g. `postgresql://postgres:yourpassword@localhost:5432/wiki_quiz`
- For AI: either `GEMINI_API_KEY` (and optionally `LLM_PROVIDER=gemini`) or `GROQ_API_KEY` and `LLM_PROVIDER=groq`

Create the database (if it doesn’t exist):

```bash
createdb wiki_quiz
```

Start the API:

```bash
uvicorn main:app --reload --port 8000
```

The API will be at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`. Make sure the backend is running on port 8000 so generate and history work.

---

## Deployment (both frontend and backend)

Deploy **backend first** so you have an API URL, then deploy the **frontend** and point it at that URL.

### 1. Backend on Render

1. Go to [dashboard.render.com](https://dashboard.render.com), sign in, and click **New** → **Blueprint**.
2. Connect your GitHub account and select the repo **PaleDeath/deepklarity-assignment** (branch `main`). Render will read `render.yaml` from the root.
3. Click **Apply**. Render will create a **PostgreSQL** database and a **Web Service** (the FastAPI app) in the `backend` folder.
4. In the **wiki-quiz-api** service, open **Environment** and set:
   - **GROQ_API_KEY** — your Groq API key (from [console.groq.com](https://console.groq.com)).
   - **ALLOWED_ORIGINS** — leave empty for now; you’ll set it to your Vercel URL after step 2.
5. Wait for the first deploy to finish. Copy the service URL (e.g. `https://wiki-quiz-api-xxxx.onrender.com`).
6. Add **ALLOWED_ORIGINS** = `https://your-vercel-app.vercel.app` (you’ll get this after deploying the frontend; use the exact URL Vercel gives you). Save so the backend allows CORS from the frontend.

### 2. Frontend on Vercel

**Option A — Dashboard (recommended)**

1. Go to [vercel.com](https://vercel.com), sign in, **Add New** → **Project**.
2. Import **PaleDeath/deepklarity-assignment**. Set **Root Directory** to `frontend`.
3. Under **Environment Variables** add:
   - **Name:** `VITE_API_URL`  
   - **Value:** your Render API URL from step 1 (e.g. `https://wiki-quiz-api-xxxx.onrender.com`) — no trailing slash.
4. Deploy. Note your frontend URL (e.g. `https://deepklarity-assignment.vercel.app`).
5. In Render, set **ALLOWED_ORIGINS** to that Vercel URL and redeploy the backend if you hadn’t set it earlier.

**Option B — CLI from your machine**

From a terminal (in the project):

```bash
cd frontend
npx vercel link --yes --scope paledeaths-projects
npx vercel env add VITE_API_URL
```
Enter your Render API URL when prompted, then:

```bash
npx vercel --prod
```

Use the production URL Vercel prints. Then set **ALLOWED_ORIGINS** in Render to that URL (see step 1.6).

---

## Screenshots

<img width="1100" height="840" alt="image" src="https://github.com/user-attachments/assets/c32867b4-4712-41bc-9f9f-98bf6d892bcf" />
<img width="1465" height="705" alt="image" src="https://github.com/user-attachments/assets/86aa07c9-40da-495d-a747-e477480d2b99" />
<img width="1485" height="599" alt="image" src="https://github.com/user-attachments/assets/994dcccb-e9c1-45ec-9413-e71ffdc67736" />
<img width="1100" height="840" alt="image" src="https://github.com/user-attachments/assets/1480abeb-e197-4f54-ad4b-ac45a8db0e87" />




---

## Quick notes

- First run for a URL can take 10–15 seconds (scrape + AI). Same URL later is instant from the DB.
- Only **English Wikipedia** URLs (`en.wikipedia.org/wiki/...`) are supported.
- If you hit rate limits on the AI provider, wait a bit or switch provider/keys in `.env`.
