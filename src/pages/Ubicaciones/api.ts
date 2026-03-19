import { apiFetch } from '../../api/client';
import { Ubicacion } from '../../types';

export const getUbicaciones = async (): Promise<Ubicacion[]> => {
  return apiFetch('/ubicaciones');
};

export const postUbicacion = async (ubicacion: Omit<Ubicacion, 'id'>): Promise<Ubicacion> => {
  return apiFetch('/ubicaciones', {
    method: 'POST',
    body: JSON.stringify(ubicacion),
  });
};

export const putUbicacion = async (id: number, ubicacion: Omit<Ubicacion, 'id'>): Promise<Ubicacion> => {
  return apiFetch(`/ubicaciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(ubicacion),
  });
};

export const deleteUbicacion = async (id: number): Promise<void> => {
  return apiFetch(`/ubicaciones/${id}`, {
    method: 'DELETE',
  });
};