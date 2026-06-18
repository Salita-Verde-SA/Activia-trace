import httpx

with httpx.Client(base_url="http://localhost:47121") as client:
    # 1. Login to get token
    # the user is test@example.com (or similar) with password
    # wait, the seed script uses what credentials?
    # I can just check the seed script for the user/password.
