import { apiFetch } from './client';
import type { Usuario, Rol } from '../types';

export async function getUsuarios(): Promise<Usuario[]> {
  return apiFetch('/api/usuarios');
}

export async function postUsuario(usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
  return apiFetch('/api/usuarios', {
    method: 'POST',
    data: usuario,
  });
}

export async function putUsuario(id: number, usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
  return apiFetch(`/api/usuarios/${id}`, {
    method: 'PUT',
    data: usuario,
  });
}

export async function deleteUsuario(id: number) {
  return apiFetch(`/api/usuarios/${id}`, {
    method: 'DELETE',
  });
}

export async function getRoles(): Promise<Rol[]> {
  return apiFetch('/api/roles');
}

export async function login(num_documento: string, contrasena: string): Promise<{ usuario: Usuario; token: string }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    data: { num_documento, contrasena }
  });
}

