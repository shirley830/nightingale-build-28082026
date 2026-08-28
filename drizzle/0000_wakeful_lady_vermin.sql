CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`actor_role` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`metadata_json` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_clinic_time` ON `audit_logs` (`clinic_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `care_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`section_key` text NOT NULL,
	`owner_role` text NOT NULL,
	`content` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sections_patient_key` ON `care_sections` (`patient_id`,`section_key`);--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text,
	`section_id` text,
	`clinic_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author_role` text NOT NULL,
	`body` text NOT NULL,
	`mentions_json` text NOT NULL,
	`assignee_id` text,
	`resolved` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`resolved_by` text
);
--> statement-breakpoint
CREATE INDEX `idx_comments_entry` ON `comments` (`entry_id`);--> statement-breakpoint
CREATE INDEX `idx_comments_section` ON `comments` (`section_id`);--> statement-breakpoint
CREATE TABLE `conflicts` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`prior_value` text NOT NULL,
	`new_value` text NOT NULL,
	`prior_entry_id` text NOT NULL,
	`new_entry_id` text NOT NULL,
	`precedence` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`author_role` text NOT NULL,
	`author_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`provenance_pointer` text NOT NULL,
	`source_id` text,
	`internal_only` integer DEFAULT 1 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`storage_tier` text DEFAULT 'hot' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_entries_patient_time` ON `entries` (`patient_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_entries_clinic` ON `entries` (`clinic_id`);--> statement-breakpoint
CREATE TABLE `highlight_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`topic` text NOT NULL,
	`action` text NOT NULL,
	`weight` real NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` text NOT NULL,
	`surfaced` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_feedback_clinic_topic` ON `highlight_feedback` (`clinic_id`,`topic`);--> statement-breakpoint
CREATE TABLE `highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`category` text NOT NULL,
	`topic` text NOT NULL,
	`risk_level` text NOT NULL,
	`risk_reason` text NOT NULL,
	`importance_score` integer NOT NULL,
	`deterministic_floor` integer NOT NULL,
	`learned_adjustment` integer NOT NULL,
	`evidence_label` text NOT NULL,
	`evidence_score` integer NOT NULL,
	`status` text NOT NULL,
	`provenance_pointer` text NOT NULL,
	`source_entry_id` text NOT NULL,
	`source_start` integer NOT NULL,
	`source_end` integer NOT NULL,
	`clinician_confirmed` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_highlights_patient_score` ON `highlights` (`patient_id`,`importance_score`);--> statement-breakpoint
CREATE TABLE `patient_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`content` text NOT NULL,
	`status` text NOT NULL,
	`source_entry_ids_json` text NOT NULL,
	`approved_by` text,
	`approved_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`display_name` text NOT NULL,
	`synthetic_id` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`conditions_json` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_patients_clinic` ON `patients` (`clinic_id`);--> statement-breakpoint
CREATE TABLE `source_segments` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`source_id` text NOT NULL,
	`start_ms` integer NOT NULL,
	`end_ms` integer NOT NULL,
	`speaker` text NOT NULL,
	`text` text NOT NULL,
	`confidence` real NOT NULL,
	`redaction_state` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_segments_source` ON `source_segments` (`source_id`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`assignee_id` text,
	`due_at` text,
	`source_entry_id` text NOT NULL,
	`created_by` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_patient_status` ON `tasks` (`patient_id`,`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`patient_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_users_clinic` ON `users` (`clinic_id`);--> statement-breakpoint
CREATE TABLE `versions` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`content` text NOT NULL,
	`changed_by` text NOT NULL,
	`changed_at` text NOT NULL,
	`change_summary` text NOT NULL,
	`parent_version` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_versions_entity_number` ON `versions` (`entity_id`,`version_number`);