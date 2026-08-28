from conftest import call

def test_staff_and_clinician_cannot_overwrite_each_other():
    staff_on_clinician = call("staff", "edit_section", "POST", {"section_id":"section-plan","expected_version":1,"content":"unauthorised"})
    clinician_on_staff = call("clinician", "edit_section", "POST", {"section_id":"section-staff","expected_version":1,"content":"unauthorised"})
    assert staff_on_clinician.status_code == 403
    assert clinician_on_staff.status_code == 403

def test_patient_cannot_access_internal_comments_or_raw_ai_notes():
    comments = call("patient", "comments&patient_id=patient-1")
    raw_ai = call("patient", "entry&entry_id=entry-ai-doctor")
    patient_view = call("patient", "bootstrap&patient_id=patient-1")
    assert comments.status_code == 403
    assert raw_ai.status_code == 403
    payload = patient_view.json()
    assert patient_view.status_code == 200
    assert "entries" not in payload and "comments" not in payload
    assert all(item.get("content") and "Draft:" not in item["content"] for item in payload["summaries"])

def test_clinic_scope_is_fail_closed():
    response = call("other", "bootstrap&patient_id=patient-1")
    assert response.status_code == 404
