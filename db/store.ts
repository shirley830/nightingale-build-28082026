import { getRawDb } from './index';

const ddl = [
  `CREATE TABLE IF NOT EXISTS clinics (id TEXT PRIMARY KEY, name TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, clinic_id TEXT NOT NULL, role TEXT NOT NULL, name TEXT NOT NULL, patient_id TEXT)`,
  `CREATE TABLE IF NOT EXISTS patients (id TEXT PRIMARY KEY, clinic_id TEXT NOT NULL, display_name TEXT NOT NULL, synthetic_id TEXT NOT NULL, date_of_birth TEXT NOT NULL, conditions_json TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS entries (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, clinic_id TEXT NOT NULL, author_role TEXT NOT NULL, author_id TEXT NOT NULL, timestamp TEXT NOT NULL, type TEXT NOT NULL, content TEXT NOT NULL, provenance_pointer TEXT NOT NULL, source_id TEXT, internal_only INTEGER NOT NULL DEFAULT 1, version INTEGER NOT NULL DEFAULT 1, storage_tier TEXT NOT NULL DEFAULT 'hot')`,
  `CREATE TABLE IF NOT EXISTS care_sections (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, clinic_id TEXT NOT NULL, section_key TEXT NOT NULL, owner_role TEXT NOT NULL, content TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, updated_by TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS versions (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, version_number INTEGER NOT NULL, content TEXT NOT NULL, changed_by TEXT NOT NULL, changed_at TEXT NOT NULL, change_summary TEXT NOT NULL, parent_version INTEGER)`,
  `CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, entry_id TEXT, section_id TEXT, clinic_id TEXT NOT NULL, author_id TEXT NOT NULL, author_role TEXT NOT NULL, body TEXT NOT NULL, mentions_json TEXT NOT NULL, assignee_id TEXT, resolved INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, resolved_by TEXT)`,
  `CREATE TABLE IF NOT EXISTS highlights (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, clinic_id TEXT NOT NULL, title TEXT NOT NULL, excerpt TEXT NOT NULL, category TEXT NOT NULL, topic TEXT NOT NULL, risk_level TEXT NOT NULL, risk_reason TEXT NOT NULL, importance_score INTEGER NOT NULL, deterministic_floor INTEGER NOT NULL, learned_adjustment INTEGER NOT NULL, evidence_label TEXT NOT NULL, evidence_score INTEGER NOT NULL, status TEXT NOT NULL, provenance_pointer TEXT NOT NULL, source_entry_id TEXT NOT NULL, source_start INTEGER NOT NULL, source_end INTEGER NOT NULL, clinician_confirmed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS highlight_feedback (id TEXT PRIMARY KEY, clinic_id TEXT NOT NULL, topic TEXT NOT NULL, action TEXT NOT NULL, weight REAL NOT NULL, actor_id TEXT NOT NULL, created_at TEXT NOT NULL, surfaced INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, clinic_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL, assignee_id TEXT, due_at TEXT, source_entry_id TEXT NOT NULL, created_by TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS conflicts (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, clinic_id TEXT NOT NULL, entity_type TEXT NOT NULL, prior_value TEXT NOT NULL, new_value TEXT NOT NULL, prior_entry_id TEXT NOT NULL, new_entry_id TEXT NOT NULL, precedence TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS patient_summaries (id TEXT PRIMARY KEY, patient_id TEXT NOT NULL, clinic_id TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL, source_entry_ids_json TEXT NOT NULL, approved_by TEXT, approved_at TEXT, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS source_segments (id TEXT PRIMARY KEY, clinic_id TEXT NOT NULL, source_id TEXT NOT NULL, start_ms INTEGER NOT NULL, end_ms INTEGER NOT NULL, speaker TEXT NOT NULL, text TEXT NOT NULL, confidence REAL NOT NULL, redaction_state TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, clinic_id TEXT NOT NULL, actor_id TEXT NOT NULL, actor_role TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, metadata_json TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_patient_key ON care_sections(patient_id, section_key)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_versions_entity_number ON versions(entity_id, version_number)`,
  `CREATE INDEX IF NOT EXISTS idx_entries_patient_time ON entries(patient_id, timestamp DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_entries_clinic ON entries(clinic_id)`,
  `CREATE INDEX IF NOT EXISTS idx_comments_entry ON comments(entry_id)`,
  `CREATE INDEX IF NOT EXISTS idx_highlights_patient_score ON highlights(patient_id, importance_score DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_clinic_topic ON highlight_feedback(clinic_id, topic)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_patient_status ON tasks(patient_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_audit_clinic_time ON audit_logs(clinic_id, created_at DESC)`,
];

