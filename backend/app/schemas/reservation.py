from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum


class ReservationStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class ReservationBase(BaseModel):
    terrain_id: int = Field(..., gt=0)
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = Field(None, max_length=500)
    contact_phone: Optional[str] = Field(None, max_length=20)
    participants_count: int = Field(default=10, ge=6, le=22)

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('L\'heure de fin doit être postérieure à l\'heure de début')
        return v

    @validator('start_time')
    def validate_start_time(cls, v):
        if v <= datetime.now():
            raise ValueError('La réservation ne peut pas être dans le passé')
        return v

    @validator('participants_count')
    def validate_participants(cls, v):
        if v < 6 or v > 22:
            raise ValueError('Le nombre de participants doit être entre 6 et 22')
        return v


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)
    contact_phone: Optional[str] = Field(None, max_length=20)
    participants_count: Optional[int] = Field(None, ge=6, le=22)
    status: Optional[ReservationStatus] = None

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if 'start_time' in values and v and values['start_time'] and v <= values['start_time']:
            raise ValueError('L\'heure de fin doit être postérieure à l\'heure de début')
        return v


class ReservationResponse(ReservationBase):
    id: int
    user_id: int
    total_price: Decimal
    status: ReservationStatus
    created_at: datetime
    updated_at: Optional[datetime]

    # Relations incluses
    terrain: Optional['TerrainResponse'] = None
    user: Optional['UserResponse'] = None

    class Config:
        from_attributes = True


# Import des autres schemas pour les relations
from .terrain import TerrainResponse
from .user import UserResponse

# Mise à jour des forward references
ReservationResponse.model_rebuild()