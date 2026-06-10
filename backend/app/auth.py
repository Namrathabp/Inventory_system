import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db
from . import models

# Setup password hashing engine
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Security Configurations (In production, load these from environment variables!)
SECRET_KEY = os.getenv("JWT_SECRET", "SUPER_SECRET_COMPLEX_PASSPHRASE_KEY_12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- PASSWORD HELPER FUNCTIONS ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT TOKEN HELPER FUNCTIONS ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- MIDDLEWARE: VALIDATE USER & ROLE ---
def get_current_user(cred: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    token = cred.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token payload")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate login credentials")
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Authenticated user no longer exists")
    return user

def require_admin(current_user: models.User = Depends(get_current_user)):
    """Route Guard: Rejects request immediately if user is not an Admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied: Administrative privileges required")
    return current_user