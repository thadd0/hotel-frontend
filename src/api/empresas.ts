import { apiFetch } from './client';
import type { EmpresaDTO } from '../types';

// "Sucursales" repurposed → Empresas endpoints (the real backend entity)
export const getEmpresas = async (): Promise<EmpresaDTO[]> => {
  try {
    return await apiFetch('/api/admin/empresas');
  } catch {
    return apiFetch('/api/recepcion/empresas');
  }
};

export const getEmpresa = async (id: number): Promise<EmpresaDTO> => {
  return apiFetch(`/api/admin/empresas/${id}`);
};

export const getEmpresasRecepcion = async (): Promise<EmpresaDTO[]> => {
  return apiFetch('/api/recepcion/empresas');
};

export const getEmpresaRecepcion = async (id: number): Promise<EmpresaDTO> => {
  return apiFetch(`/api/recepcion/empresas/${id}`);
};

export const postEmpresa = async (data: Omit<EmpresaDTO, 'id'>): Promise<EmpresaDTO> => {
  return apiFetch('/api/admin/empresas', {
    method: 'POST',
    data,
  });
};

export const putEmpresa = async (id: number, data: Omit<EmpresaDTO, 'id'>): Promise<EmpresaDTO> => {
  return apiFetch(`/api/admin/empresas/${id}`, {
    method: 'PUT',
    data,
  });
};

export const deleteEmpresa = async (id: number): Promise<void> => {
  return apiFetch(`/api/admin/empresas/${id}`, {
    method: 'DELETE',
  });
};