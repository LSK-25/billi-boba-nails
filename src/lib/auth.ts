export type UserRole = 'customer' | 'admin';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole | string | null;
};

export function getRoleHome(role: UserRole) {
  return role === 'admin' ? '/admin' : '/account';
}

export function getRoleLabel(role: UserRole) {
  return role === 'admin' ? 'Admin' : 'Customer';
}

export function normalizeRole(role?: string | null): UserRole {
  return role === 'admin' ? 'admin' : 'customer';
}

export function getDisplayName(email?: string | null, fullName?: string | null) {
  if (fullName?.trim()) return fullName.trim();
  if (email?.trim()) return email.split('@')[0] || 'Customer';
  return 'Customer';
}
