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
    """Returns current user if token is cryptographically valid, else None (guest)."""
    if not token:
        return None
    
    # 1. Try local FastAPI JWT decode first (validated with secret_key & algorithm)
    local_payload = decode_token(token)
    if local_payload and "sub" in local_payload:
        try:
            user_id = int(local_payload["sub"])
            user = get_user_by_id(db, user_id)
            if user:
                return user
        except (ValueError, TypeError):
            pass

    # 2. Try Firebase ID token verification (verified with Google public keys)
    from app.services.auth_service import get_user_by_email, create_user
    email = None
    name = None

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        request = requests.Request()
        decoded_token = id_token.verify_firebase_token(token, request, audience="lutatech")
        email = decoded_token.get("email")
        name = decoded_token.get("name")
    except Exception as e:
        # Invalid or unverified token - do NOT accept unverified claims
        return None

    if not email:
        return None

    # Get or create verified user in DB
    user = get_user_by_email(db, email=email)
    if not user:
        user_name = name or email.split("@")[0]
        user = create_user(db, email=email, name=user_name, password="firebase-oauth-user")
    return user


def require_auth(current_user: Optional[User] = Depends(get_current_user)) -> User:
    """Use this dependency on routes that REQUIRE login."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
