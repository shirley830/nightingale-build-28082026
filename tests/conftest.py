import os
import pytest
import requests

BASE_URL = os.getenv("NIGHTINGALE_BASE_URL", "http://localhost:3000")
TOKENS = {
    "patient": "demo-patient",
    "staff": "demo-staff",
    "clinician": "demo-clinician",
    "admin": "demo-admin",
    "other": "demo-other-clinic",
}

def call(role, action, method="GET", payload=None):
    return requests.request(
        method,
        f"{BASE_URL}/api?action={action}",
        headers={"Authorization": f"Bearer {TOKENS[role]}"},
        json=payload,
        timeout=5,
    )

@pytest.fixture(autouse=True)
def reset_demo():
    response = call("admin", "reset", "POST", {})
    assert response.status_code == 200, response.text
    yield
