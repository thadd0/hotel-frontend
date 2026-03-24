// ── Mock data matching backend DTOs exactly ──────────────────────────

export const initialData = {
  // TipoHabitacionDTO — GET /api/recepcion/tipos-habitacion
  tiposHabitacion: [
    { id: 1, nombre: 'SIMPLE' },
    { id: 2, nombre: 'DOBLE' },
  ],

  // TipoAlquilerDTO — GET /api/recepcion/tipos-alquiler
  tiposAlquiler: [
    { id: 1, nombre: 'POR HORA' },
    { id: 2, nombre: 'POR DIA' },
    { id: 3, nombre: 'POR NOCHE' },
  ],

  // TarifaDTO — GET /api/recepcion/tarifas
  // Nested tipoHabitacion & tipoAlquiler objects (as backend returns)
  tarifas: [
    { id: 1, precio: 25,  tipoHabitacion: { id: 1, nombre: 'SIMPLE' }, tipoAlquiler: { id: 1, nombre: 'POR HORA' } },
    { id: 2, precio: 80,  tipoHabitacion: { id: 1, nombre: 'SIMPLE' }, tipoAlquiler: { id: 2, nombre: 'POR DIA' } },
    { id: 3, precio: 60,  tipoHabitacion: { id: 1, nombre: 'SIMPLE' }, tipoAlquiler: { id: 3, nombre: 'POR NOCHE' } },
    { id: 4, precio: 35,  tipoHabitacion: { id: 2, nombre: 'DOBLE' },  tipoAlquiler: { id: 1, nombre: 'POR HORA' } },
    { id: 5, precio: 120, tipoHabitacion: { id: 2, nombre: 'DOBLE' },  tipoAlquiler: { id: 2, nombre: 'POR DIA' } },
    { id: 6, precio: 90,  tipoHabitacion: { id: 2, nombre: 'DOBLE' },  tipoAlquiler: { id: 3, nombre: 'POR NOCHE' } },
  ],

  // EmpresaDTO — GET /api/admin/empresas
  empresas: [
    { id: 1, nombre: 'Empresa Demo S.A.C.', ruc: '20123456789', telefono: '+51 1 234 5678' },
    { id: 2, nombre: 'Transportes Perú E.I.R.L.', ruc: '20987654321', telefono: '+51 1 987 6543' },
  ],

  // TipoDocumentoDTO (referenced in clientes)
  tiposDocumento: [
    { id: 1, nombre: 'DNI' },
    { id: 2, nombre: 'CE' },
    { id: 3, nombre: 'PASAPORTE' },
  ],

  // ClienteDTO — GET /api/recepcion/clientes
  clientes: [
    { id: 1, nombre: 'Juan Pérez García', numDocumento: '72345678', telefono: '+51 987 654 321', tipoDocumento: { id: 1, nombre: 'DNI' }, empresaId: null, empresaNombre: null },
    { id: 2, nombre: 'María López Ríos', numDocumento: '45678901', telefono: '+51 912 345 678', tipoDocumento: { id: 1, nombre: 'DNI' }, empresaId: 1, empresaNombre: 'Empresa Demo S.A.C.' },
    { id: 3, nombre: 'Carlos Mendoza Ruiz', numDocumento: 'CE202501', telefono: null, tipoDocumento: { id: 2, nombre: 'CE' }, empresaId: null, empresaNombre: null },
  ],

  // HabitacionDTO — GET /api/recepcion/habitaciones
  // Uses piso (int) instead of ubicacionId, tipoHabitacion object instead of categoriaId
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

