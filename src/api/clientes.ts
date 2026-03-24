import { apiFetch } from './client';
import type { ClienteDTO } from '../types';

export async function getClientes(): Promise<ClienteDTO[]> {
  return apiFetch('/api/recepcion/clientes');
}

export async function getCliente(id: number): Promise<ClienteDTO> {
  return apiFetch(`/api/recepcion/clientes/${id}`);
}

export async function postCliente(data: Omit<ClienteDTO, 'id'>): Promise<ClienteDTO> {
  return apiFetch('/api/recepcion/clientes', {
    method: 'POST',
    data,
  });
}

export async function putCliente(id: number, data: Omit<ClienteDTO, 'id'>): Promise<ClienteDTO> {
  return apiFetch(`/api/recepcion/clientes/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteCliente(id: number) {
  return apiFetch(`/api/recepcion/clientes/${id}`, {
    method: 'DELETE',
  });
}

