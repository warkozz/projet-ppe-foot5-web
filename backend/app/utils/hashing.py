from passlib.context import CryptContext
from passlib.hash import bcrypt

# Configuration pour le hashing des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hasher un mot de passe avec bcrypt
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifier un mot de passe contre son hash
    """
    return pwd_context.verify(plain_password, hashed_password)