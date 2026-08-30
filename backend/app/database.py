import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

db_url = settings.database_url
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

try:
    if "mysql" in db_url:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"charset": "utf8mb4"}
        )
        # Test connection immediately
        with engine.connect() as conn:
            pass
        print(f"Connected to MySQL Database: {db_url}")
    else:
        engine = create_engine(db_url, pool_pre_ping=True)
except Exception as e:
    print(f"Primary database connection ({db_url}) failed: {e}. Using SQLite fallback for local resilience.")
    sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../luta_studio.db"))
    engine = create_engine(f"sqlite:///{sqlite_path}", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
