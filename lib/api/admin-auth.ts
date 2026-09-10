import type { AuthConfirmation, AuthResult } from '@/lib/types/admin-auth';

async function postAuth(action: string, body: object = {}): Promise<AuthResult> {
  const response = await fetch(`/api/auth/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const loginAdmin = (email: string, password: string) => postAuth('login', { email, password });
export const recoverAdminPassword = (email: string) => postAuth('recover', { email });
export const saveAdminPassword = (password: string) => postAuth('password', { password });
export const confirmAdminAccess = (payload: AuthConfirmation) => postAuth('confirm', payload);
export const logoutAdmin = () => postAuth('logout');
