import urllib.request
import json
import base64
import hmac
import hashlib

def base64url_encode(data):
    return base64.urlsafe_b64encode(data).replace(b'=', b'').decode('utf-8')

# Create a JWT manually to avoid needing `jose` or `PyJWT`
header = {
    "alg": "HS256",
    "typ": "JWT"
}
payload = {
    "sub": "e5ebca42-a297-4b2d-b05f-854c0838f775",
    "tenant_id": "8dbcf61f-a395-4fe9-a965-1460375878ca",
    "roles": ["COORDINADOR"]
}

header_b64 = base64url_encode(json.dumps(header).encode())
payload_b64 = base64url_encode(json.dumps(payload).encode())

signature = hmac.new(
    b"supersecretkeythatisverylong12345",
    f"{header_b64}.{payload_b64}".encode(),
    hashlib.sha256
).digest()

signature_b64 = base64url_encode(signature)

token = f"{header_b64}.{payload_b64}.{signature_b64}"

req = urllib.request.Request(
    'http://localhost:47121/api/admin/materias',
    headers={'Authorization': f'Bearer {token}'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode())
except Exception as e:
    print("Error:", e)
