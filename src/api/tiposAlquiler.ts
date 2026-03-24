import { apiFetch } from './client';
import type { TipoAlquilerDTO } from '../types';

// "Ubicaciones" file repurposed → TipoAlquiler endpoints
// (Ubicaciones/pisos don't exist as backend entity — piso is a field on Habitacion)
export const getTiposAlquiler = async (): Promise<TipoAlquilerDTO[]> => {
  return apiFetch('/api/recepcion/tipos-alquiler');
};

export const getTipoAlquiler = async (id: number): Promise<TipoAlquilerDTO> => {
  return apiFetch(`/api/recepcion/tipos-alquiler/${id}`);
};

export const postTipoAlquiler = async (data: Omit<TipoAlquilerDTO, 'id'>): Promise<TipoAlquilerDTO> => {
  return apiFetch('/api/recepcion/tipos-alquiler', {
    method: 'POST',
    data,
  });
};

export const putTipoAlquiler = async (id: number, data: Omit<TipoAlquilerDTO, 'id'>): Promise<TipoAlquilerDTO> => {
  return apiFetch(`/api/recepcion/tipos-alquiler/${id}`, {
    method: 'PUT',
    data,
  });
};

export const deleteTipoAlquiler = async (id: number): Promise<void> => {
  return apiFetch(`/api/recepcion/tipos-alquiler/${id}`, {
    method: 'DELETE',
  });
};