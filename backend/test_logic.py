#!/usr/bin/env python3
"""
Test business logic directly
Tests reservation services and database models
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from datetime import datetime, timedelta
from app.models.database import SessionLocal
from app.models.terrain import Terrain
from app.models.reservation import Reservation
from app.models.user import User
from app.services.reservation_service import (
    check_reservation_conflict,
    get_available_time_slots,
    get_terrain_schedule,
    validate_reservation_time
)
import traceback

def test_database_connection():
    """Test database connection and existing data"""
    print("🔌 Testing Database Connection...")
    
    try:
        db = SessionLocal()
        
        # Test users
        users = db.query(User).all()
        print(f"✅ Found {len(users)} users")
        
        # Test terrains
        terrains = db.query(Terrain).all()
        print(f"✅ Found {len(terrains)} terrains")
        for terrain in terrains[:3]:  # Show first 3
            print(f"   - {terrain.name} ({terrain.location}) - Active: {terrain.active}")
        
        # Test reservations
        reservations = db.query(Reservation).all()
        print(f"✅ Found {len(reservations)} reservations")
        
        db.close()
        return len(terrains) > 0
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        traceback.print_exc()
        return False

def test_reservation_business_logic():
    """Test reservation business logic functions"""
    print("\n🧠 Testing Business Logic...")
    
    db = SessionLocal()
    try:
        # Get a test terrain
        terrain = db.query(Terrain).filter(Terrain.active == True).first()
        if not terrain:
            print("❌ No active terrain found")
            return
        
        print(f"🎯 Using terrain: {terrain.name}")
        
        # Test date validation
        print("\n📅 Testing Date Validation...")
        
        # Valid future time
        tomorrow_10am = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
        tomorrow_12pm = tomorrow_10am + timedelta(hours=2)
        
        is_valid, msg = validate_reservation_time(tomorrow_10am, tomorrow_12pm)
        print(f"   Future time (10-12): {'✅' if is_valid else '❌'} {msg}")
        
        # Past time
        yesterday = datetime.now() - timedelta(days=1)
        is_valid, msg = validate_reservation_time(yesterday, yesterday + timedelta(hours=2))
        print(f"   Past time: {'✅' if not is_valid else '❌'} {msg}")
        
        # End before start
        is_valid, msg = validate_reservation_time(tomorrow_12pm, tomorrow_10am)
        print(f"   End before start: {'✅' if not is_valid else '❌'} {msg}")
        
        # Test conflict checking
        print("\n⚔️  Testing Conflict Detection...")
        
        # Check for conflicts with existing reservations
        has_conflict, conflicting_res = check_reservation_conflict(
            db, terrain.id, tomorrow_10am, tomorrow_12pm
        )
        print(f"   Conflict check: {'❌ Conflict found' if has_conflict else '✅ No conflicts'}")
        if has_conflict:
            print(f"   Conflicting reservation: {conflicting_res.id}")
        
        # Test availability slots
        print("\n🕒 Testing Availability Slots...")
        
        tomorrow = tomorrow_10am.date()
        available_slots = get_available_time_slots(db, terrain.id, tomorrow)
        print(f"   Available slots for {tomorrow}: {len(available_slots)}")
        
        # Show first few slots
        for i, slot in enumerate(available_slots[:3]):
            start = slot["start_time"].strftime("%H:%M")
            end = slot["end_time"].strftime("%H:%M")
            print(f"   - {start} - {end} ({'Available' if slot['available'] else 'Occupied'})")
        
        # Test terrain schedule
        print("\n📊 Testing Terrain Schedule...")
        
        schedule = get_terrain_schedule(db, terrain.id, tomorrow)
        print(f"   Schedule items for {tomorrow}: {len(schedule)}")
        
        for item in schedule[:3]:  # Show first 3
            start = item["start"].strftime("%H:%M")
            end = item["end"].strftime("%H:%M")
            status = item["status"]
            print(f"   - {start} - {end} ({status})")
        
    except Exception as e:
        print(f"❌ Business logic error: {e}")
        traceback.print_exc()
    finally:
        db.close()

def test_model_operations():
    """Test CRUD operations on models"""
    print("\n🔧 Testing Model Operations...")
    
    db = SessionLocal()
    try:
        # Test creating a new reservation (but don't save it)
        user = db.query(User).first()
        terrain = db.query(Terrain).filter(Terrain.active == True).first()
        
        if user and terrain:
            tomorrow = datetime.now() + timedelta(days=1)
            test_start = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
            test_end = test_start + timedelta(hours=1)
            
            # Check if this slot would conflict
            has_conflict, _ = check_reservation_conflict(
                db, terrain.id, test_start, test_end
            )
            
            if not has_conflict:
                # Create test reservation object (don't save to DB)
                test_reservation = Reservation(
                    user_id=user.id,
                    terrain_id=terrain.id,
                    start=test_start,
                    end=test_end,
                    status="pending",
                    notes="Test reservation - not saved"
                )
                
                print(f"✅ Test reservation object created:")
                print(f"   User: {user.username}")
                print(f"   Terrain: {terrain.name}")
                print(f"   Time: {test_start.strftime('%Y-%m-%d %H:%M')} - {test_end.strftime('%H:%M')}")
                print(f"   Status: {test_reservation.status}")
            else:
                print("⚠️  Would conflict with existing reservation")
        else:
            print("❌ Missing user or terrain for test")
            
    except Exception as e:
        print(f"❌ Model operation error: {e}")
        traceback.print_exc()
    finally:
        db.close()

def main():
    """Main test function"""
    print("🚀 Testing Football Manager 5v5 Business Logic")
    print("=" * 50)
    
    # Test database connection
    if not test_database_connection():
        print("❌ Cannot proceed without database connection")
        sys.exit(1)
    
    # Test business logic
    test_reservation_business_logic()
    
    # Test model operations
    test_model_operations()
    
    print("\n" + "=" * 50)
    print("🎉 Business Logic Tests Completed!")

if __name__ == "__main__":
    main()