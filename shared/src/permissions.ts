export const ROLES = ['analyst', 'netrunner', 'executive'] as const;
export type Role = (typeof ROLES)[number];

export const CLEARANCE: Record<Role, number> = {
    analyst: 1,
    netrunner: 2,
    executive: 3,
};

export function clearanceFor(role: Role): number {
    return CLEARANCE[role];
}