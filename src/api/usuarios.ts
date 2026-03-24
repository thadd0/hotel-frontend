import { apiFetch } from './client';
import type { UsuarioDTO } from '../types';

// ── My Profile ──────────────────────────────────────────────────────
export async function getMe(): Promise<UsuarioDTO> {
  return apiFetch('/api/me');
}

export async function updateMe(data: { nombre: string; telefono?: string; numDocumento: string; tipoDocumento?: string }): Promise<UsuarioDTO> {
  return apiFetch('/api/me', { method: 'PUT', data });
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  return apiFetch('/api/me/password', { method: 'PUT', data });
}

// ── Admin: Manage Receptionists ─────────────────────────────────────
export async function getRecepcionistas(): Promise<UsuarioDTO[]> {
  return apiFetch('/api/admin/usuarios/recepcionistas');
}

export async function getRecepcionista(id: number): Promise<UsuarioDTO> {
  return apiFetch(`/api/admin/usuarios/recepcionistas/${id}`);
}

export async function postRecepcionista(data: { nombre: string; numDocumento: string; password: string; telefono?: string; tipoDocumento: string }): Promise<UsuarioDTO> {
  return apiFetch('/api/admin/usuarios/recepcionistas', { method: 'POST', data });
}

export async function putRecepcionista(id: number, data: { nombre: string; telefono?: string; tipoDocumento: string }): Promise<UsuarioDTO> {
  return apiFetch(`/api/admin/usuarios/recepcionistas/${id}`, { method: 'PUT', data });
}

export async function resetRecepcionistaPassword(id: number, newPassword: string) {
  return apiFetch(`/api/admin/usuarios/recepcionistas/${id}/password`, { method: 'PUT', data: { newPassword } });
}

