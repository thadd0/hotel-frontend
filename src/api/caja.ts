import { apiFetch } from './client';
import type { MovimientoCajaResponseDTO, ResumenCajaDTO, GastoRequestDTO } from '../types';

export async function getResumenHoy(): Promise<MovimientoCajaResponseDTO[]> {
  return apiFetch('/api/recepcion/caja/resumen-hoy');
}

export async function getResumen(desde: string, hasta: string): Promise<ResumenCajaDTO> {
  return apiFetch('/api/recepcion/caja/resumen', { params: { desde, hasta } });
}

export async function getMovimientosRango(desde: string, hasta: string): Promise<MovimientoCajaResponseDTO[]> {
  return apiFetch('/api/recepcion/caja/movimientos-rango', { params: { desde, hasta } });
}

export async function postEgreso(data: GastoRequestDTO): Promise<MovimientoCajaResponseDTO> {
  return apiFetch('/api/recepcion/caja/egreso', {
    method: 'POST',
    data,
  });
}

export async function postIngresoExtra(data: GastoRequestDTO): Promise<MovimientoCajaResponseDTO> {
  return apiFetch('/api/recepcion/caja/ingreso-extra', {
    method: 'POST',
    data,
  });
}

export async function getMovimientosPorAlquiler(alquilerId: number): Promise<MovimientoCajaResponseDTO[]> {
  return apiFetch(`/api/recepcion/caja/alquiler/${alquilerId}`);
}

export async function patchMovimientoMonto(id: number, monto: number): Promise<MovimientoCajaResponseDTO> {
  return apiFetch(`/api/recepcion/caja/${id}/monto`, {
    method: 'PATCH',
    params: { monto },
  });
}

export async function cobrarMovimientoEmpresa(id: number, metodoPago: string): Promise<MovimientoCajaResponseDTO> {
  return apiFetch(`/api/recepcion/caja/${id}/cobrar`, {
    method: 'PATCH',
    params: { metodoPago },
  });
}

export async function cobrarLoteEmpresa(
  empresaId: number,
  desde: string,
  hasta: string,
  metodoPago: string
): Promise<MovimientoCajaResponseDTO[]> {
  return apiFetch('/api/recepcion/caja/cobrar-lote-empresa', {
    method: 'POST',
    params: { empresaId, desde, hasta, metodoPago },
  });
}
