# Final requirement matrix

| Requirement | Status | Implementation | Evidence / test |
|---|---|---|---|
| Unified shared Care Note | Complete | One patient page with Glance, timeline, plan and patient view | Browser QA; `app/CareNoteApp.tsx` |
| <10-second Top/Glance View | Complete | Ranked risk/action/context, max three primary items, reasons and sources | Browser QA; performance benchmark |
| Longitudinal mixed-role timeline | Complete | Six seeded entry types across Apr 2025, Feb/Aug 2026 | Browser QA; bootstrap API |
| Required metadata | Complete | author role/id, timestamp, type, provenance, source id, version | D1 schema + timeline UI |
| Comments, resolve/unresolve, mentions, assignment | Complete | Internal threads + parsed mentions + assignee + task | Browser Scenario B; RBAC tests |
| Revision snapshots/history/diff/revert | Complete | Immutable versions, changes-since, word diff, revert-as-new-version | `test_revision_history.py`; browser QA |
| AI-scribed note distinctions | Complete | Three system-authored AI types with source sessions | Timeline UI; provenance test |
| Patient/staff/clinician/admin RBAC | Complete | Server authentication, role, clinic, ownership checks | `test_rbac_scope.py` |
| Clinic isolation | Complete | Fail-closed clinic scope; admin remains scoped | `test_clinic_scope_is_fail_closed` |
| Provenance and exact source navigation | Complete | Entry ID + exact character range; resolver validates bounds | `test_highlight_provenance.py`; browser QA |
| Conflict resolution | Complete | Medication/dosage conflict register; confirm-before-precedence | UI conflict banner; additional safety test context |
| Meaningful importance/evidence | Complete | Rule floors + defined evidence equation + abstention | `lib/importance.ts`; learning tests |
| Accept/reject highlight suggestions | Complete | One-click status + audit + feedback | Browser QA; feedback endpoints |
| Self-learning importance bonus | Complete | Bounded topic weights from accept/reject/pin/manual/edit/comment design | `test_self_learning_importance.py`; browser QA |
| Exposure/fatigue safeguards | Complete | No unseen penalty; bounded learning; protected floors | Safety-floor test |
| Hybrid storage/data decay bonus | Prototype complete | Executable tier policy + UI preview; no irreversible deletion | decay API; README |
| Synthetic data only | Complete | Synthetic patient/users/transcripts; no external data | Seed and attribution |
| PHI redaction before LLM | Complete | Name/ID/phone redaction + residual-risk abstention | `test_privacy_and_patient_safety.py` |
| Patient-facing higher-severity safety | Complete | Clinician approval required; raw/draft/internal omitted | Patient safety tests; browser QA |
| Ambient consult bonus | Functional pipeline prototype | PWA transcript intake, labels/time/confidence/redaction/provenance; no ASR/model | Ambient/redaction tests; UI |
| Concurrent edits | Complete | Section ownership + conditional version update; HTTP 409 conflict | `test_concurrent_edits.py` |
| P95 ≤300 ms warm path | Complete locally | 200 measured requests after 10 warmups: P95 8.57 ms | `scripts/benchmark_glance.py`; result JSON |
| Mandatory automated tests | Complete | Four required named files plus bonus/additional tests | 13 passed |
| README | Complete | Setup, architecture, security, privacy, logic, results, demo | `README.md` |
| 2–3 page Technical Brief | Complete | Word brief with diagram/schema/trade-offs/results | `Technical-Brief.docx` after render QA |
| ATTRIBUTION.txt | Complete | Installed package versions and verified licenses | `ATTRIBUTION.txt` |
| Demo video | Manual recording remaining | Exact clean state and 4-minute Scenario B script prepared | `docs/DEMO_SCRIPT.md` |
| Resume / WhatsApp / WeChat | User-provided submission item | Not available in workspace; intentionally not fabricated | Manual step |
| Published Git URL | Pending credentials | Local Git-ready repository prepared | Exact publish commands in final handoff |
