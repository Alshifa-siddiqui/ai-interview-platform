from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, interviews, resume

app = FastAPI(title="AI Interview Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(interviews.router)
app.include_router(resume.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
