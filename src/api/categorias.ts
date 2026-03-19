import { apiFetch } from './client';
import { Categoria } from '../types';

export const getCategorias = async (): Promise<Categoria[]> => {
  return apiFetch('/categorias');
};

export const postCategoria = async (categoria: Omit<Categoria, 'id'>): Promise<Categoria> => {
  return apiFetch('/categorias', {
    method: 'POST',
    body: JSON.stringify(categoria),
  });
};

export const putCategoria = async (id: number, categoria: Omit<Categoria, 'id'>): Promise<Categoria> => {
  return apiFetch(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  });
};

export const deleteCategoria = async (id: number): Promise<void> => {
  return apiFetch(`/categorias/${id}`, {
    method: 'DELETE',
  });
};