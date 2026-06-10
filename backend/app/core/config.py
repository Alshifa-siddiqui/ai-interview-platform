import os
from dotenv import load_dotenv

load_dotenv(override=True)

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
DATABASE_URL: str = os.getenv("DATABASE_URL", "")
SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme")
SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
