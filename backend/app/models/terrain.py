from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.models.database import Base


class Terrain(Base):
    __tablename__ = "terrains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    location = Column(String(200))
    active = Column(Boolean, default=True)

    # Relations
    reservations = relationship("Reservation", back_populates="terrain", cascade="all, delete-orphan")