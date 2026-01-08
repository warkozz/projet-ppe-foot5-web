from pydantic import BaseModel, Field
from typing import Optional


class TerrainBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    active: bool = Field(default=True)


class TerrainCreate(TerrainBase):
    pass


class TerrainUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    active: Optional[bool] = None


class TerrainResponse(TerrainBase):
    id: int

    class Config:
        from_attributes = True