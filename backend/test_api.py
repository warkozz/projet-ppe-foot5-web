#!/usr/bin/env python3
"""
Test script for Football Manager 5v5 API
Tests the reservation system and business logic
"""

import requests
import json
from datetime import datetime, timedelta
import sys

BASE_URL = "http://localhost:8000/api"

def test_auth():
    """Test authentication endpoints"""
    print("🔐 Testing Authentication...")
    
    # Test login
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("✅ Login successful")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_terrains(token):
    """Test terrain endpoints"""
    print("\n🏟️ Testing Terrains...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/terrains", headers=headers)
        if response.status_code == 200:
            terrains = response.json()
            print(f"✅ Retrieved {len(terrains)} terrains")
            return terrains
        else:
            print(f"❌ Failed to get terrains: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Terrain error: {e}")
        return []

def test_reservations(token, terrain_id):
    """Test reservation endpoints"""
    print("\n📅 Testing Reservations...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test get reservations
    try:
        response = requests.get(f"{BASE_URL}/reservations", headers=headers)
        if response.status_code == 200:
            reservations = response.json()
            print(f"✅ Retrieved {len(reservations)} reservations")
        else:
            print(f"❌ Failed to get reservations: {response.status_code}")
    except Exception as e:
        print(f"❌ Reservation get error: {e}")
    
    # Test availability check
    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")
    
    try:
        response = requests.get(
            f"{BASE_URL}/reservations/availability",
            params={"terrain_id": terrain_id, "date": tomorrow_str},
            headers=headers
        )
        if response.status_code == 200:
            availability = response.json()
            print(f"✅ Retrieved availability for {tomorrow_str}")
            print(f"   Available slots: {len(availability)}")
        else:
            print(f"❌ Failed to get availability: {response.status_code}")
    except Exception as e:
        print(f"❌ Availability error: {e}")
    
    # Test create reservation (for tomorrow 10:00-12:00)
    start_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(hours=2)
    
    reservation_data = {
        "terrain_id": terrain_id,
        "start": start_time.isoformat(),
        "end": end_time.isoformat(),
        "notes": "Test reservation via API"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/reservations", json=reservation_data, headers=headers)
        if response.status_code == 201:
            reservation = response.json()
            print(f"✅ Created reservation ID: {reservation['id']}")
            return reservation["id"]
        else:
            print(f"❌ Failed to create reservation: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Reservation create error: {e}")
        return None

def test_terrain_schedule(token, terrain_id):
    """Test terrain schedule endpoint"""
    print("\n📊 Testing Terrain Schedule...")
    
    headers = {"Authorization": f"Bearer {token}"}
    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")
    
    try:
        response = requests.get(
            f"{BASE_URL}/reservations/terrain/{terrain_id}/schedule",
            params={"date": tomorrow_str},
            headers=headers
        )
        if response.status_code == 200:
            schedule = response.json()
            print(f"✅ Retrieved schedule for terrain {terrain_id}")
            print(f"   Reservations: {len(schedule)}")
        else:
            print(f"❌ Failed to get schedule: {response.status_code}")
    except Exception as e:
        print(f"❌ Schedule error: {e}")

def main():
    """Main test function"""
    print("🚀 Starting Football Manager 5v5 API Tests")
    print("=" * 50)
    
    # Test authentication
    token = test_auth()
    if not token:
        print("❌ Cannot proceed without authentication")
        sys.exit(1)
    
    # Test terrains
    terrains = test_terrains(token)
    if not terrains:
        print("❌ Cannot proceed without terrains")
        sys.exit(1)
    
    # Use first available terrain for tests
    test_terrain = terrains[0]
    terrain_id = test_terrain["id"]
    print(f"\n🎯 Using terrain: {test_terrain['name']} (ID: {terrain_id})")
    
    # Test reservations
    reservation_id = test_reservations(token, terrain_id)
    
    # Test terrain schedule
    test_terrain_schedule(token, terrain_id)
    
    print("\n" + "=" * 50)
    print("🎉 API Tests Completed!")
    
    if reservation_id:
        print(f"⚠️  Don't forget to cancel test reservation ID: {reservation_id}")

if __name__ == "__main__":
    main()