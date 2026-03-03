from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuration et imports
try:
    from app.models.database import engine, Base
    # Import des modèles pour créer les tables
    from app.models import user, terrain, reservation
    from app.routes import auth, terrains, reservations
    print("✅ All imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    raise

# Créer les tables dans la base de données
Base.metadata.create_all(bind=engine)

# Initialiser l'application FastAPI
app = FastAPI(
    title="Football Manager 5v5 API",
    description="API pour la gestion des réservations de terrains de football",
    version="1.0.0"
)

# Configuration CORS - DOIT être avant les routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Inclure les routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(terrains.router, prefix="/api/terrains", tags=["Terrains"])
app.include_router(reservations.router, prefix="/api/reservations", tags=["Reservations"])

@app.get("/")
def read_root():
    return {"message": "Football Manager 5v5 API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}