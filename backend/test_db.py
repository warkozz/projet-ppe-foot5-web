#!/usr/bin/env python3
"""
Script pour tester la connexion à la base de données
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.models.database import engine, Base
    from app.models.user import User
    from app.models.terrain import Terrain  
    from app.models.reservation import Reservation
    
    print("🔍 Testing database connection...")
    
    # Test de connexion
    connection = engine.connect()
    print("✅ Database connection successful!")
    connection.close()
    
    # Création des tables
    print("🔧 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    print("\n📊 Database setup complete!")
    print(f"📍 Database URL: mysql+pymysql://root:@localhost:3306/foot5")
    print(f"🗂️  Tables: users, terrains, reservations")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you're in the backend directory and have installed dependencies")
    
except Exception as e:
    print(f"❌ Database error: {e}")
    print("💡 Make sure:")
    print("   - XAMPP MySQL is running")
    print("   - Database 'foot5' exists")
    print("   - MySQL credentials are correct")
    sys.exit(1)