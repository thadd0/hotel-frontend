import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { BedDouble, Clock } from 'lucide-react';

export default function Configuracion() {
  const {
    tiposHabitacion, addTipoHabitacion, updateTipoHabitacion, deleteTipoHabitacion,
    tiposAlquiler, addTipoAlquiler, updateTipoAlquiler, deleteTipoAlquiler,
    userRole,
  } = useHotel();

  const readOnly = userRole !== 'admin';
  const [tab, setTab] = useState('habitacion'); // 'habitacion' | 'alquiler'

  const tabStyle = (active) => ({
    padding: '8px 20px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    borderRadius: 'var(--r-md, 8px)', fontFamily: 'inherit',
    background: active ? 'var(--accent)' : 'var(--surface-2, #f5f5f5)',
    color: active ? '#fff' : 'var(--text-muted)',
    transition: 'all .15s',
  });

  return (
    <div className="page-anim">
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        <button style={tabStyle(tab === 'habitacion')} onClick={() => setTab('habitacion')}>
          Tipos de Habitación ({tiposHabitacion.length})
        </button>
        <button style={tabStyle(tab === 'alquiler')} onClick={() => setTab('alquiler')}>
          Tipos de Alquiler ({tiposAlquiler.length})
        </button>
      </div>

      {tab === 'habitacion' && (
        <GenericCRUD
          items={tiposHabitacion}
          onAdd={addTipoHabitacion}
          onUpdate={updateTipoHabitacion}
          onDelete={deleteTipoHabitacion}
          columns={[{ key: 'nombre', label: 'Nombre' }]}
          formFields={[{ key: 'nombre', label: 'Nombre del tipo', required: true, placeholder: 'SIMPLE' }]}
          emptyMsg="No hay tipos de habitación configurados"
          emptyIcon={<BedDouble size={42} />}
          modalTitle="Tipo de Habitación"
          readOnly={readOnly}
        />
      )}

      {tab === 'alquiler' && (
        <GenericCRUD
          items={tiposAlquiler}
          onAdd={addTipoAlquiler}
          onUpdate={updateTipoAlquiler}
          onDelete={deleteTipoAlquiler}
          columns={[{ key: 'nombre', label: 'Nombre' }]}
          formFields={[{ key: 'nombre', label: 'Nombre del tipo', required: true, placeholder: 'POR HORA' }]}
          emptyMsg="No hay tipos de alquiler configurados"
          emptyIcon={<Clock size={42} />}
          modalTitle="Tipo de Alquiler"
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
