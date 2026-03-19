export type Sucursal = { id: number; nombre: string };
export type Categoria = { id: number; nombre: string; visible: boolean; sucursalId: number };
export type Ubicacion = { id: number; nombre: string; visible: boolean; sucursalId: number };
export type Tarifa = { id: number; nombre: string; visible: boolean; sucursalId: number };
export type Habitacion = {
  id: number;
  numero: string;
  categoriaId: number;
  ubicacionId: number;
  sucursalId: number;
  tarifaIds: number[];
  estado: string;
  visible: boolean;
  persons: Person[];
  checkIn?: {
    tarifaId: number;
    tarifaValue: number;
    nights: number;
    startDate: string;
    endDate: string;
    total: number;
  };
};

export type Person = { id: number; nombre: string; telefono: string; tipoDocumento: string; documento: string };

export type CheckInPayload = {
  persons: Person[];
  roomSelections: Array<{ id: number; tarifaId: number | null }>;
  nights: number;
  startDate: string;
  endDate: string;
};
