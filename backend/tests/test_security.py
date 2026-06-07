import pytest
from sqlalchemy import Column, Integer, select
from sqlalchemy.orm import declarative_base, Session
from sqlalchemy import create_engine
from core.crypto import EncryptedString

Base = declarative_base()

class SecretModel(Base):
    __tablename__ = 'secret_model'
    id = Column(Integer, primary_key=True)
    secret_data = Column(EncryptedString)

@pytest.fixture
def sync_db_session():
    engine = create_engine('sqlite:///:memory:', echo=False)
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

def test_encrypted_string_encrypts_and_decrypts(sync_db_session):
    original_text = "my_super_secret_pii"
    
    # 1. Insert
    obj = SecretModel(secret_data=original_text)
    sync_db_session.add(obj)
    sync_db_session.commit()
    
    # 2. Check underlying raw value
    from sqlalchemy import text
    row = sync_db_session.execute(
        text(f"SELECT secret_data FROM {SecretModel.__tablename__} WHERE id = :id"),
        {"id": obj.id}
    ).first()
    raw_db_value = row[0]
    
    # Assert raw db value is NOT the original text
    assert raw_db_value != original_text
    assert raw_db_value is not None
    assert isinstance(raw_db_value, str)
    
    # 3. Retrieve using ORM
    retrieved_obj = sync_db_session.get(SecretModel, obj.id)
    assert retrieved_obj.secret_data == original_text

def test_encrypted_string_handles_null(sync_db_session):
    obj = SecretModel(secret_data=None)
    sync_db_session.add(obj)
    sync_db_session.commit()
    
    retrieved_obj = sync_db_session.get(SecretModel, obj.id)
    assert retrieved_obj.secret_data is None
