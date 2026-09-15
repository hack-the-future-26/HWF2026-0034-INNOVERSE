import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional

try:
    from passlib.hash import pbkdf2_sha256
    def hash_password(password: str) -> str:
        return pbkdf2_sha256.hash(password)

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        if hashed_password.startswith("$pbkdf2-sha256$"):
            return pbkdf2_sha256.verify(plain_password, hashed_password)
        # Fallback check
        return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password
except ImportError:
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return hashlib.sha256(plain_password.encode("utf-8")).hexdigest() == hashed_password

try:
    from jose import jwt, JWTError
except ImportError:
    import jwt
    JWTError = Exception

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret_key_smart_queue_2026")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
