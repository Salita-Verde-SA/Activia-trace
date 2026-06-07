import pytest
from core.crypto import EncryptedString, _fernet

def test_encrypted_string_bind_param():
    enc_type = EncryptedString()
    
    # Text
    original_text = "secret_data"
    encrypted = enc_type.process_bind_param(original_text, dialect=None)
    
    assert encrypted is not None
    assert encrypted != original_text
    
    # Ensure it can be decrypted back manually
    decrypted = _fernet.decrypt(encrypted.encode('utf-8')).decode('utf-8')
    assert decrypted == original_text

def test_encrypted_string_bind_param_none():
    enc_type = EncryptedString()
    assert enc_type.process_bind_param(None, dialect=None) is None

def test_encrypted_string_result_value():
    enc_type = EncryptedString()
    
    original_text = "secret_data"
    encrypted = _fernet.encrypt(original_text.encode('utf-8')).decode('utf-8')
    
    decrypted = enc_type.process_result_value(encrypted, dialect=None)
    assert decrypted == original_text

def test_encrypted_string_result_value_none():
    enc_type = EncryptedString()
    assert enc_type.process_result_value(None, dialect=None) is None
