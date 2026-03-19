import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Btn, Card, Table, tdStyle, EditBtn, DeleteBtn,
  Modal, ConfirmDialog, EmptyState,
  Field, inputStyle, inputFocus, inputBlur,
} from '../../components/UI/index.jsx';
import { Plus, Building2 } from 'lucide-react';

export default function Sucursales() {
  const { sucursales, addSucursal, updateSucursal, deleteSucursal } = useHotel();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [nombre,    setNombre]    = useState('');
  const [error,     setError]     = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const openNew  = () => { setEditId(null); setNombre(''); setError(''); setModalOpen(true); };
  const openEdit = (s) => { setEditId(s.id); setNombre(s.nombre); setError(''); setModalOpen(true); };

  const handleSubmit = () => {
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    editId ? updateSucursal(editId, { nombre }) : addSucursal({ nombre });
    setModalOpen(false);
  };

  return (
    <div className="page-anim">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
        <Btn icon={<Plus size={14}/>} onClick={openNew}>+ Nueva sucursal</Btn>
      </div>

      <Card>
        {sucursales.length === 0 ? (
          <EmptyState message="No hay sucursales registradas" icon={<Building2 size={38}/>} />
        ) : (
          <Table headers={['#', 'Nombre de sucursal', '']}>
            {sucursales.map((s, i) => (
              <tr key={s.id}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                style={{ transition:'background .12s' }}
              >
                <td style={{ ...tdStyle, width:40, color:'var(--text-xmuted)', fontSize:12 }}>{i+1}</td>
                <td style={{ ...tdStyle, fontWeight:600 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:'var(--r-sm)', background:'var(--accent-light)', border:'1px solid var(--accent-mid)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Building2 size={14} color="var(--accent)" />
                    </div>
                    {s.nombre}
                  </div>
                </td>
                <td style={{ ...tdStyle, width:80 }}>
                  <div style={{ display:'flex', gap:5 }}>
                    <EditBtn   onClick={()=>openEdit(s)} />
                    <DeleteBtn onClick={()=>setConfirmId(s.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? 'Editar sucursal' : 'Nueva sucursal'} width={420}>
        <Field label="Nombre de sucursal" error={error} required>
          <input
            style={inputStyle}
            value={nombre}
            onChange={e=>setNombre(e.target.value)}
            placeholder="Ej: Sucursal Norte"
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </Field>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Btn variant="ghost" onClick={()=>setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId ? 'Guardar cambios' : 'Crear sucursal'}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={open=>!open&&setConfirmId(null)}
        onConfirm={()=>{ deleteSucursal(confirmId); setConfirmId(null); }}
        message="¿Eliminar esta sucursal? Se eliminarán todos los datos asociados."
      />
    </div>
  );
}
