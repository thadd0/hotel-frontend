// ── Mock data matching backend DTOs exactly ──────────────────────────
// NOTE: This file is only used as fallback. Data is always fetched from backend on app load.

export const initialData = {
  tiposHabitacion: [],
  tiposAlquiler: [],
  tarifas: [],
  empresas: [],
  tiposDocumento: [],
  clientes: [],
  habitaciones: [
    { id: 1,  piso: 1, numero: '101', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 2,  piso: 1, numero: '102', descripcion: null, estado: 'OCUPADA',       tipoHabitacion: { id: 1, nombre: 'SIMPLE' } },
    { id: 3,  piso: 1, numero: '103', descripcion: null, estado: 'LIMPIEZA',      tipoHabitacion: { id: 1, nombre: 'SIMPLE' } },
    { id: 4,  piso: 1, numero: '104', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 5,  piso: 1, numero: '105', descripcion: null, estado: 'OCUPADA',       tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 6,  piso: 2, numero: '201', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 1, nombre: 'SIMPLE' } },
    { id: 7,  piso: 2, numero: '202', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 8,  piso: 2, numero: '203', descripcion: null, estado: 'LIMPIEZA',      tipoHabitacion: { id: 1, nombre: 'SIMPLE' } },
    { id: 9,  piso: 2, numero: '204', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 10, piso: 2, numero: '205', descripcion: null, estado: 'OCUPADA',       tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 11, piso: 2, numero: '206', descripcion: null, estado: 'MANTENIMIENTO', tipoHabitacion: { id: 1, nombre: 'SIMPLE' } },
    { id: 12, piso: 2, numero: '207', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 1, nombre: 'SIMPLE' } },
    { id: 13, piso: 3, numero: '301', descripcion: null, estado: 'DISPONIBLE',    tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 14, piso: 3, numero: '302', descripcion: null, estado: 'OCUPADA',       tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
    { id: 15, piso: 3, numero: '303', descripcion: null, estado: 'MANTENIMIENTO', tipoHabitacion: { id: 2, nombre: 'DOBLE' } },
  ],

  // AlquilerResponseDTO — mock for active rentals (GET /api/recepcion/alquiler/activos)
  alquileres: [
    { id: 1, numeroHabitacion: '102', nombreCliente: 'Juan Pérez García', subTotal: 160, pagoPendiente: 80, fechaIngreso: '2024-10-10T14:00:00', fechaPrevista: '2024-10-12T12:00:00', estadoAlquiler: 'ACTIVO', estadoHabitacion: 'OCUPADA' },
    { id: 2, numeroHabitacion: '105', nombreCliente: 'María López Ríos', subTotal: 360, pagoPendiente: 240, fechaIngreso: '2024-10-09T15:00:00', fechaPrevista: '2024-10-12T12:00:00', estadoAlquiler: 'ACTIVO', estadoHabitacion: 'OCUPADA' },
    { id: 3, numeroHabitacion: '205', nombreCliente: 'Carlos Mendoza Ruiz', subTotal: 120, pagoPendiente: 120, fechaIngreso: '2024-10-11T10:00:00', fechaPrevista: '2024-10-12T12:00:00', estadoAlquiler: 'ACTIVO', estadoHabitacion: 'OCUPADA' },
    { id: 4, numeroHabitacion: '302', nombreCliente: 'Juan Pérez García', subTotal: 480, pagoPendiente: 0, fechaIngreso: '2024-10-08T16:00:00', fechaPrevista: '2024-10-12T12:00:00', estadoAlquiler: 'ACTIVO', estadoHabitacion: 'OCUPADA' },
  ],

  // MovimientoCajaResponseDTO — mock for today's cash (GET /api/recepcion/caja/resumen-hoy)
  movimientosCaja: [
    { id: 1, tipo: 'INGRESO', monto: 80, metodoPago: 'EFECTIVO', concepto: 'Adelanto check-in Hab. 102', fecha: '2024-10-10T14:05:00', nombreUsuario: 'Admin', numeroHabitacion: '102', nombreCliente: 'Juan Pérez García' },
    { id: 2, tipo: 'INGRESO', monto: 120, metodoPago: 'YAPE', concepto: 'Adelanto check-in Hab. 105', fecha: '2024-10-09T15:10:00', nombreUsuario: 'Admin', numeroHabitacion: '105', nombreCliente: 'María López Ríos' },
    { id: 3, tipo: 'EGRESO', monto: 50, metodoPago: 'EFECTIVO', concepto: 'Compra suministros limpieza', fecha: '2024-10-10T09:00:00', nombreUsuario: 'Admin', numeroHabitacion: null, nombreCliente: null },
  ],
};

// ── Estado visual config (keys match backend EstadoHabitacion enum) ──
export const ESTADOS = {
  DISPONIBLE:    { label:'DISPONIBLE',    color:'var(--green)',  bg:'var(--green-bg)',  border:'var(--green-border)',  dot:'#16a34a' },
  OCUPADA:       { label:'OCUPADA',       color:'var(--red)',    bg:'var(--red-bg)',    border:'var(--red-border)',    dot:'#dc2626' },
  MANTENIMIENTO: { label:'MANTENIMIENTO', color:'var(--orange)', bg:'var(--orange-bg)', border:'var(--orange-border)', dot:'#ea580c' },
  LIMPIEZA:      { label:'LIMPIEZA',      color:'var(--purple)', bg:'var(--purple-bg)', border:'var(--purple-border)', dot:'#7c3aed' },
};

