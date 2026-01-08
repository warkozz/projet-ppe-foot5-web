from sqlalchemy import Column, Integer, String, Numeric, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.database import Base


class Terrain(Base):
    __tablename__ = "terrains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    location = Column(String(255), nullable=False)
    price_per_hour = Column(Numeric(10, 2), nullable=False)
    capacity = Column(Integer, default=10, nullable=False)  # Capacité joueurs (5v5 = 10)
    is_active = Column(Boolean, default=True, nullable=False)
    image_url = Column(String(500))
    amenities = Column(Text)  # JSON string pour stocker les équipements
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    reservations = relationship("Reservation", back_populates="terrain", cascade="all, delete-orphan")