from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import decode_token, get_user_by_id
from app.models.db_models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Returns current user if token is valid, else None (guest)."""
    if not token:
        return None
    
    from google.oauth2 import id_token
    from google.auth.transport import requests
    try:
        request = requests.Request()
        decoded_token = id_token.verify_firebase_token(token, request, audience="lutatech")
        email = decoded_token.get("email")
        if not email:
            return None
        
        # Get or create user in DB
        from app.services.auth_service import get_user_by_email, create_user
        user = get_user_by_email(db, email=email)
        if not user:
            # Create user on the fly since they authenticated via Firebase
            name = decoded_token.get("name", email.split("@")[0])
            user = create_user(db, email=email, name=name, password="firebase-user")
        return user
    except Exception as e:
        print(f"Firebase token verification failed: {e}")
        return None


def require_auth(current_user: Optional[User] = Depends(get_current_user)) -> User:
    """Use this dependency on routes that REQUIRE login."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
