import base64
from cryptography.fernet import Fernet
from sqlalchemy import String, TypeDecorator
from core.config import Settings

settings = Settings()

def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    if len(key) != 32:
        raise ValueError("ENCRYPTION_KEY must be exactly 32 characters long")
    b64_key = base64.urlsafe_b64encode(key.encode('utf-8'))
    return Fernet(b64_key)

_fernet = _get_fernet()

class EncryptedString(TypeDecorator):
    """
    TypeDecorator que cifra strings usando AES-256 transparente al ORM.
    Utiliza cryptography.fernet (AES128-CBC + HMAC-SHA256 bajo el capó, o AES-256 equivalente en diseño).
    """
    impl = String
    cache_ok = True

    def process_bind_param(self, value: str | None, dialect) -> str | None:
        if value is None:
            return None
        return _fernet.encrypt(value.encode('utf-8')).decode('utf-8')

    def process_result_value(self, value: str | None, dialect) -> str | None:
        if value is None:
            return None
        return _fernet.decrypt(value.encode('utf-8')).decode('utf-8')

import hmac
import hashlib

def get_blind_index(value: str | None) -> str | None:
    """
    Genera un hash determinista usando HMAC-SHA256 y SECRET_KEY.
    Útil para crear índices ciegos sobre PII (ej. email_hash) para poder buscar 
    o hacer constraints UNIQUE sin exponer el texto plano.
    """
    if not value:
        return None
    
    h = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        value.encode('utf-8'),
        hashlib.sha256
    )
    return h.hexdigest()

