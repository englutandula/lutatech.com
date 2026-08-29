from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.config import settings
from app.api.deps import get_current_user, require_auth
from app.services.auth_service import (
    authenticate_user, create_user, get_user_by_email, create_access_token
)
from app.models.db_models import User

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------- Schemas ----------

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    plan: str

    class Config:
        from_attributes = True


# ---------- Routes ----------

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user = create_user(db, email=body.email, name=body.name, password=body.password)
    token = create_access_token(
        {"sub": str(user.id)},
        timedelta(minutes=settings.access_token_expire_minutes)
    )
    return {"access_token": token}


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, email=form.username, password=form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(
        {"sub": str(user.id)},
        timedelta(minutes=settings.access_token_expire_minutes)
    )
    return {"access_token": token}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(require_auth)):
    plan = "free"
    if current_user.subscription:
        plan = current_user.subscription.plan.value
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        plan=plan,
    )
