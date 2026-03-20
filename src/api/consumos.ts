import { apiFetch } from './client';
import type { CuentaAlquiler } from '../types';

export async function getConsumosByAlquiler(id_alquiler: number): Promise<CuentaAlquiler[]> {
  return apiFetch(`/api/consumos/alquiler/${id_alquiler}`);
}

export async function postConsumo(consumo: Omit<CuentaAlquiler, 'id'>): Promise<CuentaAlquiler> {
  return apiFetch('/api/consumos', {
    method: 'POST',
    data: consumo,
  });
}

export async function putConsumo(id: number, consumo: Omit<CuentaAlquiler, 'id'>): Promise<CuentaAlquiler> {
  return apiFetch(`/api/consumos/${id}`, {
    method: 'PUT',
    data: consumo,
  });
}

export async function deleteConsumo(id: number) {
  return apiFetch(`/api/consumos/${id}`, {
    method: 'DELETE',
  });
}

