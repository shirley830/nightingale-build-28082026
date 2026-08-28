import type { Role, UserContext } from './types';
const demoUsers: Record<string, UserContext> = {
  'demo-patient': { id: 'u-patient', name: 'Evelyn Lim', role: 'patient', clinicId: 'clinic-1', patientId: 'patient-1' },
  'demo-staff': { id: 'u-staff', name: 'Maya Tan', role: 'staff', clinicId: 'clinic-1' },
  'demo-clinician': { id: 'u-clinician', name: 'Dr. Amelia Chen', role: 'clinician', clinicId: 'clinic-1' },
  'demo-admin': { id: 'u-admin', name: 'Alex Koh', role: 'admin', clinicId: 'clinic-1' },
  'demo-other-clinic': { id: 'u-other-staff', name: 'Jordan Lee', role: 'staff', clinicId: 'clinic-2' },
};
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export function authenticate(request: Request): UserContext { const header = request.headers.get('authorization') ?? ''; const token = header.startsWith('Bearer ') ? header.slice(7) : ''; const user = demoUsers[token]; if (!user) throw new ApiError(401, 'Authentication required. Use an issued demo token or production identity mapping.'); return user; }
export function requireRole(user: UserContext, roles: Role[]) { if (!roles.includes(user.role)) throw new ApiError(403, `Role ${user.role} is not permitted for this operation.`); }
export function requireClinic(user: UserContext, clinicId: string) { if (user.clinicId !== clinicId) throw new ApiError(404, 'Record not found in the authenticated clinic scope.'); }
export function assertSectionOwner(user: UserContext, ownerRole: Role) { if (user.role === 'admin') return; if (user.role !== ownerRole) throw new ApiError(403, `${user.role} cannot overwrite a ${ownerRole}-owned section.`); }
