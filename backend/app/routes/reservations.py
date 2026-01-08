from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app.models.database import get_db
from app.models.reservation import Reservation
from app.models.terrain import Terrain
from app.models.user import User
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from app.routes.auth import get_current_user
from app.services.reservation_service import (
    check_reservation_conflict,
    get_available_time_slots,
    get_terrain_schedule,
    validate_reservation_time
)

router = APIRouter()


def get_admin_user(current_user: User = Depends(get_current_user)):
    """
    Vérifier que l'utilisateur est admin
    """
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


@router.get("/", response_model=List[ReservationResponse])
def get_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None),
    terrain_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les réservations
    - Admin: peut voir toutes les réservations
    - User: ne peut voir que ses propres réservations
    """
    query = db.query(Reservation)
    
    # Filtres selon le rôle
    if current_user.role == "user":
        query = query.filter(Reservation.user_id == current_user.id)
    
    # Filtres optionnels
    if status_filter:
        query = query.filter(Reservation.status == status_filter)
    
    if terrain_id:
        query = query.filter(Reservation.terrain_id == terrain_id)
    
    if start_date:
        start_datetime = datetime.combine(start_date, datetime.min.time())
        query = query.filter(Reservation.start >= start_datetime)
    
    if end_date:
        end_datetime = datetime.combine(end_date, datetime.max.time())
        query = query.filter(Reservation.end <= end_datetime)
    
    reservations = query.offset(skip).limit(limit).all()
    return reservations


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer une réservation par son ID
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Vérifier les permissions
    if current_user.role == "user" and reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return reservation


@router.post("/", response_model=ReservationResponse)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Créer une nouvelle réservation
    """
    # Vérifier que le terrain existe et est actif
    terrain = db.query(Terrain).filter(
        Terrain.id == reservation_data.terrain_id,
        Terrain.active == True
    ).first()
    
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found or inactive"
        )
    
    # Valider les horaires
    is_valid, message = validate_reservation_time(reservation_data.start, reservation_data.end)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Vérifier la disponibilité du terrain
    if check_reservation_conflict(
        db, reservation_data.terrain_id, 
        reservation_data.start, reservation_data.end
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Terrain is not available for the requested time slot"
        )
    
    # Créer la réservation
    db_reservation = Reservation(
        user_id=current_user.id,
        terrain_id=reservation_data.terrain_id,
        start=reservation_data.start,
        end=reservation_data.end,
        status="confirmed",
        notes=reservation_data.notes
    )
    
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    
    return db_reservation


@router.put("/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mettre à jour une réservation
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Vérifier les permissions
    if current_user.role == "user":
        if reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        # Les clients ne peuvent modifier que les réservations confirmées
        if reservation.status not in ["confirmed", "pending"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only modify confirmed or pending reservations"
            )
    
    # Si on modifie les heures, vérifier la disponibilité
    if reservation_data.start or reservation_data.end:
        new_start = reservation_data.start or reservation.start
        new_end = reservation_data.end or reservation.end
        
        # Valider les nouveaux horaires
        is_valid, message = validate_reservation_time(new_start, new_end)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        if check_reservation_conflict(
            db, reservation.terrain_id, new_start, new_end, reservation_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Terrain is not available for the requested time slot"
            )
    
    # Mettre à jour les champs
    update_data = reservation_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reservation, field, value)
    
    db.commit()
    db.refresh(reservation)
    
    return reservation


@router.delete("/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Annuler une réservation
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    # Vérifier les permissions
    if current_user.role == "user" and reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Vérifier que la réservation peut être annulée
    if reservation.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation already cancelled"
        )
    
    reservation.status = "cancelled"
    db.commit()
    
    return {"message": "Reservation cancelled successfully"}


@router.patch("/{reservation_id}/confirm", response_model=ReservationResponse)
def confirm_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Confirmer une réservation (Admin uniquement)
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reservation not found"
        )
    
    if reservation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending reservations can be confirmed"
        )
    
    reservation.status = "confirmed"
    db.commit()
    db.refresh(reservation)
    
    return reservation


@router.get("/availability/terrain/{terrain_id}")
def check_terrain_availability(
    terrain_id: int,
    date: date = Query(..., description="Date to check availability (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Vérifier la disponibilité d'un terrain pour une date donnée
    Retourne les créneaux disponibles et occupés
    """
    schedule = get_terrain_schedule(db, terrain_id, date)
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found or inactive"
        )
    
    return schedule


@router.get("/availability/slots/{terrain_id}")
def get_available_slots(
    terrain_id: int,
    date: date = Query(..., description="Date to check (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Récupérer uniquement les créneaux disponibles pour un terrain et une date
    """
    # Vérifier que le terrain existe
    terrain = db.query(Terrain).filter(
        Terrain.id == terrain_id,
        Terrain.active == True
    ).first()
    
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found or inactive"
        )
    
    available_slots = get_available_time_slots(db, terrain_id, date)
    
    return {
        "terrain_id": terrain_id,
        "terrain_name": terrain.name,
        "date": date.isoformat(),
        "available_slots": [slot for slot in available_slots if slot["available"]]
    }