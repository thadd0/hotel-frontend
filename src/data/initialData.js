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
  habitaciones: [
    { id:1,  numero:'101', categoriaId:1, ubicacionId:1, sucursalId:1, tarifaIds:[1,2], estado:'DISPONIBLE',    visible:true  },
    { id:2,  numero:'102', categoriaId:4, ubicacionId:1, sucursalId:1, tarifaIds:[1],   estado:'OCUPADO',       visible:true  },
    { id:3,  numero:'103', categoriaId:2, ubicacionId:1, sucursalId:1, tarifaIds:[3],   estado:'LIMPIEZA',      visible:true  },
    { id:4,  numero:'201', categoriaId:3, ubicacionId:2, sucursalId:1, tarifaIds:[2],   estado:'DISPONIBLE',    visible:true  },
    { id:5,  numero:'205', categoriaId:4, ubicacionId:2, sucursalId:1, tarifaIds:[1,3], estado:'MANTENIMIENTO', visible:true  },
    { id:6,  numero:'301', categoriaId:5, ubicacionId:3, sucursalId:1, tarifaIds:[4],   estado:'DISPONIBLE',    visible:true  },
    { id:7,  numero:'305', categoriaId:5, ubicacionId:3, sucursalId:1, tarifaIds:[4],   estado:'DISPONIBLE',    visible:true  },
    { id:8,  numero:'401', categoriaId:2, ubicacionId:4, sucursalId:1, tarifaIds:[3,4], estado:'OCUPADO',       visible:true  },
    { id:9,  numero:'402', categoriaId:2, ubicacionId:4, sucursalId:1, tarifaIds:[3],   estado:'DISPONIBLE',    visible:false },
    { id:10, numero:'101', categoriaId:7, ubicacionId:5, sucursalId:2, tarifaIds:[5],   estado:'DISPONIBLE',    visible:true  },
    { id:11, numero:'201', categoriaId:6, ubicacionId:6, sucursalId:2, tarifaIds:[6],   estado:'OCUPADO',       visible:true  },
  ],
};

export const ESTADOS = {
  DISPONIBLE:    { label:'DISPONIBLE',    color:'var(--green)',  bg:'var(--green-bg)',  border:'var(--green-border)',  dot:'#16a34a' },
  OCUPADO:       { label:'OCUPADO',       color:'var(--red)',    bg:'var(--red-bg)',    border:'var(--red-border)',    dot:'#dc2626' },
  MANTENIMIENTO: { label:'MANTENIMIENTO', color:'var(--orange)', bg:'var(--orange-bg)', border:'var(--orange-border)', dot:'#ea580c' },
  LIMPIEZA:      { label:'LIMPIEZA',      color:'var(--purple)', bg:'var(--purple-bg)', border:'var(--purple-border)', dot:'#7c3aed' },
};
