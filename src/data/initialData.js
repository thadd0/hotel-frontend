export const initialData = {
  categorias: [  // Only SIMPLES and DOBLES
    { id: 1, nombre: 'SIMPLE CON BAÑO PROPIO', visible: true },
    { id: 2, nombre: 'DOBLES CON BAÑO PROPIO',  visible: true },
  ],
  ubicaciones: [  // Solo 3 pisos (sin sucursalId)
    { id: 1, nombre: 'Piso 1', visible: true },
    { id: 2, nombre: 'Piso 2', visible: true },
    { id: 3, nombre: 'Piso 3', visible: true },
  ],
  tarifas: [
    { id: 1, nombre: '50',  visible: true },
    { id: 2, nombre: '80',  visible: true },
  ],
  // No sucursales - byBranch bypassed with sucursalActiva=0
  habitaciones: [  // 18 rooms SIMPLE/DOBLE across 3 pisos
    { id: 1,  numero: '101', categoriaId: 1, ubicacionId: 1, tarifaIds: [1], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 2,  numero: '102', categoriaId: 1, ubicacionId: 1, tarifaIds: [1], estado: 'OCUPADO',    visible: true, persons: [{id:1,nombre:'Juan Pérez',telefono:'+54-11-1234',tipoDocumento:'DNI',documento:'30123456'}], checkIn:{tarifaId:1,tarifaValue:50,nights:2,startDate:'2024-10-10',endDate:'2024-10-12',total:100} },
    { id: 3,  numero: '103', categoriaId: 1, ubicacionId: 1, tarifaIds: [1], estado: 'LIMPIEZA',   visible: true, persons: [] },
    { id: 4,  numero: '104', categoriaId: 2, ubicacionId: 1, tarifaIds: [2], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 5,  numero: '105', categoriaId: 2, ubicacionId: 1, tarifaIds: [2], estado: 'OCUPADO',    visible: true, persons: [{id:2,nombre:'Ana García',telefono:'+54-11-5678',tipoDocumento:'DNI',documento:'25123456'}], checkIn:{tarifaId:2,tarifaValue:80,nights:3,startDate:'2024-10-09',endDate:'2024-10-12',total:240} },
    { id: 6,  numero: '106', categoriaId: 2, ubicacionId: 1, tarifaIds: [2], estado: 'MANTENIMIENTO',visible: true, persons: [] },
    { id: 7,  numero: '201', categoriaId: 1, ubicacionId: 2, tarifaIds: [1], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 8,  numero: '202', categoriaId: 1, ubicacionId: 2, tarifaIds: [1], estado: 'LIMPIEZA',   visible: true, persons: [] },
    { id: 9,  numero: '203', categoriaId: 1, ubicacionId: 2, tarifaIds: [1], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 10, numero: '204', categoriaId: 2, ubicacionId: 2, tarifaIds: [2], estado: 'OCUPADO',    visible: true, persons: [{id:3,nombre:'Luis Rodríguez',telefono:'+54-11-9012',tipoDocumento:'DNI',documento:'33123456'}], checkIn:{tarifaId:2,tarifaValue:80,nights:1,startDate:'2024-10-11',endDate:'2024-10-12',total:80} },
    { id: 11, numero: '205', categoriaId: 2, ubicacionId: 2, tarifaIds: [2], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 12, numero: '301', categoriaId: 1, ubicacionId: 3, tarifaIds: [1], estado: 'MANTENIMIENTO',visible: true, persons: [] },
    { id: 13, numero: '302', categoriaId: 1, ubicacionId: 3, tarifaIds: [1], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 14, numero: '303', categoriaId: 2, ubicacionId: 3, tarifaIds: [2], estado: 'LIMPIEZA',   visible: true, persons: [] },
    { id: 15, numero: '304', categoriaId: 2, ubicacionId: 3, tarifaIds: [2], estado: 'OCUPADO',    visible: true, persons: [{id:4,nombre:'Marta López',telefono:'+54-11-3456',tipoDocumento:'Pasaporte',documento:'AA123456'}], checkIn:{tarifaId:2,tarifaValue:80,nights:4,startDate:'2024-10-08',endDate:'2024-10-12',total:320} },
    { id: 16, numero: '305', categoriaId: 2, ubicacionId: 3, tarifaIds: [2], estado: 'DISPONIBLE',  visible: true, persons: [] },
    { id: 17, numero: '107', categoriaId: 1, ubicacionId: 1, tarifaIds: [1], estado: 'DISPONIBLE', visible: true, persons: [] },
    { id: 18, numero: '108', categoriaId: 2, ubicacionId: 1, tarifaIds: [2], estado: 'DISPONIBLE', visible: true, persons: [] },
  ],
};

export const ESTADOS = {
  DISPONIBLE:    { label:'DISPONIBLE',    color:'var(--green)',  bg:'var(--green-bg)',  border:'var(--green-border)',  dot:'#16a34a' },
  OCUPADO:       { label:'OCUPADO',       color:'var(--red)',    bg:'var(--red-bg)',    border:'var(--red-border)',    dot:'#dc2626' },
  MANTENIMIENTO: { label:'MANTENIMIENTO', color:'var(--orange)', bg:'var(--orange-bg)', border:'var(--orange-border)', dot:'#ea580c' },
  LIMPIEZA:      { label:'LIMPIEZA',      color:'var(--purple)', bg:'var(--purple-bg)', border:'var(--purple-border)', dot:'#7c3aed' },
};

