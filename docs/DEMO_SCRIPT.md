# Demo recording script — Scenario B (about 4 minutes)

## Before recording

1. Run `pnpm dev` and open `http://localhost:3000`.
2. Reset the synthetic seed with the command in `README.md`.
3. Keep browser zoom at 100%; start on Glance as **Maya Tan · Staff**.
4. Say: “Everything shown is synthetic. Authorization is enforced by the server; the role switch selects fixed demo identities.”

## Recording flow

1. **Glance (20s).** Point to the medication conflict, protected allergy, open BP task, evidence label, deterministic floor and Source button. Explain that the view is designed to answer “what matters, why, and what do I do?” in under 10 seconds.
2. **Staff note (30s).** Open Timeline → Add staff note. Enter: “Patient reports the cough is unchanged today. Please review before the next dose.” Keep nurse follow-up assigned and submit. Show its author role, timestamp and resolvable `entry:` pointer.
3. **Mention and assignment (25s).** On the AI doctor note, Comment. Enter `@DrChen Please review the exact cough phrase before the next dose.` Submit and show the open thread and assignment.
4. **Clinician boundary (15s).** Switch to **Dr. Amelia Chen · Clinician**. Note that this is a different server identity, not a CSS toggle.
5. **Manual highlight + learning (35s).** On the AI doctor entry click **Highlight phrase**. The dialog shows the similar-item score before/after (`48 → 51` in a fresh seed) and a bounded `+6` learned signal. Explain: unseen items are not penalized; allergy/medication/dosage/task floors remain independent.
6. **Exact provenance (20s).** Return to Glance and use Source on the cough card. Show the yellow exact phrase inside the source entry. Explain that invalid spans fail closed.
7. **Edit and diff (35s).** Open Shared plan. Change the clinician plan to “Pause medication changes pending clinician review of cough and home BP readings.” Save. Open **History & diff**; show v2, author/time, highlighted changed words and metadata-only audit.
8. **Revert (20s).** Select v1 and click **Revert to this content**. Confirm the original plan is restored and explain that revert creates v3; history is never erased.
9. **RBAC + patient safety (25s).** Switch to Patient view. Show only the clinician-approved summary. State that raw AI notes, drafts and internal comments are omitted by the server response. Mention that the automated suite asserts these denials.
10. **Close (15s).** Mention `13 passed`, warm-path P95 `8.57 ms` locally against the `≤300 ms` requirement, and the limitations disclosed in the brief.

## Optional proof shots

- As Staff, open Shared plan to show the clinician textarea disabled.
- Open Safety to explain operational evidence and redaction abstention.
- Open Data lifecycle to show protected old allergy information remains hot.
