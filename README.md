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

## Screenshots

*(Drop in a few screenshots here for a quick visual of the app.)*

- **Tab 1 — Generate Quiz:** URL input, “Generate Quiz” button, and the quiz + related topics once it’s ready.
- **Tab 2 — Past Quizzes:** Table of previous quizzes with title, question count, date (DD/MM/YYYY), and Details / Delete.
- **Details modal:** Same quiz layout as on the generate tab (title, summary, entities, sections, questions with options and explanations, related topics).

---

## Quick notes

- First run for a URL can take 10–15 seconds (scrape + AI). Same URL later is instant from the DB.
- Only **English Wikipedia** URLs (`en.wikipedia.org/wiki/...`) are supported.
- If you hit rate limits on the AI provider, wait a bit or switch provider/keys in `.env`.
