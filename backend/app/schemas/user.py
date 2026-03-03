from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    user = "user"  # Correspond à "client"


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., max_length=120)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(None, max_length=120)
    active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: str  # lecture seule - non settable par le client
    active: bool

    class Config:
        from_attributes = True