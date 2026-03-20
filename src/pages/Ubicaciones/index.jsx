import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { MapPin } from 'lucide-react';

export default function Ubicaciones() {
  const { ubicaciones, addUbicacion, updateUbicacion, deleteUbicacion } = useHotel();
  const sucursalNombre = 'Hotel';

  const columns = [
    { key:'nombre', label:'Ubicación' },
    { key:'visible', label:'Visible', render: i => (
      <span style={{ fontSize:12.5, fontWeight:600, color: i.visible?'var(--green)':'var(--red)' }}>
        {i.visible ? 'Sí' : 'No'}
      </span>
    )},
    { key:'sucursal', label:'Sucursal', render: () => (
      <span style={{ fontSize:12.5, color:'var(--text-muted)' }}>{sucursalNombre}</span>
    )},
  ];

  return (
    <GenericCRUD
      items={ubicaciones}
      onAdd={addUbicacion}
      onUpdate={updateUbicacion}
      onDelete={deleteUbicacion}
      columns={columns}
      formFields={[{ key:'nombre', label:'Nombre de ubicación', required:true, placeholder:'Ej: PRIMER PISO' }]}
      emptyMsg="No hay ubicaciones registradas"
      emptyIcon={<MapPin size={38}/>}
      modalTitle="Ubicación"
      // sucursalActiva removido
    />
  );
}
