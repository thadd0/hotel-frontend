import { apiFetch } from './client';
import type { Cliente } from '../types';

export async function getClientes(): Promise<Cliente[]> {
  return apiFetch('/api/clientes');
}

export async function postCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
  return apiFetch('/api/clientes', {
    method: 'POST',
    data: cliente,
  });
}

export async function putCliente(id: number, cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
  return apiFetch(`/api/clientes/${id}`, {
    method: 'PUT',
    data: cliente,
  });
}

export async function deleteCliente(id: number) {
  return apiFetch(`/api/clientes/${id}`, {
    method: 'DELETE',
  });
}

export async function getClienteByDocumento(num_documento: string): Promise<Cliente | null> {
  return apiFetch(`/api/clientes/by-documento/${num_documento}`);
}

