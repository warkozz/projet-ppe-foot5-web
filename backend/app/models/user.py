from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.models.database import Base
import enum


class UserRole(enum.Enum):
    superadmin = "superadmin"
    admin = "admin"
    user = "user"  # Correspond à "client" dans nos schemas


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    role = Column(Enum('superadmin', 'admin', 'user', name='role_enum'), nullable=False, default='user')  # Même ENUM que desktop
    active = Column(Boolean, default=True, nullable=False)

    # Relations
    reservations = relationship("Reservation", back_populates="user", cascade="all, delete-orphan")