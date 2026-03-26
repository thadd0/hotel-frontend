import { apiFetch } from './client';
import type { TarifaDTO } from '../types';

export const getTarifas = async (): Promise<TarifaDTO[]> => {
  return apiFetch('/api/recepcion/tarifas');
};

export const postTarifa = async (data: Omit<TarifaDTO, 'id'>): Promise<TarifaDTO> => {
  return apiFetch('/api/recepcion/tarifas', {
    method: 'POST',
    data,
  });
};

export const putTarifa = async (id: number, data: Omit<TarifaDTO, 'id'>): Promise<TarifaDTO> => {
  return apiFetch(`/api/recepcion/tarifas/${id}`, {
    method: 'PUT',
    data,
  });
};

export const deleteTarifa = async (id: number): Promise<void> => {
  return apiFetch(`/api/recepcion/tarifas/${id}`, {
    method: 'DELETE',
  });
};

export const patchIncrementoTarifas = async (porcentaje: number): Promise<TarifaDTO[]> => {
  return apiFetch('/api/recepcion/tarifas/incremento-porcentaje', {
    method: 'PATCH',
    data: { porcentaje },
  });
};