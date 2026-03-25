import { apiFetch } from './client';
import type { AlquilerResponseDTO, CheckInRequestDTO } from '../types';

export async function getAlquileresActivos(): Promise<AlquilerResponseDTO[]> {
  return apiFetch('/api/recepcion/alquiler/activos');
}

export async function getAlquileresHistorial(): Promise<AlquilerResponseDTO[]> {
  return apiFetch('/api/recepcion/alquiler/historial');
}

export async function getAlquiler(id: number): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${id}`);
}

export async function postCheckIn(data: CheckInRequestDTO): Promise<AlquilerResponseDTO> {
  return apiFetch('/api/recepcion/alquiler/check-in', {
    method: 'POST',
    data,
  });
}

export async function postCheckOut(id: number, metodoPago: string): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${id}/check-out`, {
    method: 'POST',
    params: { metodoPago },
  });
}

export async function patchAlquilerMontos(id: number, data: { subTotal: number; pagoPendiente: number }): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${id}/montos`, {
    method: 'PATCH',
    data,
  });
}

