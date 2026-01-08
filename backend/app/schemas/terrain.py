from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class TerrainBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    location: str = Field(..., min_length=5, max_length=255)
    price_per_hour: Decimal = Field(..., gt=0, decimal_places=2)
    capacity: int = Field(default=10, ge=6, le=22)
    is_active: bool = Field(default=True)
    image_url: Optional[str] = Field(None, max_length=500)
    amenities: Optional[str] = None  # JSON string

    @validator('price_per_hour')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Le prix doit être supérieur à 0')
        return v

    @validator('capacity')
    def validate_capacity(cls, v):
        if v < 6 or v > 22:
            raise ValueError('La capacité doit être entre 6 et 22 joueurs')
        return v


class TerrainCreate(TerrainBase):
    pass


class TerrainUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    location: Optional[str] = Field(None, min_length=5, max_length=255)
    price_per_hour: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    capacity: Optional[int] = Field(None, ge=6, le=22)
    is_active: Optional[bool] = None
    image_url: Optional[str] = Field(None, max_length=500)
    amenities: Optional[str] = None


class TerrainResponse(TerrainBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True