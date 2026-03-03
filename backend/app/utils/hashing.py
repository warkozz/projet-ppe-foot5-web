"""
Password hashing utilities using bcrypt directly
"""

import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    """
    # Convertir en bytes
    password_bytes = password.encode('utf-8')
    
    # Tronquer à 72 bytes (limite de bcrypt)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Générer salt et hash
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Retourner comme string
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    """
    try:
        # Convertir en bytes
        password_bytes = plain_password.encode('utf-8')
        
        # Tronquer à 72 bytes (limite de bcrypt)
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        hash_bytes = hashed_password.encode('utf-8')
        
        # Vérifier
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False