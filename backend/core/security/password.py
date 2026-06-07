from passlib.context import CryptContext

# Usaremos Argon2 como algoritmo recomendado por las specs.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña en texto plano contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Retorna el hash (Argon2id) de una contraseña."""
    return pwd_context.hash(password)
