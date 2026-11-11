import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import jwt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from rebound.core.config import settings

# 256-bit key derivation for AESGCM
_raw_key = hashlib.sha256(settings.APP_ENC_KEY.encode()).digest()
_aesgcm = AESGCM(_raw_key)

security_scheme = HTTPBearer(auto_error=False)

def hash_email(email: str) -> str:
    """HMAC hash of normalized email for deterministic query without revealing plain email."""
    normalized = email.strip().lower()
    return hmac.new(_raw_key, normalized.encode(), hashlib.sha256).hexdigest()

def encrypt_text(text: Optional[str]) -> Optional[str]:
    """AES-256-GCM application-level encryption for free text / sensitive strings."""
    if text is None:
        return None
    nonce = os.urandom(12)
    ciphertext = _aesgcm.encrypt(nonce, text.encode("utf-8"), None)
    # Store combined nonce + ciphertext in base64
    return base64.b64encode(nonce + ciphertext).decode("ascii")

def decrypt_text(payload: Optional[str]) -> Optional[str]:
    """Decrypt AES-256-GCM encrypted base64 payload."""
    if not payload:
        return None
    try:
        raw = base64.b64decode(payload.encode("ascii"))
        if len(raw) < 12:
            return payload
        nonce = raw[:12]
        ciphertext = raw[12:]
        decrypted = _aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode("utf-8")
    except Exception:
        # Fallback if unencrypted
        return payload

def create_access_token(user_id: str, role: str = "user", extra_claims: Optional[Dict[str, Any]] = None) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def get_current_user_claims(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)) -> Dict[str, Any]:
    if not credentials:
        # In demo mode, if no auth header is passed, return default demo user claim (Fatima)
        if settings.DEMO_MODE:
            return {"sub": "usr_fatima_demo", "role": "user", "demo": True}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return decode_access_token(credentials.credentials)

def require_role(*allowed_roles: str):
    def role_checker(claims: Dict[str, Any] = Depends(get_current_user_claims)) -> Dict[str, Any]:
        user_role = claims.get("role", "user")
        if user_role not in allowed_roles and "admin" not in user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role}' does not have required permissions."
            )
        return claims
    return role_checker

