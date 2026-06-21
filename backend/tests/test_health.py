"""Smoke tests that need no external services (no Anthropic key, no DB).

They verify the FastAPI app boots and its routes are wired correctly. The
Claude- and Supabase-backed endpoints are not exercised here because they
require live credentials.
"""
import os
import sys

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health_ok():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_expected_routes_registered():
    paths = {route.path for route in app.routes if hasattr(route, "path")}
    for expected in [
        "/api/health",
        "/api/auth/me",
        "/api/interviews/start",
        "/api/interviews/{interview_id}/results",
        "/api/resume/upload",
    ]:
        assert expected in paths, f"missing route {expected}"


def test_auth_me_requires_token():
    # No Authorization header -> 401/403, never a 200.
    r = client.get("/api/auth/me")
    assert r.status_code in (401, 403)
