import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import get_settings

# Charger la configuration
settings = get_settings()

# URL de connexion à la base de données
DATABASE_URL = settings.DATABASE_URL

# Créer l'engine SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# Créer la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()

# Dépendance pour obtenir la session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()