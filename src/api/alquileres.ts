import { apiFetch } from './client';
import type { Alquiler } from '../types';

export async function getAlquileres(): Promise<Alquiler[]> {
  return apiFetch('/api/alquileres');
}

export async function postAlquiler(alquiler: Omit<Alquiler, 'id'>): Promise<Alquiler> {
  return apiFetch('/api/alquileres', {
    method: 'POST',
    data: alquiler,
  });
}

export async function putAlquiler(id: number, alquiler: Omit<Alquiler, 'id'>): Promise<Alquiler> {
  return apiFetch(`/api/alquileres/${id}`, {
    method: 'PUT',
    data: alquiler,
  });
}

export async function deleteAlquiler(id: number) {
  return apiFetch(`/api/alquileres/${id}`, {
    method: 'DELETE',
  });
}

export async function getAlquilerActivos(): Promise<Alquiler[]> {
  return apiFetch('/api/alquileres/activos');
}

