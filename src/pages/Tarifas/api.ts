import { apiFetch } from '../../api/client';
import { Tarifa } from '../../types';

export const getTarifas = async (): Promise<Tarifa[]> => {
  return apiFetch('/tarifas');
};

export const postTarifa = async (tarifa: Omit<Tarifa, 'id'>): Promise<Tarifa> => {
  return apiFetch('/tarifas', {
    method: 'POST',
    body: JSON.stringify(tarifa),
  });
};

export const putTarifa = async (id: number, tarifa: Omit<Tarifa, 'id'>): Promise<Tarifa> => {
  return apiFetch(`/tarifas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tarifa),
  });
};

export const deleteTarifa = async (id: number): Promise<void> => {
  return apiFetch(`/tarifas/${id}`, {
    method: 'DELETE',
  });
};