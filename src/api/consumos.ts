import { apiFetch } from './client';
import type { CuentaAlquilerDTO } from '../types';

export async function getCuentasByAlquiler(alquilerId: number): Promise<CuentaAlquilerDTO[]> {
  return apiFetch(`/api/recepcion/alquiler/${alquilerId}/cuenta`);
}

export async function postCuenta(alquilerId: number, data: Omit<CuentaAlquilerDTO, 'id' | 'subTotal' | 'alquilerId'>): Promise<CuentaAlquilerDTO> {
  return apiFetch(`/api/recepcion/alquiler/${alquilerId}/cuenta`, {
    method: 'POST',
    data,
  });
}

export async function putCuenta(alquilerId: number, id: number, data: Omit<CuentaAlquilerDTO, 'id' | 'subTotal' | 'alquilerId'>): Promise<CuentaAlquilerDTO> {
  return apiFetch(`/api/recepcion/alquiler/${alquilerId}/cuenta/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCuenta(alquilerId: number, id: number) {
  return apiFetch(`/api/recepcion/alquiler/${alquilerId}/cuenta/${id}`, {
    method: 'DELETE',
  });
}

