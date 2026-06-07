import os
import pytest
from pydantic import ValidationError
from core.config import Settings

@pytest.fixture(autouse=True)
def clear_env():
    # Almacenar variables originales
    original = dict(os.environ)
    # Limpiar las requeridas para evitar que se filtren desde el .env local durante los tests
    os.environ.pop("DATABASE_URL", None)
    os.environ.pop("SECRET_KEY", None)
    os.environ.pop("ENCRYPTION_KEY", None)
    os.environ.pop("ACCESS_TOKEN_EXPIRE_MINUTES", None)
    os.environ.pop("TEST_DATABASE_URL", None)
    yield
    # Restaurar
    os.environ.clear()
    os.environ.update(original)

def test_settings_instantiates_with_valid_env():
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@localhost/db"
    os.environ["SECRET_KEY"] = "supersecretkeythatisverylong12345"
    os.environ["ENCRYPTION_KEY"] = "supersecretkeythatisverylong1234567890"
    
    settings = Settings(_env_file=None)
    
    assert settings.DATABASE_URL == "postgresql+asyncpg://user:pass@localhost/db"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 15

def test_settings_fails_when_missing_required_variable():
    with pytest.raises(ValidationError):
        Settings(_env_file=None)

def test_settings_fails_with_invalid_type():
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@localhost/db"
    os.environ["SECRET_KEY"] = "supersecretkeythatisverylong12345"
    os.environ["ENCRYPTION_KEY"] = "supersecretkeythatisverylong1234567890"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "not_an_int"
    
    with pytest.raises(ValidationError):
        Settings(_env_file=None)

def test_settings_fails_with_short_secret_key():
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@localhost/db"
    os.environ["SECRET_KEY"] = "short"
    os.environ["ENCRYPTION_KEY"] = "supersecretkeythatisverylong1234567890"
    
    with pytest.raises(ValidationError):
        Settings(_env_file=None)

def test_settings_fails_with_short_encryption_key():
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://user:pass@localhost/db"
    os.environ["SECRET_KEY"] = "supersecretkeythatisverylong12345"
    os.environ["ENCRYPTION_KEY"] = "short"
    
    with pytest.raises(ValidationError):
        Settings(_env_file=None)
