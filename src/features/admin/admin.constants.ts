export const ADMIN_ACCESS_CODE = 'PULSE-OPS';

export function isAdminCode(value: string): boolean {
  return value.trim().toUpperCase() === ADMIN_ACCESS_CODE;
}
