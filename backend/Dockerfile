# FastAPI backend (Anthropic + Supabase JWT). Serves the API on port 8080.
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Provide the real secrets at runtime (see .env.example). With PRODUCTION=true
# the app refuses to start on the default SECRET_KEY or missing required vars.
ENV PORT=8080 \
    PRODUCTION=false
EXPOSE 8080
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