const aiDoctor = 'Persistent dry cough for 12 days. Lisinopril was increased from 10 mg to 20 mg on 6 February. Patient stopped the medicine yesterday after asking whether it caused the cough. No chest pain or breathlessness reported. Plan discussed: clinician review before any medication change.';
const staffNote = 'Called patient to review uploaded home readings. Two blood pressure values were above 160/95. Patient is available after 14:00; nurse follow-up requested.';
const clinicianNote = 'Penicillin allergy confirmed: urticaria developed within one hour of a childhood dose. Avoid penicillin pending formal allergy review.';

function id(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
async function run(db: D1Database, sql: string, ...values: unknown[]) { return db.prepare(sql).bind(...values).run(); }

export async function ensureDatabase() {
  const db = getRawDb();
  await db.batch(ddl.map(sql => db.prepare(sql)));
  const row = await db.prepare('SELECT COUNT(*) AS n FROM clinics').first<{ n: number }>();
  if (!row?.n) await seedDemo(db);
  return db;
}

export async function resetDemo() {
  const db = getRawDb();
  await db.batch(ddl.map(sql => db.prepare(sql)));
  const tables = ['audit_logs','source_segments','patient_summaries','conflicts','tasks','highlight_feedback','highlights','comments','versions','care_sections','entries','patients','users','clinics'];
  await db.batch(tables.map(table => db.prepare(`DELETE FROM ${table}`)));
  await seedDemo(db);
}

async function seedDemo(db: D1Database) {
  const now = '2026-08-27T09:42:00+08:00';
  const coughPhrase = 'Persistent dry cough for 12 days';
  const allergyPhrase = 'Penicillin allergy confirmed';
  const coughStart = aiDoctor.indexOf(coughPhrase);
  const allergyStart = clinicianNote.indexOf(allergyPhrase);
  const statements: D1PreparedStatement[] = [
    db.prepare('INSERT INTO clinics VALUES (?,?)').bind('clinic-1','Harbour Family Clinic'), db.prepare('INSERT INTO clinics VALUES (?,?)').bind('clinic-2','Northshore Clinic'),
    db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').bind('u-patient','clinic-1','patient','Evelyn Lim','patient-1'),
    db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').bind('u-staff','clinic-1','staff','Maya Tan',null), db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').bind('u-clinician','clinic-1','clinician','Dr. Amelia Chen',null), db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').bind('u-admin','clinic-1','admin','Alex Koh',null), db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').bind('u-nurse','clinic-1','staff','Priya Shah',null), db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').bind('u-other-staff','clinic-2','staff','Jordan Lee',null),
    db.prepare('INSERT INTO patients VALUES (?,?,?,?,?,?)').bind('patient-1','clinic-1','Evelyn Lim','NG-2048','1958-03-14',JSON.stringify(['Type 2 diabetes','Hypertension'])), db.prepare('INSERT INTO patients VALUES (?,?,?,?,?,?)').bind('patient-2','clinic-2','Synthetic Other Patient','NG-9001','1975-08-20',JSON.stringify(['Asthma'])),
    db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('entry-ai-doctor','patient-1','clinic-1','system','system',now,'ai_doctor_consult_summary',aiDoctor,'session:consult-dc-882#segment=seg-1','consult-dc-882',1,1,'hot'),
    db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('entry-staff','patient-1','clinic-1','staff','u-staff','2026-08-26T16:10:00+08:00','staff_note',staffNote,'entry:entry-staff#span=0-'+staffNote.length,null,1,1,'hot'),
    db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('entry-ai-patient','patient-1','clinic-1','system','system','2026-08-25T20:35:00+08:00','ai_patient_session_summary','Patient asked whether the new cough could be related to blood pressure medicine and what readings require urgent review.','session:patient-ai-441#segment=seg-4','patient-ai-441',1,1,'hot'),
    db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('entry-ai-nurse','patient-1','clinic-1','system','system','2026-02-06T14:20:00+08:00','ai_nurse_consult_summary','Medication reconciliation: metformin 500 mg twice daily and lisinopril increased to 20 mg once daily. Home BP monitoring taught back correctly.','session:nurse-106#segment=seg-6','nurse-106',1,1,'warm'),
    db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('entry-clinician','patient-1','clinic-1','clinician','u-clinician','2025-04-15T11:30:00+08:00','clinician_note',clinicianNote,'entry:entry-clinician#span=0-'+clinicianNote.length,null,1,1,'hot'),
    db.prepare('INSERT INTO entries VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('entry-system','patient-1','clinic-1','system','system','2025-04-15T11:31:00+08:00','system_event','Allergy safety rule promoted penicillin to the persistent problem list.','entry:entry-system#span=0-68',null,1,1,'warm'),
    db.prepare('INSERT INTO care_sections VALUES (?,?,?,?,?,?,?,?,?)').bind('section-plan','patient-1','clinic-1','clinician_plan','clinician','Continue lisinopril 20 mg daily. Review home BP log in four weeks.','1','u-clinician','2026-02-06T14:30:00+08:00'),
    db.prepare('INSERT INTO care_sections VALUES (?,?,?,?,?,?,?,?,?)').bind('section-staff','patient-1','clinic-1','staff_coordination','staff','Awaiting nurse review of elevated home readings; patient prefers afternoon calls.','1','u-staff','2026-08-26T16:12:00+08:00'),
    db.prepare('INSERT INTO versions VALUES (?,?,?,?,?,?,?,?,?)').bind('version-plan-1','section','section-plan',1,'Continue lisinopril 20 mg daily. Review home BP log in four weeks.','u-clinician','2026-02-06T14:30:00+08:00','Initial clinician plan',null),
    db.prepare('INSERT INTO versions VALUES (?,?,?,?,?,?,?,?,?)').bind('version-staff-1','section','section-staff',1,'Awaiting nurse review of elevated home readings; patient prefers afternoon calls.','u-staff','2026-08-26T16:12:00+08:00','Initial coordination note',null),
    db.prepare('INSERT INTO comments VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind('comment-1','entry-ai-doctor',null,'clinic-1','u-staff','staff','@DrChen Can you review the possible lisinopril-related cough before tomorrow morning?','["u-clinician"]','u-clinician',0,'2026-08-27T09:50:00+08:00',null),
    db.prepare('INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?)').bind('task-bp','patient-1','clinic-1','Review two home BP readings above 160/95','open','u-nurse','2026-08-27T17:00:00+08:00','entry-staff','u-staff'),
    db.prepare('INSERT INTO highlights VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('highlight-cough','patient-1','clinic-1','Possible ACE-inhibitor adverse effect',coughPhrase,'medication','ace_cough','high','Medication + symptom temporal link; clinician review required.',90,88,0,'strong',86,'suggested',`entry:entry-ai-doctor#span=${coughStart}-${coughStart+coughPhrase.length}`,'entry-ai-doctor',coughStart,coughStart+coughPhrase.length,0,now),
    db.prepare('INSERT INTO highlights VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('highlight-allergy','patient-1','clinic-1','Confirmed penicillin allergy',allergyPhrase,'allergy','penicillin_allergy','critical','Allergy is a protected safety class and cannot decay below its floor.',98,94,0,'strong',96,'accepted',`entry:entry-clinician#span=${allergyStart}-${allergyStart+allergyPhrase.length}`,'entry-clinician',allergyStart,allergyStart+allergyPhrase.length,1,'2025-04-15T11:30:00+08:00'),
    db.prepare('INSERT INTO conflicts VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind('conflict-med','patient-1','clinic-1','medication_dosage','Continue lisinopril 20 mg','Patient stopped lisinopril','entry-ai-nurse','entry-ai-doctor','newer clinician entry wins; otherwise flag','open',now),
    db.prepare('INSERT INTO patient_summaries VALUES (?,?,?,?,?,?,?,?,?)').bind('summary-approved','patient-1','clinic-1','Your care team is reviewing your cough and recent blood pressure readings. Please continue recording readings; seek urgent care for chest pain, severe breathlessness, fainting, or new weakness.','approved','["entry-staff"]','u-clinician','2026-08-27T10:00:00+08:00',now),
    db.prepare('INSERT INTO patient_summaries VALUES (?,?,?,?,?,?,?,?,?)').bind('summary-draft','patient-1','clinic-1','Draft: medication plan pending clinician confirmation.','draft','["entry-ai-doctor"]',null,null,now),
    db.prepare('INSERT INTO source_segments VALUES (?,?,?,?,?,?,?,?,?)').bind('seg-1','clinic-1','consult-dc-882',120000,246000,'Patient','I have had this dry cough for nearly two weeks, since the dose went up.',0.94,'redacted-before-model'),
    db.prepare('INSERT INTO source_segments VALUES (?,?,?,?,?,?,?,?,?)').bind('seg-2','clinic-1','consult-dc-882',247000,311000,'Clinician','Do not make further medication changes until we review the readings and symptoms.',0.97,'redacted-before-model'),
  ];
  await db.batch(statements);
  await db.prepare('PRAGMA optimize').run();
}

export async function audit(db: D1Database, input: { clinicId: string; actorId: string; actorRole: string; action: string; entityType: string; entityId: string; metadata: Record<string, unknown> }) {
  await run(db, 'INSERT INTO audit_logs VALUES (?,?,?,?,?,?,?,?,?)', id('audit'), input.clinicId, input.actorId, input.actorRole, input.action, input.entityType, input.entityId, JSON.stringify(input.metadata), new Date().toISOString());
}

export { id, run };
