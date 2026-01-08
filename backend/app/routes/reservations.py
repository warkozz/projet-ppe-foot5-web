from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal
from app.models.database import get_db
from app.models.reservation import Reservation, ReservationStatus
from app.models.terrain import Terrain
from app.models.user import User, UserRole
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from app.routes.auth import get_current_user

router = APIRouter()


def get_admin_user(current_user: User = Depends(get_current_user)):
    """
    Vérifier que l'utilisateur est admin
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def calculate_price(terrain: Terrain, start_time: datetime, end_time: datetime) -> Decimal:
    """
    Calculer le prix total d'une réservation
    """
    duration = end_time - start_time
    hours = Decimal(str(duration.total_seconds() / 3600))
    return terrain.price_per_hour * hours


def check_terrain_availability(db: Session, terrain_id: int, start_time: datetime, end_time: datetime, exclude_reservation_id: Optional[int] = None):
    """
    Vérifier la disponibilité d'un terrain pour une période donnée
    """
    query = db.query(Reservation).filter(
        Reservation.terrain_id == terrain_id,
        Reservation.status.in_([ReservationStatus.pending, ReservationStatus.confirmed]),
        or_(
            and_(Reservation.start_time <= start_time, Reservation.end_time > start_time),
            and_(Reservation.start_time < end_time, Reservation.end_time >= end_time),
            and_(Reservation.start_time >= start_time, Reservation.end_time <= end_time)
        )
    )
    
    if exclude_reservation_id:
        query = query.filter(Reservation.id != exclude_reservation_id)
    
    conflicting_reservation = query.first()
    return conflicting_reservation is None


@router.get("/", response_model=List[ReservationResponse])
def get_reservations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[ReservationStatus] = Query(None),
    terrain_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les réservations
    - Admin: peut voir toutes les réservations
    - Client: ne peut voir que ses propres réservations
    """
    query = db.query(Reservation)
    
    # Filtres selon le rôle
    if current_user.role == UserRole.client:
        query = query.filter(Reservation.user_id == current_user.id)
    
    # Filtres optionnels
    if status_filter:
        query = query.filter(Reservation.status == status_filter)
    
    if terrain_id:
        query = query.filter(Reservation.terrain_id == terrain_id)
    
    if start_date:
        query = query.filter(Reservation.start_time >= start_date)
    
    if end_date:
        query = query.filter(Reservation.end_time <= end_date)
    
    # Inclure les relations
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
    if current_user.role == UserRole.client and reservation.user_id != current_user.id:
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
        Terrain.is_active == True
    ).first()
    
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found or inactive"
        )
    
    # Vérifier la disponibilité du terrain
    if not check_terrain_availability(
        db, reservation_data.terrain_id, 
        reservation_data.start_time, reservation_data.end_time
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Terrain is not available for the requested time slot"
        )
    
    # Calculer le prix total
    total_price = calculate_price(terrain, reservation_data.start_time, reservation_data.end_time)
    
    # Créer la réservation
    db_reservation = Reservation(
        user_id=current_user.id,
        terrain_id=reservation_data.terrain_id,
        start_time=reservation_data.start_time,
        end_time=reservation_data.end_time,
        total_price=total_price,
        status=ReservationStatus.pending,
        notes=reservation_data.notes,
        contact_phone=reservation_data.contact_phone,
        participants_count=reservation_data.participants_count
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
    if current_user.role == UserRole.client:
        if reservation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        # Les clients ne peuvent modifier que les réservations en attente
        if reservation.status != ReservationStatus.pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only modify pending reservations"
            )
    
    # Si on modifie les heures, vérifier la disponibilité
    if reservation_data.start_time or reservation_data.end_time:
        new_start = reservation_data.start_time or reservation.start_time
        new_end = reservation_data.end_time or reservation.end_time
        
        if not check_terrain_availability(
            db, reservation.terrain_id, new_start, new_end, reservation_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Terrain is not available for the requested time slot"
            )
        
        # Recalculer le prix si les heures changent
        terrain = db.query(Terrain).filter(Terrain.id == reservation.terrain_id).first()
        reservation.total_price = calculate_price(terrain, new_start, new_end)
    
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
    if current_user.role == UserRole.client and reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Vérifier que la réservation peut être annulée
    if reservation.status in [ReservationStatus.cancelled, ReservationStatus.completed]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reservation cannot be cancelled"
        )
    
    reservation.status = ReservationStatus.cancelled
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
    
    if reservation.status != ReservationStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending reservations can be confirmed"
        )
    
    reservation.status = ReservationStatus.confirmed
    db.commit()
    db.refresh(reservation)
    
    return reservation


@router.get("/terrain/{terrain_id}/availability")
def check_availability(
    terrain_id: int,
    start_time: datetime = Query(...),
    end_time: datetime = Query(...),
    db: Session = Depends(get_db)
):
    """
    Vérifier la disponibilité d'un terrain pour une période donnée
    """
    # Vérifier que le terrain existe
    terrain = db.query(Terrain).filter(Terrain.id == terrain_id).first()
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found"
        )
    
    is_available = check_terrain_availability(db, terrain_id, start_time, end_time)
    estimated_price = calculate_price(terrain, start_time, end_time) if is_available else None
    
    return {
        "available": is_available,
        "terrain_id": terrain_id,
        "start_time": start_time,
        "end_time": end_time,
        "estimated_price": estimated_price
    }