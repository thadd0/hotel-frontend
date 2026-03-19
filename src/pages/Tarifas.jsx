import { useHotel } from '../context/HotelContext';
import GenericCRUD from '../components/GenericCRUD.jsx';
import { DollarSign } from 'lucide-react';

export default function Tarifas() {
  const { tarifas, addTarifa, updateTarifa, deleteTarifa, sucursalActiva, sucursales } = useHotel();
  const sucursalNombre = sucursales.find(s=>s.id===sucursalActiva)?.nombre ?? '—';

  const columns = [
    { key:'nombre', label:'Tarifa / Precio', render: i => (
      <span style={{ fontWeight:700, color:'var(--accent-dark)', fontSize:14 }}>
        <span style={{ fontSize:11, fontWeight:500, color:'var(--text-muted)', marginRight:3 }}>S/</span>
        {i.nombre}
      </span>
    )},
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
      items={tarifas}
      onAdd={addTarifa}
      onUpdate={updateTarifa}
      onDelete={deleteTarifa}
      columns={columns}
      formFields={[{ key:'nombre', label:'Precio (S/)', type:'number', required:true, placeholder:'Ej: 150' }]}
      emptyMsg="No hay tarifas registradas"
      emptyIcon={<DollarSign size={38}/>}
      modalTitle="Tarifa"
      sucursalActiva={sucursalActiva}
    />
  );
}
