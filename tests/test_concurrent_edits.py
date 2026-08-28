from concurrent.futures import ThreadPoolExecutor
from conftest import call

def test_different_role_owned_sections_do_not_overwrite_each_other():
    with ThreadPoolExecutor(max_workers=2) as pool:
        staff_future = pool.submit(call, "staff", "edit_section", "POST", {"section_id":"section-staff","expected_version":1,"content":"Staff coordination changed independently."})
        clinician_future = pool.submit(call, "clinician", "edit_section", "POST", {"section_id":"section-plan","expected_version":1,"content":"Clinician plan changed independently."})
    assert staff_future.result().status_code == 200
    assert clinician_future.result().status_code == 200
    view = call("clinician", "bootstrap").json()
    sections = {row["id"]: row for row in view["sections"]}
    assert sections["section-staff"]["content"] == "Staff coordination changed independently."
    assert sections["section-plan"]["content"] == "Clinician plan changed independently."

def test_same_section_uses_deterministic_optimistic_conflict():
    payloads = [
        {"section_id":"section-plan","expected_version":1,"content":"Writer A"},
        {"section_id":"section-plan","expected_version":1,"content":"Writer B"},
    ]
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda p: call("clinician", "edit_section", "POST", p), payloads))
    assert sorted(r.status_code for r in responses) == [200, 409]
    current = call("clinician", "versions&section_id=section-plan").json()["section"]
    assert current["version"] == 2
    assert current["content"] in {"Writer A", "Writer B"}
