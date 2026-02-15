from database import engine, Base
from models import WikiArticle, Quiz, RelatedTopic

print("Resetting database...")
# dropping all tables to force schema update
Base.metadata.drop_all(bind=engine)
# recreating them with the new columns
Base.metadata.create_all(bind=engine)
print("Database reset complete! Tables recreated with new schema.")
