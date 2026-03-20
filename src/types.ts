export type Rol = {
  id: number;
  nombre: 'ROLE_ADMINISTRADOR' | 'ROLE_RECEPCIONISTA';
  descripcion?: string;
};

export type TipoDocumento = {
  id: number;
  nombre: 'DNI' | 'CE' | 'PASAPORTE';
};

export type TipoHabitacion = {
  id: number;
  nombre: string; // SIMPLE, DOBLE, MATRIMONIAL
};

export type TipoAlquiler = {
  id: number;
  nombre: 'POR HORA' | 'POR DIA' | 'POR NOCHE';
};

export type Usuario = {
  id: number;
  nombre: string;
  num_documento: string;
  telefono?: string;
  id_tipo_documento: number;
  id_rol: number;
};

export type Cliente = {
  id: number;
  nombre: string;
  num_documento: string;
  telefono?: string;
  id_tipo_documento: number;
};

export type Habitacion = {
  id: number;
  numero: string;
  piso: number;
  descripcion?: string;
  estado: 'DISPONIBLE' | 'OCUPADA' | 'LIMPIEZA' | 'MANTENIMIENTO';
  id_tipo_habitacion: number;
};

export type Tarifa = {
  id: number;
  precio: number;
  id_tipo_habitacion: number;
  id_tipo_alquiler: number;
};

export type Alquiler = {
  id: number;
  fecha_ingreso: string;
  fecha_prevista: string;
  fecha_salida?: string;
  precio_fijado: number;
  cant_tiempo: number;
  pago_pendiente: number;
  estado: 'ACTIVO' | 'FINALIZADO';
  id_cliente: number;
  id_habitacion: number;
  id_tarifa: number;
  id_usuario: number;
};

export type CuentaAlquiler = {
  id: number;
  descripcion: string;
  precio_unit: number;
  cantidad: number;
  sub_total: number;
  estado: 'PENDIENTE' | 'PAGADO';
  id_alquiler: number;
};

export type MovimientoCaja = {
  id: number;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  metodo_pago: 'YAPE' | 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  concepto: string;
  fecha: string;
  id_usuario: number;
  id_alquiler?: number;
};

// Legacy (to be deprecated)
export type Sucursal = { id: number; nombre: string };
export type Person = Cliente & { tipoDocumento: string; documento: string }; // Map to Cliente
export type CheckInPayload = {
  persons: Person[];
  roomSelections: Array<{ id: number; tarifaId: number }>;
  nights: number;
  startDate: string;
  endDate: string;
};

