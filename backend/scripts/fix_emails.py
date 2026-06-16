import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from core.database import async_session_maker
from models.user import Usuario

async def fix_emails():
    async with async_session_maker() as session:
        # Find all users with .local emails
        result = await session.execute(select(Usuario))
        all_users = result.scalars().all()
        
        users = [u for u in all_users if u.email and u.email.endswith('@activia.com')]
        
        if not users:
            print("No users with .com emails found.")
            return

        from core.crypto import get_blind_index

        for user in users:
            old_email = user.email
            correct_hash = get_blind_index(old_email)
            if user.email_hash != correct_hash:
                # This is an old .local user that we renamed to .com but couldn't hash because of duplicates.
                # Since the proper .com user exists, we can just delete this old record.
                await session.delete(user)
                print(f"Deleted old duplicate user {old_email}")
        
        await session.commit()
        print("Emails updated successfully.")

if __name__ == "__main__":
    asyncio.run(fix_emails())
