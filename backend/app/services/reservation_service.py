from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, date, time, timedelta
from typing import List, Tuple, Optional
from app.models.reservation import Reservation
from app.models.terrain import Terrain
from app.config import get_settings

settings = get_settings()


def check_reservation_conflict(
    db: Session, 
    terrain_id: int, 
    start_time: datetime, 
    end_time: datetime,
    exclude_reservation_id: int = None
) -> Tuple[bool, Optional[Reservation]]:
    """
    Vérifie s'il y a un conflit de réservation pour un terrain et un créneau donné
    Compatible avec la logique de l'application desktop
    Retourne (has_conflict, conflicting_reservation)
    """
    query = db.query(Reservation).filter(
        Reservation.terrain_id == terrain_id,
        Reservation.status.in_(["confirmed", "pending"]),
        # Vérifier les chevauchements temporels
        or_(
            # Nouveau créneau commence pendant une réservation existante
            and_(Reservation.start <= start_time, Reservation.end > start_time),
            # Nouveau créneau finit pendant une réservation existante  
            and_(Reservation.start < end_time, Reservation.end >= end_time),
            # Nouveau créneau englobe une réservation existante
            and_(Reservation.start >= start_time, Reservation.end <= end_time)
        )
    )
    
    if exclude_reservation_id:
        query = query.filter(Reservation.id != exclude_reservation_id)
    
    conflicting_reservation = query.first()
    return (conflicting_reservation is not None, conflicting_reservation)


def get_available_time_slots(db: Session, terrain_id: int, target_date: date) -> List[dict]:
    """
    Retourne les créneaux disponibles pour un terrain et une date
    Compatible avec la logique de l'application desktop
    """
    # Créneaux standards (2h chacun)
    standard_slots = [
        {"start_hour": 8, "end_hour": 10, "label": "8h-10h"},
        {"start_hour": 10, "end_hour": 12, "label": "10h-12h"},
        {"start_hour": 12, "end_hour": 14, "label": "12h-14h"},
        {"start_hour": 14, "end_hour": 16, "label": "14h-16h"},
        {"start_hour": 16, "end_hour": 18, "label": "16h-18h"},
        {"start_hour": 18, "end_hour": 20, "label": "18h-20h"}
    ]
    
    available_slots = []
    
    for slot in standard_slots:
        slot_start = datetime.combine(target_date, time(slot["start_hour"], 0))
        slot_end = datetime.combine(target_date, time(slot["end_hour"], 0))
        
        # Vérifier si ce créneau est libre
        has_conflict, _ = check_reservation_conflict(db, terrain_id, slot_start, slot_end)
        if not has_conflict:
            available_slots.append({
                "start_time": slot_start,
                "end_time": slot_end,
                "label": slot["label"],
                "available": True
            })
        else:
            available_slots.append({
                "start_time": slot_start,
                "end_time": slot_end,
                "label": slot["label"],
                "available": False
            })
    
    return available_slots


def get_terrain_schedule(db: Session, terrain_id: int, target_date: date) -> dict:
    """
    Retourne le planning complet d'un terrain pour une date
    """
    # Vérifier que le terrain existe et est actif
    terrain = db.query(Terrain).filter(
        Terrain.id == terrain_id,
        Terrain.active == True
    ).first()
    
    if not terrain:
        return None
    
    # Récupérer toutes les réservations du jour
    start_of_day = datetime.combine(target_date, time.min)
    end_of_day = datetime.combine(target_date, time.max)
    
    reservations = db.query(Reservation).filter(
        Reservation.terrain_id == terrain_id,
        Reservation.start >= start_of_day,
        Reservation.start <= end_of_day,
        Reservation.status.in_(["confirmed", "pending"])
    ).order_by(Reservation.start).all()
    
    # Récupérer les créneaux disponibles
    available_slots = get_available_time_slots(db, terrain_id, target_date)
    
    return {
        "terrain": {
            "id": terrain.id,
            "name": terrain.name,
            "location": terrain.location,
            "active": terrain.active
        },
        "date": target_date.isoformat(),
        "reservations": [
            {
                "id": res.id,
                "start_time": res.start,
                "end_time": res.end,
                "status": res.status,
                "user_id": res.user_id,
                "notes": res.notes
            } for res in reservations
        ],
        "available_slots": available_slots
    }


def calculate_duration_hours(start_time: datetime, end_time: datetime) -> float:
    """
    Calcule la durée en heures entre deux datetime
    """
    duration = end_time - start_time
    return duration.total_seconds() / 3600


def validate_reservation_time(start_time: datetime, end_time: datetime) -> Tuple[bool, str]:
    """
    Valide les horaires d'une réservation selon les règles métier
    """
    # Vérifier que l'heure de fin est après l'heure de début
    if end_time <= start_time:
        return False, "L'heure de fin doit être postérieure à l'heure de début"
    
    # Vérifier que la réservation n'est pas dans le passé
    if start_time <= datetime.now():
        return False, "Impossible de réserver dans le passé"
    
    # Vérifier les horaires d'ouverture (8h-20h)
    if start_time.hour < 8 or end_time.hour > 20:
        return False, "Les réservations sont possibles uniquement entre 8h et 20h"
    
    # Vérifier la durée minimale (1h) et maximale (6h)
    duration = calculate_duration_hours(start_time, end_time)
    if duration < 1:
        return False, "Durée minimale de réservation : 1 heure"
    if duration > 6:
        return False, "Durée maximale de réservation : 6 heures"
    
    return True, "Horaires valides"