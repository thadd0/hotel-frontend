import { createContext, useContext, useState, useCallback } from 'react';
import { initialData } from '../data/initialData';

const HotelContext = createContext(null);

export function HotelProvider({ children }) {
  const [sucursales,   setSucursales]   = useState(initialData.sucursales);
  const [categorias,   setCategorias]   = useState(initialData.categorias);
  const [ubicaciones,  setUbicaciones]  = useState(initialData.ubicaciones);
  const [tarifas,      setTarifas]      = useState(initialData.tarifas);
  const [habitaciones, setHabitaciones] = useState(initialData.habitaciones);
  const [sucursalActiva, setSucursalActiva] = useState(1);

  const nextId = (arr) => (arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1);

  const addSucursal    = useCallback((d)   => setSucursales(p  => [...p,  { ...d, id: nextId(p)  }]), []);
  const updateSucursal = useCallback((id,d)=> setSucursales(p  => p.map(s => s.id===id?{...s,...d}:s)), []);
  const deleteSucursal = useCallback((id)  => setSucursales(p  => p.filter(s => s.id!==id)), []);

  const addCategoria    = useCallback((d)   => setCategorias(p => [...p,  { ...d, id: nextId(p)  }]), []);
  const updateCategoria = useCallback((id,d)=> setCategorias(p => p.map(c => c.id===id?{...c,...d}:c)), []);
  const deleteCategoria = useCallback((id)  => setCategorias(p => p.filter(c => c.id!==id)), []);

  const addUbicacion    = useCallback((d)   => setUbicaciones(p=> [...p,  { ...d, id: nextId(p)  }]), []);
  const updateUbicacion = useCallback((id,d)=> setUbicaciones(p=> p.map(u => u.id===id?{...u,...d}:u)), []);
  const deleteUbicacion = useCallback((id)  => setUbicaciones(p=> p.filter(u => u.id!==id)), []);

  const addTarifa    = useCallback((d)   => setTarifas(p    => [...p,  { ...d, id: nextId(p)  }]), []);
  const updateTarifa = useCallback((id,d)=> setTarifas(p    => p.map(t => t.id===id?{...t,...d}:t)), []);
  const deleteTarifa = useCallback((id)  => setTarifas(p    => p.filter(t => t.id!==id)), []);

  const addHabitacion    = useCallback((d)   => setHabitaciones(p => [...p, { ...d, id: nextId(p), tarifaIds: d.tarifaIds||[] }]), []);
  const updateHabitacion = useCallback((id,d)=> setHabitaciones(p => p.map(h => h.id===id?{...h,...d}:h)), []);
  const deleteHabitacion = useCallback((id)  => setHabitaciones(p => p.filter(h => h.id!==id)), []);
  const cambiarEstado    = useCallback((id,e)=> setHabitaciones(p => p.map(h => h.id===id?{...h,estado:e}:h)), []);

  const byBranch = (arr) => arr.filter(i => i.sucursalId === sucursalActiva);

  return (
    <HotelContext.Provider value={{
      sucursales, sucursalActiva, setSucursalActiva,
      addSucursal, updateSucursal, deleteSucursal,

      categorias:    byBranch(categorias),
      allCategorias: categorias,
      addCategoria, updateCategoria, deleteCategoria,

      ubicaciones:    byBranch(ubicaciones),
      allUbicaciones: ubicaciones,
      addUbicacion, updateUbicacion, deleteUbicacion,

      tarifas:    byBranch(tarifas),
      allTarifas: tarifas,
      addTarifa, updateTarifa, deleteTarifa,

      habitaciones:    byBranch(habitaciones),
      allHabitaciones: habitaciones,
      addHabitacion, updateHabitacion, deleteHabitacion, cambiarEstado,
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be inside HotelProvider');
  return ctx;
};
