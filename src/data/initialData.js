export const initialData = {
  sucursales: [
    { id: 1, nombre: 'Oficina Principal' },
    { id: 2, nombre: 'Sucursal Norte' },
    { id: 3, nombre: 'Sucursal Sur' },
  ],
  categorias: [
    { id: 1, nombre: 'SIMPLE CON BAÑO PROPIO',       visible: true, sucursalId: 1 },
    { id: 2, nombre: 'DOBLES CON BAÑO PROPIO',       visible: true, sucursalId: 1 },
    { id: 3, nombre: 'DOBLES CON BAÑO COMPARTIDO',   visible: true, sucursalId: 1 },
    { id: 4, nombre: 'SIMPLES CON BAÑO COMPARTIDO',  visible: true, sucursalId: 1 },
    { id: 5, nombre: 'MATRIMONIALES',                visible: true, sucursalId: 1 },
    { id: 6, nombre: 'SUITE',                        visible: true, sucursalId: 2 },
    { id: 7, nombre: 'SIMPLE CON BAÑO PROPIO',       visible: true, sucursalId: 2 },
  ],
  ubicaciones: [
    { id: 1, nombre: 'PRIMER PISO',  visible: true, sucursalId: 1 },
    { id: 2, nombre: 'SEGUNDO PISO', visible: true, sucursalId: 1 },
    { id: 3, nombre: 'TERCER PISO',  visible: true, sucursalId: 1 },
    { id: 4, nombre: 'CUARTO PISO',  visible: true, sucursalId: 1 },
    { id: 5, nombre: 'PRIMER PISO',  visible: true, sucursalId: 2 },
    { id: 6, nombre: 'SEGUNDO PISO', visible: true, sucursalId: 2 },
  ],
  tarifas: [
    { id: 1, nombre: '50',  visible: true, sucursalId: 1 },
    { id: 2, nombre: '80',  visible: true, sucursalId: 1 },
    { id: 3, nombre: '100', visible: true, sucursalId: 1 },
    { id: 4, nombre: '150', visible: true, sucursalId: 1 },
    { id: 5, nombre: '70',  visible: true, sucursalId: 2 },
    { id: 6, nombre: '120', visible: true, sucursalId: 2 },
  ],
  // Las habitaciones se cargan desde el backend en tiempo de ejecución.
  habitaciones: [],
};

export const ESTADOS = {
  DISPONIBLE:    { label:'DISPONIBLE',    color:'var(--green)',  bg:'var(--green-bg)',  border:'var(--green-border)',  dot:'#16a34a' },
  OCUPADO:       { label:'OCUPADO',       color:'var(--red)',    bg:'var(--red-bg)',    border:'var(--red-border)',    dot:'#dc2626' },
  MANTENIMIENTO: { label:'MANTENIMIENTO', color:'var(--orange)', bg:'var(--orange-bg)', border:'var(--orange-border)', dot:'#ea580c' },
  LIMPIEZA:      { label:'LIMPIEZA',      color:'var(--purple)', bg:'var(--purple-bg)', border:'var(--purple-border)', dot:'#7c3aed' },
};
