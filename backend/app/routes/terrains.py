from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db
from app.models.terrain import Terrain
from app.models.user import User, UserRole
from app.schemas.terrain import TerrainCreate, TerrainUpdate, TerrainResponse
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


@router.get("/", response_model=List[TerrainResponse])
def get_terrains(
    skip: int = Query(0, ge=0, description="Number of terrains to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of terrains to return"),
    active_only: bool = Query(True, description="Filter only active terrains"),
    db: Session = Depends(get_db)
):
    """
    Récupérer la liste des terrains - route publique pour le moment
    """
    try:
        query = db.query(Terrain)
        
        if active_only:
            query = query.filter(Terrain.active == True)  # Corrigé: active au lieu de is_active
        
        terrains = query.offset(skip).limit(limit).all()
        return terrains
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des terrains: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur base de données: {str(e)}"
        )


@router.get("/{terrain_id}", response_model=TerrainResponse)
def get_terrain(terrain_id: int, db: Session = Depends(get_db)):
    """
    Récupérer un terrain par son ID
    """
    terrain = db.query(Terrain).filter(Terrain.id == terrain_id).first()
    
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found"
        )
    
    return terrain


@router.post("/", response_model=TerrainResponse)
def create_terrain(
    terrain_data: TerrainCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Créer un nouveau terrain (Admin uniquement)
    """
    # Vérifier si un terrain avec le même nom existe déjà
    existing_terrain = db.query(Terrain).filter(Terrain.name == terrain_data.name).first()
    if existing_terrain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A terrain with this name already exists"
        )
    
    db_terrain = Terrain(**terrain_data.dict())
    db.add(db_terrain)
    db.commit()
    db.refresh(db_terrain)
    
    return db_terrain


@router.put("/{terrain_id}", response_model=TerrainResponse)
def update_terrain(
    terrain_id: int,
    terrain_data: TerrainUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Mettre à jour un terrain (Admin uniquement)
    """
    terrain = db.query(Terrain).filter(Terrain.id == terrain_id).first()
    
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found"
        )
    
    # Vérifier si le nouveau nom existe déjà (si fourni)
    if terrain_data.name and terrain_data.name != terrain.name:
        existing_terrain = db.query(Terrain).filter(Terrain.name == terrain_data.name).first()
        if existing_terrain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A terrain with this name already exists"
            )
    
    # Mettre à jour les champs fournis
    update_data = terrain_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(terrain, field, value)
    
    db.commit()
    db.refresh(terrain)
    
    return terrain


@router.delete("/{terrain_id}")
def delete_terrain(
    terrain_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Supprimer un terrain (Admin uniquement)
    """
    terrain = db.query(Terrain).filter(Terrain.id == terrain_id).first()
    
    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found"
        )
    
    # Vérifier s'il y a des réservations actives
    from app.models.reservation import Reservation, ReservationStatus
    active_reservations = db.query(Reservation).filter(
        Reservation.terrain_id == terrain_id,
        Reservation.status.in_([ReservationStatus.pending, ReservationStatus.confirmed])
    ).first()
    
    if active_reservations:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete terrain with active reservations"
        )
    
    db.delete(terrain)
    db.commit()
    
    return {"message": "Terrain deleted successfully"}


@router.patch("/{terrain_id}/toggle-active", response_model=TerrainResponse)
def toggle_terrain_active(
    terrain_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """
    Activer/Désactiver un terrain (Admin uniquement).
    Lorsque le terrain est désactivé, toutes les réservations futures
    confirmed/pending sont automatiquement annulées.
    """
    terrain = db.query(Terrain).filter(Terrain.id == terrain_id).first()

    if not terrain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Terrain not found"
        )

    # Bascule le statut actif
    new_active = not terrain.active
    terrain.active = new_active

    cancelled_count = 0
    if not new_active:
        # Annuler toutes les réservations futures confirmed/pending
        from app.models.reservation import Reservation
        from datetime import datetime
        now = datetime.utcnow()
        future_reservations = (
            db.query(Reservation)
            .filter(
                Reservation.terrain_id == terrain_id,
                Reservation.status.in_(["confirmed", "pending"]),
                Reservation.start > now,
            )
            .all()
        )
        for r in future_reservations:
            r.status = "cancelled"
            # Marqueur dans notes pour le frontend
            marker = "[TERRAIN_DÉSACTIVÉ] Ce terrain a été temporairement fermé. Votre réservation a été annulée automatiquement."
            r.notes = marker if not r.notes else f"{marker} Note originale : {r.notes}"
            cancelled_count += 1

    db.commit()
    db.refresh(terrain)

    return terrain