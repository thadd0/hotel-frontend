import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { ESTADOS } from '../../data/initialData';
import {
  Btn, Badge, Card, Table, tdStyle, EditBtn, DeleteBtn,
  Modal, ConfirmDialog, RSelect, SearchInput,
  EmptyState, Pagination, Field, inputStyle, inputFocus, inputBlur, SwitchField,
  useToast, PopoverMenu,
} from '../../components/UI/index.jsx';
import { Plus, BedDouble } from 'lucide-react';

const PER_PAGE = 8;
const empty = { numero:'', piso:'', tipoHabitacionId:'', descripcion:'', estado:'DISPONIBLE' };

export default function Habitaciones() {
  const { habitaciones, tiposHabitacion, pisos, addHabitacion, updateHabitacion, deleteHabitacion, cambiarEstado, userRole } = useHotel();
  const readOnly = userRole === 'recepcion';
  const addToast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(empty);
  const [errors,    setErrors]    = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [page,      setPage]      = useState(1);
  const [fEstado,   setFEstado]   = useState('');
  const [fPiso,     setFPiso]     = useState('');
  const [fTipo,     setFTipo]     = useState('');
  const [busqueda,  setBusqueda]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditId(null); setForm(empty); setErrors({}); setModalOpen(true); };
  const openEdit = (h) => {
    setEditId(h.id);
    setForm({
      numero: h.numero,
      piso: String(h.piso),
      tipoHabitacionId: String(h.tipoHabitacion?.id || ''),
      descripcion: h.descripcion || '',
      estado: h.estado,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.numero.trim()) e.numero = 'Campo requerido';
    if (!form.piso)          e.piso = 'Selecciona un piso';
    if (!form.tipoHabitacionId) e.tipoHabitacionId = 'Selecciona un tipo';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      numero: form.numero,
      piso: Number(form.piso),
      descripcion: form.descripcion,
      estado: form.estado,
      tipoHabitacion: { id: Number(form.tipoHabitacionId) },
    };
    try {
      editId ? await updateHabitacion(editId, payload) : await addHabitacion(payload);
      addToast(editId ? 'Habitación actualizada' : 'Habitación creada', 'success');
      setModalOpen(false);
    } catch {
      addToast('Error al guardar la habitación', 'error');
    }
  };

  const filtered = habitaciones.filter(h => {
    const tipoNombre = h.tipoHabitacion?.nombre || '';
    return (!fEstado || h.estado === fEstado)
      && (!fPiso    || String(h.piso) === fPiso)
      && (!fTipo    || String(h.tipoHabitacion?.id) === fTipo)
      && (!busqueda || h.numero.toLowerCase().includes(busqueda.toLowerCase()) || tipoNombre.toLowerCase().includes(busqueda.toLowerCase()));
  });

  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const ESTADO_KEYS = Object.keys(ESTADOS);
  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await cambiarEstado(id, nuevoEstado);
      addToast(`Estado cambiado a ${nuevoEstado}`, 'success');
    } catch {
      addToast('Error al cambiar el estado', 'error');
    }
  };

  return (
    <div className="page-anim">
      {/* Filtros */}
      <Card padding="12px 16px" style={{ marginBottom:18 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <RSelect value={fEstado}  onValueChange={v=>{setFEstado(v); setPage(1);}} placeholder="Estado" options={ESTADO_KEYS.map(k=>({value:k,label:k}))} />
          <RSelect value={fPiso}    onValueChange={v=>{setFPiso(v);   setPage(1);}} placeholder="Piso" options={pisos.map(p=>({value:String(p),label:`Piso ${p}`}))} />
          <RSelect value={fTipo}    onValueChange={v=>{setFTipo(v);   setPage(1);}} placeholder="Tipo" options={tiposHabitacion.map(t=>({value:String(t.id),label:t.nombre}))} />
          <SearchInput value={busqueda} onChange={v=>{setBusqueda(v); setPage(1);}} placeholder="Buscar..." />
          <div style={{ marginLeft:'auto' }}>
            {!readOnly && <Btn icon={<Plus size={14}/>} onClick={openNew}>Nueva habitación</Btn>}
          </div>
        </div>
      </Card>

      <Card>
        {paged.length === 0 ? (
          <EmptyState message="No se encontraron habitaciones" icon={<BedDouble size={40}/>} />
        ) : (
          <Table headers={['Nro','Número','Tipo','Piso','Estado','']}>
            {paged.map((hab, idx) => {
              const est = ESTADOS[hab.estado] || ESTADOS.DISPONIBLE;
              return (
                <tr key={hab.id}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  style={{ transition:'background .12s' }}
                >
                  <td style={{ ...tdStyle, color:'var(--text-xmuted)', width:36, fontSize:12 }}>{(page-1)*PER_PAGE+idx+1}</td>
                  <td style={{ ...tdStyle, fontWeight:700 }}>{hab.numero}</td>
                  <td style={tdStyle}><span style={{ fontSize:12.5 }}>{hab.tipoHabitacion?.nombre ?? '—'}</span></td>
                  <td style={tdStyle}><span style={{ fontSize:12.5 }}>Piso {hab.piso}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      <Badge label={est.label} color={est.color} bg={est.bg} border={est.border} dot={est.dot} />
                      <PopoverMenu
                        trigger={
                          <button style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--orange-bg)', color:'var(--orange)', border:'1px solid var(--orange-border)', borderRadius:'var(--r-sm)', padding:'3px 9px', fontSize:10.5, fontWeight:700, cursor:'pointer' }}>
                            ⚙ Cambiar
                          </button>
                        }
                      >
                        <div style={{ display:'flex', flexDirection:'column', gap:2, minWidth:140 }}>
                          {ESTADO_KEYS.filter(k => k !== hab.estado).map(k => {
                            const e = ESTADOS[k];
                            return (
                              <button
                                key={k}
                                onClick={() => handleEstadoChange(hab.id, k)}
                                style={{
                                  display:'flex', alignItems:'center', gap:8,
                                  padding:'7px 10px', borderRadius:'var(--r-sm)',
                                  border:'none', background:'transparent', cursor:'pointer',
                                  fontSize:12.5, fontWeight:600, color: e.color,
                                  textAlign:'left', width:'100%',
                                }}
                                onMouseEnter={ev => ev.currentTarget.style.background = e.bg}
                                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                              >
                                <span style={{ width:8, height:8, borderRadius:'50%', background:e.dot, flexShrink:0 }} />
                                {e.label}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverMenu>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, width:80 }}>
                    <div style={{ display:'flex', gap:5 }}>
                      {!readOnly && (
                        <>
                          <EditBtn   onClick={()=>openEdit(hab)} />
                          <DeleteBtn onClick={()=>setConfirmId(hab.id)} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
        <div style={{ padding:'0 16px 4px' }}>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      {readOnly ? null : (
        <>
          {/* MODAL */}
          <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? 'Editar habitación' : 'Nueva habitación'} width={520}>
            <Field label="Número" error={errors.numero} required>
              <input style={inputStyle} value={form.numero} onChange={e=>set('numero',e.target.value)} placeholder="Ej: 101" onFocus={inputFocus} onBlur={inputBlur} />
            </Field>
            <div className="form-grid-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Tipo de Habitación" error={errors.tipoHabitacionId} required>
                <RSelect value={form.tipoHabitacionId} onValueChange={v=>set('tipoHabitacionId',v)} placeholder="Seleccionar" options={tiposHabitacion.map(t=>({value:String(t.id),label:t.nombre}))} triggerStyle={{ width:'100%', minWidth:'unset' }} />
              </Field>
              <Field label="Piso" error={errors.piso} required>
                <input style={inputStyle} value={form.piso} onChange={e=>set('piso',e.target.value)} placeholder="Ej: 1" type="number" onFocus={inputFocus} onBlur={inputBlur} />
              </Field>
            </div>
            <Field label="Descripción">
              <input style={inputStyle} value={form.descripcion} onChange={e=>set('descripcion',e.target.value)} placeholder="Opcional" onFocus={inputFocus} onBlur={inputBlur} />
            </Field>
            <Field label="Estado">
              <RSelect value={form.estado} onValueChange={v=>set('estado',v)} options={ESTADO_KEYS.map(k=>({value:k,label:k}))} triggerStyle={{ width:'100%', minWidth:'unset' }} />
            </Field>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
              <Btn variant="ghost" onClick={()=>setModalOpen(false)}>Cancelar</Btn>
              <Btn onClick={handleSubmit}>{editId?'Guardar cambios':'Crear habitación'}</Btn>
            </div>
          </Modal>

          <ConfirmDialog
            open={!!confirmId}
            onOpenChange={open=>!open&&setConfirmId(null)}
            onConfirm={async ()=>{ try { await deleteHabitacion(confirmId); addToast('Habitación eliminada', 'info'); } catch { addToast('Error al eliminar la habitación', 'error'); } setConfirmId(null); }}
            message="¿Eliminar esta habitación? Esta acción no se puede deshacer."
          />
        </>
      )}
    </div>
  );
}
