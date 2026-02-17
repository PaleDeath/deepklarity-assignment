import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from database import engine, get_db, Base
from models import WikiArticle, Quiz, RelatedTopic
from scraper import scrape_wikipedia, fetch_title
from quiz_generator import generate_quiz

load_dotenv()

# creates tables on startup if they dont exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wiki Quiz Generator")

# CORS: allow frontend origin(s). Set ALLOWED_ORIGINS for production (e.g. https://your-app.vercel.app).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all capable of connecting (for now)
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/generate-quiz")
def generate_quiz_endpoint(body: dict, db: Session = Depends(get_db)):
    url = body.get("url", "").strip()

    if not url or "en.wikipedia.org/wiki/" not in url:
        raise HTTPException(status_code=400, detail="Please provide a valid English Wikipedia URL")

    # check if we already have this url cached
    existing = db.query(WikiArticle).filter(WikiArticle.url == url).first()
    if existing:
        return build_response(existing)

    try:
        scraped = scrape_wikipedia(url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to fetch the Wikipedia page: {str(e)}")

    try:
        quiz_data = generate_quiz(scraped["title"], scraped["content"])
    except ValueError as e:
        msg = str(e)
        if "quota" in msg.lower() or "rate limit" in msg.lower():
            raise HTTPException(status_code=503, detail=msg)
        raise HTTPException(status_code=500, detail=msg)
    except Exception as e:
        # this catches gemini rate limits, timeouts, etc
        raise HTTPException(status_code=503, detail=f"Gemini API error: {str(e)}")

    # save everything to db
    article = WikiArticle(
        url=url,
        title=quiz_data.get("title") or scraped["title"],
        summary=quiz_data.get("summary", ""),
        key_entities=quiz_data.get("key_entities", {"people": [], "organizations": [], "locations": []}),
        sections=quiz_data.get("sections") or scraped["sections"],
        raw_html=scraped.get("raw_html")
    )
    db.add(article)
    db.flush()

    for q in quiz_data.get("quiz", []):
        db.add(Quiz(
            article_id=article.id,
            question=q["question"],
            options=q["options"],
            correct_answer=q["answer"],
            explanation=q["explanation"],
            difficulty=q.get("difficulty", "medium")
        ))

    for topic in quiz_data.get("related_topics", []):
        db.add(RelatedTopic(article_id=article.id, topic_name=topic))

    db.commit()
    db.refresh(article)
    return build_response(article)


@app.get("/preview")
def preview_url(url: str):
    """quick endpoint to grab just the article title for the url preview"""
    if "en.wikipedia.org/wiki/" not in url:
        raise HTTPException(status_code=400, detail="Not a Wikipedia URL")
    title = fetch_title(url)
    if not title:
        raise HTTPException(status_code=404, detail="Couldn't fetch title")
    return {"title": title}


@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    articles = db.query(WikiArticle).order_by(WikiArticle.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "url": a.url,
            "title": a.title,
            "quiz_count": len(a.quizzes),
            "created_at": a.created_at.isoformat()
        }
        for a in articles
    ]


@app.get("/quiz/{article_id}")
def get_quiz(article_id: int, db: Session = Depends(get_db)):
    article = db.query(WikiArticle).filter(WikiArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return build_response(article)


@app.delete("/quiz/{article_id}")
def delete_quiz(article_id: int, db: Session = Depends(get_db)):
    article = db.query(WikiArticle).filter(WikiArticle.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(article)
    db.commit()
    return {"deleted": True}


def build_response(article):
    return {
        "id": article.id,
        "url": article.url,
        "title": article.title,
        "summary": article.summary,
        "key_entities": article.key_entities,
        "sections": article.sections,
        "quiz": [
            {
                "id": q.id,
                "question": q.question,
                "options": q.options,
                "answer": q.correct_answer,
                "difficulty": q.difficulty,
                "explanation": q.explanation
            }
            for q in article.quizzes
        ],
        "related_topics": [t.topic_name for t in article.related_topics],
        "created_at": article.created_at.isoformat()
    }
