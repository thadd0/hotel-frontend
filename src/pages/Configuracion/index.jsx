import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { PageHeader, TabBtn } from '../../components/UI/index.jsx';
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

  const tabs = (
    <div style={{ display: 'flex', gap: 4 }}>
      <TabBtn active={tab === 'habitacion'} onClick={() => setTab('habitacion')} label="Tipos de Habitación" count={tiposHabitacion.length} />
      <TabBtn active={tab === 'alquiler'} onClick={() => setTab('alquiler')} label="Tipos de Alquiler" count={tiposAlquiler.length} />
    </div>
  );

  return (
    <div className="page-anim">
      <PageHeader title="Configuración" subtitle="Tipos de habitación y alquiler" />

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
          toolbarPrefix={tabs}
        />
      )}

      {tab === 'alquiler' && (
        <GenericCRUD
          items={tiposAlquiler}
          onAdd={addTipoAlquiler}
          onUpdate={updateTipoAlquiler}
          onDelete={deleteTipoAlquiler}
          columns={[
            { key: 'nombre', label: 'Nombre' },
            { key: 'unidad', label: 'Unidad', render: (item) => item.unidad === 'HORA' ? 'Horas' : 'Días' },
            { key: 'multiplicador', label: 'Multiplicador' },
          ]}
          formFields={[
            { key: 'nombre', label: 'Nombre del tipo', required: true, placeholder: 'POR SEMANA' },
            { key: 'unidad', label: 'Unidad de tiempo', required: true, type: 'select', options: [
              { value: 'HORA', label: 'Horas' },
              { value: 'DIA', label: 'Días' },
            ]},
            { key: 'multiplicador', label: 'Multiplicador', required: true, type: 'number', min: 1, placeholder: '7 (ej. semana = 7 días)' },
          ]}
          emptyMsg="No hay tipos de alquiler configurados"
          emptyIcon={<Clock size={42} />}
          modalTitle="Tipo de Alquiler"
          readOnly={readOnly}
          toolbarPrefix={tabs}
        />
      )}
    </div>
  );
}
