import { apiFetch } from '../api/client';
import type { AuthResponse, LoginRequest } from '../types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiFetch('/auth/login', {
    method: 'POST',
    data: {
      num_documento: data.numDocumento,
      password: data.password,
      rol: data.rol,
    },
  });
}

export async function logout(): Promise<string> {
  return apiFetch('/auth/logout', { method: 'POST' });
}
