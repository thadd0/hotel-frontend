import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initialData } from '../data/initialData';
import { getHabitaciones, postHabitacion, putHabitacion, deleteHabitacion, postCheckIn, postCheckOut } from '../api/habitaciones';
import { getCategorias, postCategoria, putCategoria, deleteCategoria } from '../api/categorias';
import { getSucursales, postSucursal, putSucursal, deleteSucursal } from '../api/sucursales';
import { getUbicaciones, postUbicacion, putUbicacion, deleteUbicacion } from '../api/ubicaciones';
import { getTarifas, postTarifa, putTarifa, deleteTarifa } from '../api/tarifas';

const HotelContext = createContext(null);

export function HotelProvider({ children }) {
  const [sucursales,   setSucursales]   = useState(initialData.sucursales);
  const [categorias,   setCategorias]   = useState(initialData.categorias);
  const [ubicaciones,  setUbicaciones]  = useState(initialData.ubicaciones);
  const [tarifas,      setTarifas]      = useState(initialData.tarifas);
  const [habitaciones, setHabitaciones] = useState([]); // loaded from backend
  const [sucursalActiva, setSucursalActiva] = useState(1);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  const nextId = (arr) => (arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1);

  const addSucursal = useCallback(async (d) => {
    try {
      const newSuc = await postSucursal(d);
      setSucursales(p => [...p, newSuc]);
    } catch (error) {
      console.warn('Failed to add sucursal:', error);
      setSucursales(p => [...p, { ...d, id: nextId(p) }]);
    }
  }, []);

  const updateSucursal = useCallback(async (id, d) => {
    try {
      const updated = await putSucursal(id, d);
      setSucursales(p => p.map(s => s.id === id ? updated : s));
    } catch (error) {
      console.warn('Failed to update sucursal:', error);
      setSucursales(p => p.map(s => s.id === id ? { ...s, ...d } : s));
    }
  }, []);

  const deleteSucursal = useCallback(async (id) => {
    try {
      await deleteSucursal(id);
      setSucursales(p => p.filter(s => s.id !== id));
    } catch (error) {
      console.warn('Failed to delete sucursal:', error);
      setSucursales(p => p.filter(s => s.id !== id));
    }
  }, []);

  const addCategoria = useCallback(async (d) => {
    try {
      const newCat = await postCategoria(d);
      setCategorias(p => [...p, newCat]);
    } catch (error) {
      console.warn('Failed to add categoria:', error);
      setCategorias(p => [...p, { ...d, id: nextId(p) }]);
    }
  }, []);

  const updateCategoria = useCallback(async (id, d) => {
    try {
      const updated = await putCategoria(id, d);
      setCategorias(p => p.map(c => c.id === id ? updated : c));
    } catch (error) {
      console.warn('Failed to update categoria:', error);
      setCategorias(p => p.map(c => c.id === id ? { ...c, ...d } : c));
    }
  }, []);

  const deleteCategoria = useCallback(async (id) => {
    try {
      await deleteCategoria(id);
      setCategorias(p => p.filter(c => c.id !== id));
    } catch (error) {
      console.warn('Failed to delete categoria:', error);
      setCategorias(p => p.filter(c => c.id !== id));
    }
  }, []);

  const addUbicacion = useCallback(async (d) => {
    try {
      const newUbi = await postUbicacion(d);
      setUbicaciones(p => [...p, newUbi]);
    } catch (error) {
      console.warn('Failed to add ubicacion:', error);
      setUbicaciones(p => [...p, { ...d, id: nextId(p) }]);
    }
  }, []);

  const updateUbicacion = useCallback(async (id, d) => {
    try {
      const updated = await putUbicacion(id, d);
      setUbicaciones(p => p.map(u => u.id === id ? updated : u));
    } catch (error) {
      console.warn('Failed to update ubicacion:', error);
      setUbicaciones(p => p.map(u => u.id === id ? { ...u, ...d } : u));
    }
  }, []);

  const deleteUbicacion = useCallback(async (id) => {
    try {
      await deleteUbicacion(id);
      setUbicaciones(p => p.filter(u => u.id !== id));
    } catch (error) {
      console.warn('Failed to delete ubicacion:', error);
      setUbicaciones(p => p.filter(u => u.id !== id));
    }
  }, []);

  const addTarifa = useCallback(async (d) => {
    try {
      const newTar = await postTarifa(d);
      setTarifas(p => [...p, newTar]);
    } catch (error) {
      console.warn('Failed to add tarifa:', error);
      setTarifas(p => [...p, { ...d, id: nextId(p) }]);
    }
  }, []);

  const updateTarifa = useCallback(async (id, d) => {
    try {
      const updated = await putTarifa(id, d);
      setTarifas(p => p.map(t => t.id === id ? updated : t));
    } catch (error) {
      console.warn('Failed to update tarifa:', error);
      setTarifas(p => p.map(t => t.id === id ? { ...t, ...d } : t));
    }
  }, []);

  const deleteTarifa = useCallback(async (id) => {
    try {
      await deleteTarifa(id);
      setTarifas(p => p.filter(t => t.id !== id));
    } catch (error) {
      console.warn('Failed to delete tarifa:', error);
      setTarifas(p => p.filter(t => t.id !== id));
    }
  }, []);

  const addHabitacion = useCallback(async (d) => {
    try {
      const newHab = await postHabitacion(d);
      setHabitaciones(p => [...p, newHab]);
    } catch (error) {
      console.warn('Failed to add habitacion:', error);
      // Fallback to local
      setHabitaciones(p => [...p, { ...d, id: nextId(p), tarifaIds: d.tarifaIds||[], persons:[] }]);
    }
  }, []);

  const updateHabitacion = useCallback(async (id, d) => {
    try {
      const updated = await putHabitacion(id, d);
      setHabitaciones(p => p.map(h => h.id === id ? updated : h));
    } catch (error) {
      console.warn('Failed to update habitacion:', error);
      // Fallback to local
      setHabitaciones(p => p.map(h => h.id === id ? { ...h, ...d } : h));
    }
  }, []);

  const deleteHabitacion = useCallback(async (id) => {
    try {
      await deleteHabitacion(id);
      setHabitaciones(p => p.filter(h => h.id !== id));
    } catch (error) {
      console.warn('Failed to delete habitacion:', error);
      // Fallback to local
      setHabitaciones(p => p.filter(h => h.id !== id));
    }
  }, []);
  const cambiarEstado    = useCallback((id,e)=> setHabitaciones(p => p.map(h => h.id===id?{...h,estado:e}:h)), []);
  const checkIn = useCallback(async (persons, roomSelections, nights, startDate, endDate) => {
    // Persist on backend (if available) and update local state
    try {
      await postCheckIn({ persons, roomSelections, nights, startDate, endDate });
    } catch (error) {
      // Silently ignore: app continues to work offline / with mocked data
      console.warn('Check-in API failed:', error);
    }

    setHabitaciones(p => p.map(h => {
      const sel = roomSelections.find(r => r.id === h.id);
      if (!sel) return h;

      const tarifa = tarifas.find(t => t.id === sel.tarifaId);
      const tarifaValue = Number(tarifa?.nombre || 0);

      return {
        ...h,
        estado: 'OCUPADO',
        persons,
        checkIn: {
          tarifaId: sel.tarifaId,
          tarifaValue,
          nights,
          startDate,
          endDate,
          total: tarifaValue * nights,
        },
      };
    }));
  }, [tarifas]);

  const checkOut = useCallback(async (habitationId) => {
    try {
      await postCheckOut(habitationId);
    } catch (error) {
      console.warn('Checkout API failed:', error);
    }

    setHabitaciones(p => p.map(h => 
      h.id === habitationId
        ? { ...h, estado: 'LIMPIEZA', persons: [] }
        : h
    ));
  }, []);

  const byBranch = (arr) => arr.filter(i => i.sucursalId === sucursalActiva);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHabitaciones();
        setHabitaciones(data);
      } catch (error) {
        console.warn('Failed to load habitaciones from backend:', error);
      }
    };

    load();
  }, []);

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
      addHabitacion, updateHabitacion, deleteHabitacion, cambiarEstado, checkIn, checkOut,

      isLoggedIn, login, logout,
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
