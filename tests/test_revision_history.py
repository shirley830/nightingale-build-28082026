from conftest import call

def test_edit_increments_version_and_revert_restores_prior_content():
    original = "Continue lisinopril 20 mg daily. Review home BP log in four weeks."
    changed = "Hold medication advice pending clinician review of cough and home BP log."
    edited = call("clinician", "edit_section", "POST", {"section_id":"section-plan","expected_version":1,"content":changed,"change_summary":"Review cough conflict"})
    assert edited.status_code == 200 and edited.json()["version"] == 2
    history = call("clinician", "versions&section_id=section-plan").json()
    assert [row["version_number"] for row in history["versions"]][:2] == [2, 1]
    reverted = call("clinician", "revert_section", "POST", {"section_id":"section-plan","version_number":1})
    assert reverted.status_code == 200
    assert reverted.json()["version"] == 3 and reverted.json()["content"] == original
    current = call("clinician", "versions&section_id=section-plan").json()["section"]
    assert current["content"] == original and current["version"] == 3

def test_audit_records_actor_and_changed_fields_without_note_content():
    secret_content = "Synthetic plan content that must not appear in metadata audit logs."
    call("clinician", "edit_section", "POST", {"section_id":"section-plan","expected_version":1,"content":secret_content})
    response = call("clinician", "audit")
    assert response.status_code == 200
    event = next(row for row in response.json()["audit"] if row["action"] == "section.edit")
    assert event["actor_id"] == "u-clinician"
    assert event["metadata"]["changed_fields"] == ["content"]
    assert secret_content not in event["metadata_json"]
