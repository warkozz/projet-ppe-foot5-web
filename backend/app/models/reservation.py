from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    terrain_id = Column(Integer, ForeignKey("terrains.id"), index=True)
    start = Column(DateTime, nullable=False, index=True)  # Nom de colonne existant
    end = Column(DateTime, nullable=False, index=True)    # Nom de colonne existant
    status = Column(String(20), default="confirmed")
    notes = Column(String(250))

    # Relations
    user = relationship("User", back_populates="reservations")
    terrain = relationship("Terrain", back_populates="reservations")