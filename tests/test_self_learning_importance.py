from conftest import call

def test_manual_highlight_increases_similar_future_priority_with_bounded_learning():
    before = call("clinician", "importance_preview&topic=ace_cough&category=symptom").json()
    entry = next(e for e in call("clinician", "bootstrap").json()["entries"] if e["id"] == "entry-ai-doctor")
    phrase = "Persistent dry cough for 12 days"
    start = entry["content"].index(phrase)
    created = call("clinician", "manual_highlight", "POST", {"entry_id":entry["id"],"start":start,"end":start+len(phrase),"topic":"ace_cough","category":"symptom","risk_level":"high"})
    assert created.status_code == 201
    after = call("clinician", "importance_preview&topic=ace_cough&category=symptom").json()
    assert after["learnedAdjustment"] > before["learnedAdjustment"]
    assert after["score"] > before["score"]
    assert after["learnedAdjustment"] <= 8

def test_safety_floor_survives_negative_feedback_and_unseen_items_are_not_penalized():
    for _ in range(3):
        call("clinician", "highlight_feedback", "POST", {"highlight_id":"highlight-allergy","feedback":"reject"})
    allergy = call("clinician", "importance_preview&topic=penicillin_allergy&category=allergy&risk=low").json()
    unseen = call("clinician", "importance_preview&topic=never_seen_before&category=symptom").json()
    assert allergy["score"] >= 94 and allergy["deterministicFloor"] == 94
    assert unseen["learnedAdjustment"] == 0
