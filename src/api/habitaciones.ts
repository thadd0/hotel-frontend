import { apiFetch } from './client';
import type { Habitacion, CheckInPayload } from '../types';

export async function getHabitaciones() {
  return apiFetch<Habitacion[]>('/api/habitaciones');
}

export async function postHabitacion(habitacion: Omit<Habitacion, 'id' | 'persons' | 'checkIn'>) {
  return apiFetch<Habitacion>('/api/habitaciones', {
    method: 'POST',
    data: habitacion,
  });
}

export async function putHabitacion(id: number, habitacion: Omit<Habitacion, 'id' | 'persons' | 'checkIn'>) {
  return apiFetch<Habitacion>(`/api/habitaciones/${id}`, {
    method: 'PUT',
    data: habitacion,
  });
}

export async function deleteHabitacion(id: number) {
  return apiFetch(`/api/habitaciones/${id}`, {
    method: 'DELETE',
  });
}

export async function postCheckIn(payload: CheckInPayload) {
  return apiFetch('/api/checkin', {
    method: 'POST',
    data: payload,
  });
}

export async function postCheckOut(habitacionId: number) {
  return apiFetch(`/api/habitaciones/${habitacionId}/checkout`, {
    method: 'POST',
  });
}
