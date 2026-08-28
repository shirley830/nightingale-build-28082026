from conftest import call

def test_phi_redaction_removes_names_ids_and_phones_before_model_boundary():
    raw = "Name: Evelyn Lim, NRIC S1234567D, phone +65 9123 4567. Cough for 12 days."
    result = call("patient", "redact", "POST", {"text":raw})
    assert result.status_code == 200
    text = result.json()["redactedText"]
    assert "Evelyn Lim" not in text and "S1234567D" not in text and "9123 4567" not in text
    assert "[REDACTED_NAME]" in text and "[REDACTED_ID]" in text and "[REDACTED_PHONE]" in text

def test_ambient_pipeline_abstains_when_redaction_accuracy_is_uncertain():
    result = call("clinician", "ambient", "POST", {"transcript":"Please call Jane Smith about identifier 123456789012."})
    assert result.status_code == 422
    assert result.json()["status"] == "abstained" and result.json()["summary"] is None

def test_patient_only_receives_human_approved_summary():
    before = call("patient", "bootstrap").json()
    assert len(before["summaries"]) == 1
    approval = call("clinician", "approve_summary", "POST", {"summary_id":"summary-draft"})
    assert approval.status_code == 200
    after = call("patient", "bootstrap").json()
    assert len(after["summaries"]) == 2
