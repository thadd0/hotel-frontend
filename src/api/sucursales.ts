import { apiFetch } from './client';
import { Sucursal } from '../types';

export const getSucursales = async (): Promise<Sucursal[]> => {
  return apiFetch('/sucursales');
};

export const postSucursal = async (sucursal: Omit<Sucursal, 'id'>): Promise<Sucursal> => {
  return apiFetch('/sucursales', {
    method: 'POST',
    body: JSON.stringify(sucursal),
  });
};

export const putSucursal = async (id: number, sucursal: Omit<Sucursal, 'id'>): Promise<Sucursal> => {
  return apiFetch(`/sucursales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sucursal),
  });
};

export const deleteSucursal = async (id: number): Promise<void> => {
  return apiFetch(`/sucursales/${id}`, {
    method: 'DELETE',
  });
};