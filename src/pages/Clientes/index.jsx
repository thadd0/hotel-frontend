import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { Users } from 'lucide-react';

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente, userRole } = useHotel();
  
  const isReadOnly = userRole === 'recepcion';

  const columns = [
    { key: 'nombre', label: 'Nombre Completo' },
    { key: 'num_documento', label: 'DNI' },
    { key: 'telefono', label: 'Teléfono', render: c => c.telefono || '—' },
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre completo', required: true, placeholder: 'Juan Pérez López' },
    { key: 'num_documento', label: 'Número de documento', required: true, placeholder: '12345678' },
    { key: 'telefono', label: 'Teléfono', placeholder: '+51 987 654 321' },
  ];

  return (
    <div className="page-anim">
      <GenericCRUD
        items={clientes}
        onAdd={addCliente}
        onUpdate={updateCliente}
        onDelete={deleteCliente}
        columns={columns}
        formFields={formFields}
        emptyMsg="No hay clientes registrados"
        emptyIcon={<Users size={42}/>}
        modalTitle="Cliente"
        readOnly={isReadOnly}
      />
    </div>
  );
}

