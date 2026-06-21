import os
from dotenv import load_dotenv

load_dotenv(override=True)

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
DATABASE_URL: str = os.getenv("DATABASE_URL", "")
SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme")
SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Set PRODUCTION=true in deployed environments. The defaults above are fine for
# local development, but shipping them to production would sign JWTs with the
# well-known key "changeme". Refuse to start in that case.
PRODUCTION: bool = os.getenv("PRODUCTION", "false").strip().lower() in ("1", "true", "yes", "on")

if PRODUCTION:
    _problems = []
    if SECRET_KEY in ("", "changeme"):
        _problems.append("SECRET_KEY is unset or the insecure default 'changeme'")
    if not SUPABASE_JWT_SECRET:
        _problems.append("SUPABASE_JWT_SECRET is required")
    if not ANTHROPIC_API_KEY:
        _problems.append("ANTHROPIC_API_KEY is required")
    if not DATABASE_URL:
        _problems.append("DATABASE_URL is required")
    if _problems:
        raise RuntimeError(
            "Refusing to start with PRODUCTION=true: " + "; ".join(_problems)
        )
