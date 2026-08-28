export type Role = 'patient' | 'staff' | 'clinician' | 'admin';
export type UserContext = { id: string; name: string; role: Role; clinicId: string; patientId?: string };
export type Candidate = { topic: string; category: 'allergy' | 'medication' | 'dosage' | 'symptom' | 'task' | 'general'; riskLevel: 'critical' | 'high' | 'moderate' | 'low'; recencyDays: number; unresolvedTask?: boolean; clinicianConfirmed?: boolean; evidenceCoverage: number; evidenceQuality: number };
export type ImportanceResult = { score: number; deterministicFloor: number; learnedAdjustment: number; riskReason: string; evidenceLabel: 'strong' | 'moderate' | 'limited' | 'abstain'; evidenceScore: number; abstained: boolean };
