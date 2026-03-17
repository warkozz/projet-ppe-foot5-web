# Football Manager 5v5 - Extension Web

🎯 **Status**: Projet **COMPLET** et opérationnel ✅  
📅 **Dernière MAJ**: 17 mars 2026  
🚀 **API**: http://localhost:8000 | **Frontend**: http://localhost:3000

## Description

Extension web pour l'application de gestion de terrains de football 5v5. Le backend FastAPI et le frontend React sont entièrement développés et synchronisés avec l'application desktop existante via une base de données MySQL partagée.

## ✅ État du Projet

### 🎉 Backend (TERMINÉ)
- ✅ API FastAPI complète et testée
- ✅ Authentification JWT compatible desktop
- ✅ Gestion des réservations avec détection conflits
- ✅ Tarif horaire (`price`) sur les terrains
- ✅ Calcul automatique du coût total (`total_cost`) à la réservation
- ✅ Quota hebdomadaire : 2 réservations max sur 7 jours glissants (configurable)
- ✅ Capacité de terrain (`capacity`) dynamique
- ✅ Synchronisation parfaite base de données
- ✅ Tests fonctionnels (API + logique métier)
- ✅ Documentation technique complète

### 🎉 Frontend (TERMINÉ)
- ✅ Interface React + TypeScript + Tailwind CSS
- ✅ Authentification (inscription / connexion / profil)
- ✅ Parcours de réservation en 3 étapes
- ✅ Affichage du coût total avant confirmation
- ✅ Affichage dynamique du format terrain (5v5, 7v7…) et du tarif/h
- ✅ Mon Espace : historique avec filtres statut + tri date
- ✅ Message d’erreur de quota dans le formulaire de réservation
- ✅ Pages légales (CGU, confidentialité, mentions légales)

## Stack Technique

- **Backend**: FastAPI + SQLAlchemy + MySQL ✅
- **Frontend**: React + TypeScript + Tailwind CSS ✅
- **Database**: MySQL (partagée avec app desktop) ✅
- **Auth**: JWT + Bcrypt ✅
- **Tests**: pytest + requests ✅

## Architecture

```
projet-ppe-foot5-web/
├── backend/              # ✅ API FastAPI
│   ├── app/
│   │   ├── models/       # User, Terrain (price, capacity), Reservation (total_cost)
│   │   ├── routes/       # Auth, Terrains, Reservations
│   │   ├── schemas/      # Validation Pydantic
│   │   ├── services/     # Logique métier
│   │   └── utils/        # Hashing, JWT, config
│   ├── main.py
│   └── requirements.txt
└── frontend/             # ✅ App React
    ├── src/
    │   ├── pages/        # Accueil, Terrains, Réservation, Mon Espace, Profil
    │   ├── components/   # Navigation, Footer, UI (Button, Badge, Alert…)
    │   ├── contexts/     # AuthContext
    │   ├── services/     # api.ts (Axios)
    │   └── types/        # Interfaces TypeScript
    └── package.json
```

## 🚀 Démarrage Rapide

### Backend
```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm start
```

## 🗄️ Base de Données

**Synchronisation Parfaite** : L'API utilise la base MySQL `foot5` **existante** ✅

### Tables Partagées

**terrains**
- `price` (DECIMAL 10,2) — Tarif horaire en euros *(ajouté mars 2026)*
- `capacity` (INT) — Nombre total de joueurs, ex: 10 = 5v5 *(ajouté mars 2026)*

**reservations**
- `total_cost` (DECIMAL 10,2) — Coût calculé à la création *(ajouté mars 2026)*

### Scripts SQL appliqués
```sql
ALTER TABLE terrains ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE terrains ADD COLUMN capacity INT DEFAULT 10;
ALTER TABLE reservations ADD COLUMN total_cost DECIMAL(10,2) DEFAULT 0.00;
```

### Compatibilité Desktop
- ✅ Même schéma de base de données
- ✅ Hash passwords compatibles (Bcrypt 12 rounds)
- ✅ Nouvelles colonnes avec DEFAULT — pas d’impact sur l’app desktop

## 🔧 Configuration

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foot5
DB_USER=root
DB_PASSWORD=
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
MAX_WEEKLY_RESERVATIONS=2
```

## 📡 API Endpoints

**Base URL**: http://localhost:8000  
**Docs interactives**: http://localhost:8000/docs

### 🔐 Authentification
- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion
- `GET /api/auth/me` — Profil utilisateur
- `PUT /api/auth/me` — Modifier profil
- `PUT /api/auth/me/password` — Changer mot de passe
- `POST /api/auth/refresh` — Renouveler token

### 🏙️ Terrains
- `GET /api/terrains` — Liste des terrains actifs (public)
- `GET /api/terrains/{id}` — Détail d'un terrain
- `POST /api/terrains` — Créer *(admin)*
- `PUT /api/terrains/{id}` — Modifier *(admin)*
- `DELETE /api/terrains/{id}` — Supprimer *(admin)*
- `PATCH /api/terrains/{id}/toggle-active` — Activer/Désactiver *(admin)*

### 📅 Réservations
- `GET /api/reservations` — Mes réservations (admin : toutes)
- `POST /api/reservations` — Créer *(quota 2/semaine vérifié, coût calculé auto)*
- `GET /api/reservations/{id}` — Détail
- `PUT /api/reservations/{id}` — Modifier
- `DELETE /api/reservations/{id}` — Annuler
- `PATCH /api/reservations/{id}/confirm` — Confirmer *(admin)*
- `GET /api/reservations/availability/slots/{terrain_id}?date=` — Créneaux disponibles
- `GET /api/reservations/availability/terrain/{terrain_id}?date=` — Planning complet

## 📚 Documentation

**📁 Toute la documentation est dans [`docs/`](docs/)**

- [🔧 API Backend](docs/BACKEND_API.md) — Documentation technique complète
- [✅ Status Backend](docs/BACKEND_STATUS.md) — État des fonctionnalités
- [📊 Historique projet](docs/PROJECT_HISTORY.md) — Phases de développement


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