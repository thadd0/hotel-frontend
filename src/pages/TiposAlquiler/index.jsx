import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { Clock } from 'lucide-react';

export default function TiposAlquiler() {
  const { tiposAlquiler, addTipoAlquiler, updateTipoAlquiler, deleteTipoAlquiler, userRole } = useHotel();

  const readOnly = userRole === 'recepcion';

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'multiplier', label: 'Multiplicador', render: item => `x${item.multiplier}` },
    { key: 'visible', label: 'Visible', render: i => (
      <span style={{ fontSize: 12.5, fontWeight: 600, color: i.visible ? 'var(--green)' : 'var(--red)' }}>
        {i.visible ? 'Sí' : 'No'}
      </span>
    ) },
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre del tipo', required: true, placeholder: 'POR HORA' },
    { key: 'multiplier', label: 'Multiplicador tarifa (decimal)', required: true, type: 'number', placeholder: '0.04' },
  ];

  return (
    <div className="page-anim">
      <GenericCRUD
        items={tiposAlquiler}
        onAdd={addTipoAlquiler}
        onUpdate={updateTipoAlquiler}
        onDelete={deleteTipoAlquiler}
        columns={columns}
        formFields={formFields}
        emptyMsg="No hay tipos de alquiler configurados"
        emptyIcon={<Clock size={42} />}
        modalTitle="Tipo de Alquiler"
        readOnly={readOnly}
      />
    </div>
  );
}

