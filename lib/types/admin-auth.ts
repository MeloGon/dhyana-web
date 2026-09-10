export interface AdminIdentity {
  id: string;
  email: string;
}

export type AuthFormMode = 'login' | 'recover' | 'password';

export type AuthConfirmation =
  | { code: string }
  | { tokenHash: string; type: 'invite' | 'recovery' }
  | { accessToken: string; refreshToken: string };

export interface AuthResult {
  message: string;
}
