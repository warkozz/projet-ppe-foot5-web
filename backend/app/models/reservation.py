from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.database import Base
import enum


class ReservationStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    terrain_id = Column(Integer, ForeignKey("terrains.id"), nullable=False, index=True)
    
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    
    total_price = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(ReservationStatus), default=ReservationStatus.pending, nullable=False)
    
    notes = Column(Text)
    contact_phone = Column(String(20))
    participants_count = Column(Integer, default=10)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations
    user = relationship("User", back_populates="reservations")
    terrain = relationship("Terrain", back_populates="reservations")