from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class WikiArticle(Base):
    __tablename__ = "wiki_articles"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500), unique=True)
    title = Column(String(300))
    summary = Column(Text)
    key_entities = Column(JSON)
    sections = Column(JSON)
    raw_html = Column(Text, nullable=True)  # storing the raw html for reference
    created_at = Column(DateTime, default=datetime.utcnow)

    quizzes = relationship("Quiz", back_populates="article", cascade="all, delete")
    related_topics = relationship("RelatedTopic", back_populates="article", cascade="all, delete")


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("wiki_articles.id"))
    question = Column(Text)
    options = Column(JSON)  # always 4 options
    correct_answer = Column(String(300))
    explanation = Column(Text)
    difficulty = Column(Enum("easy", "medium", "hard", name="difficulty_enum"))

    article = relationship("WikiArticle", back_populates="quizzes")


class RelatedTopic(Base):
    __tablename__ = "related_topics"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("wiki_articles.id"))
    topic_name = Column(String(200))

    article = relationship("WikiArticle", back_populates="related_topics")
