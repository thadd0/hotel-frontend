import { apiFetch } from './client';
import type { HabitacionDTO } from '../types';

export async function getHabitaciones() {
  return apiFetch<HabitacionDTO[]>('/api/recepcion/habitaciones');
}

export async function postHabitacion(habitacion: Omit<HabitacionDTO, 'id'>) {
  return apiFetch<HabitacionDTO>('/api/recepcion/habitaciones', {
    method: 'POST',
    data: habitacion,
  });
}

export async function putHabitacion(id: number, habitacion: Omit<HabitacionDTO, 'id'>) {
  return apiFetch<HabitacionDTO>(`/api/recepcion/habitaciones/${id}`, {
    method: 'PUT',
    data: habitacion,
  });
}

export async function patchEstadoHabitacion(id: number, estado: string) {
  return apiFetch<HabitacionDTO>(`/api/recepcion/habitaciones/${id}/estado`, {
    method: 'PATCH',
    params: { estado },
  });
}

export async function deleteHabitacion(id: number) {
  return apiFetch(`/api/recepcion/habitaciones/${id}`, {
    method: 'DELETE',
  });
}
