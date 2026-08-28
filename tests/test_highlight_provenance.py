from conftest import call

def test_every_highlight_resolves_to_exact_timeline_span_including_ai_scribe():
    bootstrap = call("clinician", "bootstrap").json()
    assert bootstrap["highlights"]
    assert any(h["source_entry_id"] == "entry-ai-doctor" for h in bootstrap["highlights"])
    for highlight in bootstrap["highlights"]:
        assert highlight["provenance_pointer"]
        response = call("clinician", f"provenance&highlight_id={highlight['id']}")
        assert response.status_code == 200, response.text
        resolved = response.json()
        assert resolved["resolves"] is True
        assert resolved["span"]["text"] == highlight["excerpt"]
        assert resolved["anchor"] == f"entry-{highlight['source_entry_id']}"
