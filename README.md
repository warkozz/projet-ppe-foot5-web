# Football Manager 5v5 - Extension Web

Extension web pour l'application de gestion de terrains de football 5v5.

## Description

Cette application web complète l'application desktop existante en permettant aux clients de faire leurs réservations en ligne. Elle se connecte à la même base de données MySQL que l'application desktop.

## Stack Technique

- **Backend**: FastAPI + Python
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL (partagée avec l'app desktop)
- **ORM**: SQLAlchemy

## Architecture

```
/
├── backend/          # API FastAPI
│   ├── app/
│   ├── requirements.txt
│   └── main.py
└── frontend/         # Interface React
    ├── src/
    ├── public/
    └── package.json
```

## Installation et Configuration

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Base de Données

L'application utilise la base de données MySQL `foot5` existante avec les tables :
- `users` (utilisateurs)
- `terrains` (terrains de sport)
- `reservations` (réservations)

## Développement

Ce projet fait partie d'un workspace multi-root avec l'application desktop existante. Les deux applications partagent la même base de données mais ont des interfaces distinctes :
- **Desktop** : Administration et gestion (admin)
- **Web** : Réservations clients (client)

## Configuration

Copier le fichier `.env.example` vers `.env` et configurer :
```
DATABASE_URL=mysql+pymysql://root:@localhost:3306/foot5
SECRET_KEY=your-secret-key
```