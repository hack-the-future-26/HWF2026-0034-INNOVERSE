import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/smart_queue_db")

# Fallback to local SQLite file if psycopg2 is not installed or when running quick verification
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
except Exception:
    # Development fallback to SQLite database on C: directory with free disk space
    user_home = os.path.expanduser("~")
    db_dir = os.path.join(user_home, ".gemini", "antigravity-ide", "brain", "a9d22a02-f649-436b-ad7c-c15fd4d8a9c7", "scratch")
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, "smart_queue_dev.db").replace("\\", "/")
    sqlite_url = f"sqlite:///{db_path}"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
