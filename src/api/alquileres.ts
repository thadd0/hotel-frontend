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

export async function postCheckOut(id: number, metodoPago?: string): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${id}/check-out`, {
    method: 'POST',
    params: metodoPago ? { metodoPago } : {},
  });
}

export async function patchAlquilerMontos(id: number, data: { subTotal: number; pagoPendiente: number }): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${id}/montos`, {
    method: 'PATCH',
    data,
  });
}

export async function postAgregarHuesped(idAlquiler: number, clienteId: number): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${idAlquiler}/huespedes/${clienteId}`, {
    method: 'POST',
  });
}

export async function deleteQuitarHuesped(idAlquiler: number, clienteId: number): Promise<AlquilerResponseDTO> {
  return apiFetch(`/api/recepcion/alquiler/${idAlquiler}/huespedes/${clienteId}`, {
    method: 'DELETE',
  });
}

export async function getReporteMensualHabitacion(habitacionId: number, mes: number, anio: number): Promise<AlquilerResponseDTO[]> {
  return apiFetch('/api/recepcion/alquiler/reporte-mensual', {
    params: { habitacionId, mes, anio },
  });
}
