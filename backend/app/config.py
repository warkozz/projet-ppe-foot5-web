#!/usr/bin/env python3
"""
Configuration management for Football Manager 5v5 API
Handles environment variables and application settings
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import validator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "foot5"
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application settings
    DEBUG: bool = True
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    API_PREFIX: str = "/api"
    
    # Reservation settings
    MIN_RESERVATION_DURATION: int = 1  # hours
    MAX_RESERVATION_DURATION: int = 4  # hours
    OPENING_HOUR: int = 8
    CLOSING_HOUR: int = 22
    
    @validator("DB_PASSWORD")
    def validate_db_password(cls, v):
        if not v and os.getenv("ENVIRONMENT") == "production":
            raise ValueError("Database password is required in production")
        return v
    
    @validator("JWT_SECRET_KEY")
    def validate_jwt_secret(cls, v):
        if v == "your-secret-key-here" and os.getenv("ENVIRONMENT") == "production":
            raise ValueError("JWT secret key must be changed in production")
        return v
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL"""
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings"""
    return settings