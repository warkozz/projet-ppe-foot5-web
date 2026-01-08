from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class ReservationBase(BaseModel):
    terrain_id: int = Field(..., gt=0)
    start: datetime  # Nom de champ correspondant à la DB
    end: datetime    # Nom de champ correspondant à la DB
    notes: Optional[str] = Field(None, max_length=250)

    @validator('end')
    def validate_end_time(cls, v, values):
        if 'start' in values and v <= values['start']:
            raise ValueError('L\'heure de fin doit être postérieure à l\'heure de début')
        return v


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=250)
    status: Optional[str] = Field(None, max_length=20)

    @validator('end')
    def validate_end_time(cls, v, values):
        if 'start' in values and v and values['start'] and v <= values['start']:
            raise ValueError('L\'heure de fin doit être postérieure à l\'heure de début')
        return v


class ReservationResponse(ReservationBase):
    id: int
    user_id: int
    status: str

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