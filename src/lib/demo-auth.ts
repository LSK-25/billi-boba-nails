export type UserRole = 'customer' | 'admin';

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const AUTH_STORAGE_KEY = 'bnb-auth-user-v1';

export const demoUsers: Record<UserRole, DemoUser> = {
  customer: {
    id: 'customer-demo',
    name: 'BILLi&BoBA Customer',
    email: 'customer@billiboba.test',
    role: 'customer',
  },
  admin: {
    id: 'admin-demo',
    name: 'Studio Admin',
    email: 'admin@billiboba.test',
    role: 'admin',
  },
};

export function getRoleHome(role: UserRole) {
  return role === 'admin' ? '/admin' : '/account';
}

export function getRoleLabel(role: UserRole) {
  return role === 'admin' ? 'Admin' : 'Customer';
}
