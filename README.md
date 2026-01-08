# Football Manager 5v5 - Extension Web

🎯 **Status**: Backend FastAPI **COMPLET** et opérationnel ✅  
📅 **Dernière MAJ**: 8 janvier 2026  
🚀 **API**: http://localhost:8000 (fonctionnelle)

## Description

Extension web pour l'application de gestion de terrains de football 5v5. Le **backend FastAPI est entièrement terminé** et synchronisé avec l'application desktop existante via une base de données MySQL partagée.

## ✅ État du Projet

### 🎉 Backend (TERMINÉ)
- ✅ API FastAPI complète et testée
- ✅ Authentification JWT compatible desktop
- ✅ Gestion des réservations avec détection conflits
- ✅ Synchronisation parfaite base de données
- ✅ Tests fonctionnels (API + logique métier)
- ✅ Documentation technique complète

### 🔄 Frontend (À DÉVELOPPER)
- ⏳ Interface React à créer
- ⏳ Components UI à implémenter
- ⏳ Integration avec l'API backend

## Stack Technique

- **Backend**: FastAPI + SQLAlchemy + MySQL ✅
- **Frontend**: React + TypeScript ⏳
- **Database**: MySQL (partagée avec app desktop) ✅
- **Auth**: JWT + Bcrypt ✅
- **Tests**: pytest + requests ✅

## Architecture Actuelle

```
projet-ppe-foot5-web/
├── backend/              # ✅ API FastAPI (COMPLET)
│   ├── app/
│   │   ├── models/       # User, Terrain, Reservation
│   │   ├── routes/       # Auth, Terrains, Reservations
│   │   ├── schemas/      # Validation Pydantic
│   │   ├── services/     # Logique métier
│   │   └── utils/        # Hashing, config
│   ├── main.py
│   ├── test_api.py       # Tests API
│   ├── test_logic.py     # Tests métier
│   └── requirements.txt
└── frontend/             # ⏳ À CRÉER
    └── [React app à développer]
```

## 🚀 Démarrage Rapide

### Backend (Prêt à l'emploi)
```bash
cd backend

# Démarrer l'API
start_api.bat
# OU: py -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Tester l'API
run_tests.bat
# OU: py test_api.py && py test_logic.py
```

### Frontend (À développer)
```bash
# Prochaine étape
npx create-react-app frontend --template typescript
cd frontend
npm install axios react-router-dom
npm start
```

## 🗄️ Base de Données

**Synchronisation Parfaite** : L'API utilise la base MySQL `foot5` **existante** ✅

### Tables Partagées
- `users` - Utilisateurs (auth compatible desktop)
- `terrains` - Terrains de sport  
- `reservations` - Réservations (structure adaptée)

### Compatibilité Desktop
- ✅ Même schéma de base de données
- ✅ Hash passwords compatibles (Bcrypt 12 rounds)
- ✅ Structure `start`/`end` datetime pour réservations
- ✅ Pas de modification de structure requise

## 🔧 Configuration

### Variables d'environnement
Le fichier `.env` est créé automatiquement avec :
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foot5
DB_USER=root
DB_PASSWORD=
JWT_SECRET_KEY=generated-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Scripts de Démarrage
- `start_api.bat` - Démarre l'API FastAPI
- `run_tests.bat` - Lance tous les tests

## 📡 API Endpoints

**Base URL**: http://localhost:8000

### 🔐 Authentication
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/profile` - Profil utilisateur

## 📚 Documentation

**📁 Toute la documentation est organisée dans le dossier [`docs/`](docs/)**

- [📋 Index des documents](docs/README.md) - Vue complète de la documentation
- [🎯 Cahier des charges](docs/PROMPT_EXTENSION_WEB.md) - Spécifications du projet
- [📊 Historique projet](docs/PROJECT_HISTORY.md) - Phases de développement
- [🔧 API Backend](docs/BACKEND_API.md) - Documentation technique complète
- [✅ Status Backend](docs/BACKEND_STATUS.md) - État des fonctionnalités

## 📋 Prochaines Étapes

### Phase 1: Frontend React
1. Créer l'application React TypeScript
2. Implémenter les components UI (Login, Dashboard, Booking)
3. Intégrer l'API backend existante
4. Styling avec Tailwind CSS

### Phase 2: Déploiement
1. Configuration production
2. Tests d'intégration
3. Documentation utilisateur