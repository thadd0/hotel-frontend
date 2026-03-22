import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { Tag } from 'lucide-react';

export default function Categorias() {
  const { categorias, addCategoria, updateCategoria, deleteCategoria, userRole } = useHotel();
  const sucursalNombre = 'Todos los Pisos';
  const readOnly = userRole === 'recepcion';

  const columns = [
    { key:'nombre', label:'Nombre de categoría' },
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
      items={categorias}
      onAdd={addCategoria}
      onUpdate={updateCategoria}
      onDelete={deleteCategoria}
      columns={columns}
      formFields={[{ key:'nombre', label:'Nombre de categoría', required:true, placeholder:'Ej: SIMPLE CON BAÑO PROPIO' }]}
      emptyMsg="No hay categorías registradas"
      emptyIcon={<Tag size={38}/>}
      modalTitle="Categoría"
      readOnly={readOnly}
      // no sucursalActiva
    />
  );
}
