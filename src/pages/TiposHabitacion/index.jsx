import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { BedDouble } from 'lucide-react';

export default function TiposHabitacion() {
  const { tiposHabitacion, addTipoHabitacion, updateTipoHabitacion, deleteTipoHabitacion, userRole } = useHotel();

  const readOnly = userRole === 'recepcion';

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'capacidad', label: 'Capacidad', render: item => `${item.capacidad} persona${item.capacidad > 1 ? 's' : ''}` },
    { key: 'visible', label: 'Visible', render: i => (
      <span style={{ fontSize: 12.5, fontWeight: 600, color: i.visible ? 'var(--green)' : 'var(--red)' }}>
        {i.visible ? 'Sí' : 'No'}
      </span>
    ) },
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre del tipo', required: true, placeholder: 'SIMPLE' },
    { key: 'capacidad', label: 'Capacidad máxima (personas)', required: true, type: 'number', placeholder: '1' },
  ];

  return (
    <div className="page-anim">
      <GenericCRUD
        items={tiposHabitacion}
        onAdd={addTipoHabitacion}
        onUpdate={updateTipoHabitacion}
        onDelete={deleteTipoHabitacion}
        columns={columns}
        formFields={formFields}
        emptyMsg="No hay tipos de habitación configurados"
        emptyIcon={<BedDouble size={42} />}
        modalTitle="Tipo de Habitación"
        readOnly={readOnly}
      />
    </div>
  );
}

