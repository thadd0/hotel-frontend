import { apiFetch } from './client';
import type { TipoHabitacionDTO } from '../types';

// "Categorías" in the front maps to TipoHabitacion in the backend
export const getTiposHabitacion = async (): Promise<TipoHabitacionDTO[]> => {
  return apiFetch('/api/recepcion/tipos-habitacion');
};

export const postTipoHabitacion = async (data: Omit<TipoHabitacionDTO, 'id'>): Promise<TipoHabitacionDTO> => {
  return apiFetch('/api/recepcion/tipos-habitacion', {
    method: 'POST',
    data,
  });
};

export const putTipoHabitacion = async (id: number, data: Omit<TipoHabitacionDTO, 'id'>): Promise<TipoHabitacionDTO> => {
  return apiFetch(`/api/recepcion/tipos-habitacion/${id}`, {
    method: 'PUT',
    data,
  });
};

export const deleteTipoHabitacion = async (id: number): Promise<void> => {
  return apiFetch(`/api/recepcion/tipos-habitacion/${id}`, {
    method: 'DELETE',
  });
};