# Football Manager 5v5 - Web Extension API

## Vue d'ensemble

Cette API FastAPI sert d'extension web pour l'application desktop Football Manager 5v5. Elle utilise la **même base de données MySQL** que l'application desktop pour assurer une synchronisation parfaite des données.

## Architecture

```
backend/
├── app/
│   ├── models/          # Modèles SQLAlchemy (User, Terrain, Reservation)
│   ├── routes/          # Routes API (auth, terrains, reservations)
│   ├── schemas/         # Schémas Pydantic pour validation
│   ├── services/        # Logique métier
│   └── utils/          # Utilitaires (hashing, etc.)
├── main.py             # Point d'entrée FastAPI
├── test_api.py         # Tests API complets
└── test_logic.py       # Tests logique métier
```

## Base de données partagée

### Structure des tables

**users**
- `id` (INT, PRIMARY KEY)
- `username` (VARCHAR, UNIQUE)
- `email` (VARCHAR, UNIQUE) 
- `password_hash` (TEXT) - Bcrypt avec 12 rounds
- `role` (ENUM: 'user', 'admin')
- `active` (BOOLEAN)

**terrains**
- `id` (INT, PRIMARY KEY)
- `name` (VARCHAR)
- `location` (VARCHAR)
- `active` (BOOLEAN)
- `price` (DECIMAL 10,2) — Tarif horaire €
- `capacity` (INT) — Nb joueurs (10 = 5v5)

**reservations**
- `id` (INT, PRIMARY KEY)
- `user_id` (INT, FOREIGN KEY)
- `terrain_id` (INT, FOREIGN KEY)
- `start` (DATETIME)
- `end` (DATETIME)
- `status` (ENUM: 'pending', 'confirmed', 'cancelled')
- `notes` (TEXT)
- `total_cost` (DECIMAL 10,2) — Coût calculé automatiquement

## Configuration

### Variables d'environnement (.env)

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foot5
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Installation

```bash
# Créer un environnement virtuel
py -m venv .venv

# Activer l'environnement (Windows)
.venv\Scripts\activate

# Activer l'environnement (Linux/Mac)
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

## Démarrage

```bash
# Démarrer le serveur de développement
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

L'API sera accessible sur: `http://localhost:8000`

Documentation interactive: `http://localhost:8000/docs`

## Authentification

L'API utilise JWT (JSON Web Tokens) avec les mêmes mots de passe hashés Bcrypt que l'application desktop.

### Endpoints d'authentification

- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Renouveler le token
- `GET /api/auth/profile` - Profil utilisateur

### Exemple de connexion

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## API Endpoints

### Terrains

- `GET /api/terrains` - Liste des terrains actifs
- `POST /api/terrains` - Créer un terrain (admin)
- `GET /api/terrains/{id}` - Détails d'un terrain
- `PUT /api/terrains/{id}` - Modifier un terrain (admin)
- `DELETE /api/terrains/{id}` - Supprimer un terrain (admin)

### Réservations

- `GET /api/reservations` - Mes réservations
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations/{id}` - Détails d'une réservation
- `PUT /api/reservations/{id}` - Modifier une réservation
- `DELETE /api/reservations/{id}` - Annuler une réservation

### Disponibilité et planification

- `GET /api/reservations/availability?terrain_id={id}&date={YYYY-MM-DD}` - Créneaux disponibles
- `GET /api/reservations/terrain/{id}/schedule?date={YYYY-MM-DD}` - Planning d'un terrain
- `GET /api/reservations/all` - Toutes les réservations (admin)
- `PUT /api/reservations/{id}/confirm` - Confirmer une réservation (admin)

## Logique métier

### Validation des réservations

1. **Validation temporelle**
   - La réservation doit être dans le futur
   - L'heure de fin doit être après l'heure de début
   - Durée minimum: 1 heure
   - Durée maximum: 4 heures

2. **Détection de conflits**
   - Vérification des chevauchements avec les réservations existantes
   - Support des réservations adjacentes (pas de conflit si fin = début suivant)

3. **Créneaux disponibles**
   - Génération automatique des créneaux libres (1h, 2h, 3h, 4h)
   - Horaires d'ouverture: 8h00 - 22h00
   - Prise en compte des réservations confirmées et en attente

### Services de réservation

Le fichier `app/services/reservation_service.py` contient:

- `check_reservation_conflict()` - Détection des conflits
- `get_available_time_slots()` - Génération des créneaux disponibles
- `get_terrain_schedule()` - Planning d'un terrain
- `validate_reservation_time()` - Validation des horaires

## Tests

### Test de la logique métier

```bash
py test_logic.py
```

Ce script teste:
- Connexion à la base de données
- Validation des créneaux horaires
- Détection des conflits
- Génération des disponibilités
- Opérations CRUD sur les modèles

### Test de l'API complète

```bash
py test_api.py
```

Ce script teste:
- Authentification
- Endpoints des terrains
- Endpoints des réservations
- Vérification des disponibilités
- Planning des terrains

## Compatibilité avec l'application desktop

### Authentification

- Utilise les mêmes utilisateurs et mots de passe
- Hashage Bcrypt avec 12 rounds (compatible)
- Même système de rôles (user/admin)

### Base de données

- Partage la même base de données MySQL `foot5`
- Structure des tables identique
- Synchronisation automatique des données

### Règles métier

- Mêmes règles de validation des réservations
- Même logique de détection des conflits
- Même système de statuts des réservations

## Sécurité

- Hachage sécurisé des mots de passe (Bcrypt)
- Authentification par JWT
- Validation des données avec Pydantic
- Protection CORS configurée
- Séparation des rôles user/admin

## Développement frontend

L'API est prête pour être consommée par une application React. Les points d'intégration recommandés:

1. **Authentification** - Gérer les tokens JWT
2. **Calendrier** - Utiliser les endpoints de disponibilité
3. **Réservations** - CRUD complet avec validation
4. **Administration** - Interface admin pour la gestion des terrains

## Déploiement

Pour la production, considérer:

- Serveur ASGI (Gunicorn + Uvicorn)
- Base de données MySQL dédiée
- Variables d'environnement sécurisées
- HTTPS et certificats SSL
- Monitoring et logging

## Support

Cette API est conçue pour étendre l'application desktop existante sans interférer avec son fonctionnement. Elle partage les mêmes données et respecte les mêmes règles métier pour une expérience utilisateur cohérente.