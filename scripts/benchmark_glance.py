import json
import os
import statistics
import time
import requests

base = os.getenv("NIGHTINGALE_BASE_URL", "http://localhost:3000")
url = f"{base}/api?action=glance&patient_id=patient-1"
headers = {"Authorization": "Bearer demo-clinician"}
for _ in range(10):
    requests.get(url, headers=headers, timeout=5).raise_for_status()
samples = []
for _ in range(200):
    started = time.perf_counter()
    response = requests.get(url, headers=headers, timeout=5)
    response.raise_for_status()
    samples.append((time.perf_counter() - started) * 1000)
ordered = sorted(samples)
result = {
    "environment": "local macOS, Vinext dev server, local Cloudflare D1/Miniflare, sequential requests",
    "warmup_requests": 10,
    "measured_requests": len(samples),
    "p50_ms": round(statistics.median(samples), 2),
    "p95_ms": round(ordered[int(len(ordered) * 0.95) - 1], 2),
    "max_ms": round(max(samples), 2),
    "target_ms": 300,
    "target_met": ordered[int(len(ordered) * 0.95) - 1] <= 300,
    "limitations": "Local warm-path benchmark excludes WAN, TLS termination, cold starts and production concurrency.",
}
print(json.dumps(result, indent=2))
