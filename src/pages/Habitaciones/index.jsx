import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { ESTADOS } from '../../data/initialData';
import {
  Btn, Badge, Card, Table, tdStyle, EditBtn, DeleteBtn,
  Modal, ConfirmDialog, RSelect, SearchInput,
  EmptyState, Pagination, Field, inputStyle, inputFocus, inputBlur, SwitchField,
} from '../../components/UI/index.jsx';
import { Plus, BedDouble } from 'lucide-react';

const PER_PAGE = 8;
const empty = { numero:'', categoriaId:'', ubicacionId:'', tarifaIds:[], estado:'DISPONIBLE', visible:true };

export default function Habitaciones() {
  const { habitaciones, categorias, ubicaciones, addHabitacion, updateHabitacion, deleteHabitacion, cambiarEstado } = useHotel();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(empty);
  const [errors,    setErrors]    = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [page,      setPage]      = useState(1);
  const [fEstado,   setFEstado]   = useState('');
  const [fUbic,     setFUbic]     = useState('');
  const [fCat,      setFCat]      = useState('');
  const [busqueda,  setBusqueda]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => { setEditId(null); setForm(empty); setErrors({}); setModalOpen(true); };
  const openEdit = (h) => {
    setEditId(h.id);
    setForm({ numero:h.numero, categoriaId:String(h.categoriaId), ubicacionId:String(h.ubicacionId), tarifaIds:h.tarifaIds?.map(String)??[], estado:h.estado, visible:h.visible });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.numero.trim()) e.numero = 'Campo requerido';
    if (!form.categoriaId)   e.categoriaId = 'Selecciona una categoría';
    if (!form.ubicacionId)   e.ubicacionId = 'Selecciona una ubicación';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form, categoriaId:Number(form.categoriaId), ubicacionId:Number(form.ubicacionId), tarifaIds:form.tarifaIds.map(Number) };
    editId ? updateHabitacion(editId, payload) : addHabitacion(payload);
    setModalOpen(false);
  };

  const toggleTarifa = (id) => set('tarifaIds', form.tarifaIds.includes(id) ? form.tarifaIds.filter(t=>t!==id) : [...form.tarifaIds, id]);

  const filtered = habitaciones.filter(h => {
    const cat = categorias.find(c => c.id === h.categoriaId);
    return (!fEstado || h.estado===fEstado)
      && (!fUbic    || String(h.ubicacionId)===fUbic)
      && (!fCat     || String(h.categoriaId)===fCat)
      && (!busqueda || h.numero.toLowerCase().includes(busqueda.toLowerCase()) || cat?.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  });

  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const ESTADO_KEYS = Object.keys(ESTADOS);
  const cycleEstado = (id, current) => {
    const next = ESTADO_KEYS[(ESTADO_KEYS.indexOf(current)+1) % ESTADO_KEYS.length];
    cambiarEstado(id, next);
  };

  return (
    <div className="page-anim">
      {/* Filtros */}
      <Card padding="12px 16px" style={{ marginBottom:18 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <RSelect value={fEstado}  onValueChange={v=>{setFEstado(v); setPage(1);}} placeholder="Estado" options={ESTADO_KEYS.map(k=>({value:k,label:k}))} />
          <RSelect value={fUbic}    onValueChange={v=>{setFUbic(v);   setPage(1);}} placeholder="Ubicación" options={ubicaciones.map(u=>({value:String(u.id),label:u.nombre}))} />
          <RSelect value={fCat}     onValueChange={v=>{setFCat(v);    setPage(1);}} placeholder="Categoría" options={categorias.map(c=>({value:String(c.id),label:c.nombre}))} />
          <SearchInput value={busqueda} onChange={v=>{setBusqueda(v); setPage(1);}} placeholder="Buscar..." />
          <div style={{ marginLeft:'auto' }}>
            <Btn icon={<Plus size={14}/>} onClick={openNew}>Nueva habitación</Btn>
          </div>
        </div>
      </Card>

      <Card>
        {paged.length === 0 ? (
          <EmptyState message="No se encontraron habitaciones" icon={<BedDouble size={40}/>} />
        ) : (
          <Table headers={['Nro','Habitación','Categoría','Ubicación','Estado','Visible','']}>
            {paged.map((hab, idx) => {
              const est  = ESTADOS[hab.estado];
              const cat  = categorias.find(c=>c.id===hab.categoriaId);
              const ubic = ubicaciones.find(u=>u.id===hab.ubicacionId);
              return (
                <tr key={hab.id}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  style={{ transition:'background .12s' }}
                >
                  <td style={{ ...tdStyle, color:'var(--text-xmuted)', width:36, fontSize:12 }}>{(page-1)*PER_PAGE+idx+1}</td>
                  <td style={{ ...tdStyle, fontWeight:700 }}>{hab.numero}</td>
                  <td style={tdStyle}><span style={{ fontSize:12.5 }}>{cat?.nombre ?? '—'}</span></td>
                  <td style={tdStyle}><span style={{ fontSize:12.5 }}>{ubic?.nombre ?? '—'}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      <Badge label={est.label} color={est.color} bg={est.bg} border={est.border} dot={est.dot} />
                      <button
                        onClick={()=>cycleEstado(hab.id,hab.estado)}
                        style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--orange-bg)', color:'var(--orange)', border:'1px solid var(--orange-border)', borderRadius:'var(--r-sm)', padding:'3px 9px', fontSize:10.5, fontWeight:700, cursor:'pointer' }}
                      >
                        ⚙ Cambiar
                      </button>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize:12, fontWeight:600, color: hab.visible?'var(--green)':'var(--red)' }}>
                      {hab.visible ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, width:80 }}>
                    <div style={{ display:'flex', gap:5 }}>
                      <EditBtn   onClick={()=>openEdit(hab)} />
                      <DeleteBtn onClick={()=>setConfirmId(hab.id)} />
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

      {/* MODAL */}
      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? 'Editar habitación' : 'Nueva habitación'} width={520}>
        <Field label="Número" error={errors.numero} required>
          <input style={inputStyle} value={form.numero} onChange={e=>set('numero',e.target.value)} placeholder="Ej: 101" onFocus={inputFocus} onBlur={inputBlur} />
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Categoría" error={errors.categoriaId} required>
            <RSelect value={form.categoriaId} onValueChange={v=>set('categoriaId',v)} placeholder="Seleccionar" options={categorias.map(c=>({value:String(c.id),label:c.nombre}))} triggerStyle={{ width:'100%', minWidth:'unset' }} />
            {errors.categoriaId && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.categoriaId}</p>}
          </Field>
          <Field label="Ubicación" error={errors.ubicacionId} required>
            <RSelect value={form.ubicacionId} onValueChange={v=>set('ubicacionId',v)} placeholder="Seleccionar" options={ubicaciones.map(u=>({value:String(u.id),label:u.nombre}))} triggerStyle={{ width:'100%', minWidth:'unset' }} />
            {errors.ubicacionId && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.ubicacionId}</p>}
          </Field>
        </div>
        {/* Tarifas section removed per request */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Estado">
            <RSelect value={form.estado} onValueChange={v=>set('estado',v)} options={ESTADO_KEYS.map(k=>({value:k,label:k}))} triggerStyle={{ width:'100%', minWidth:'unset' }} />
          </Field>
          <Field label="Visible">
            <div style={{ paddingTop:6 }}>
              <SwitchField checked={form.visible} onCheckedChange={v=>set('visible',v)} label={form.visible?'Sí':'No'} />
            </div>
          </Field>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Btn variant="ghost" onClick={()=>setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId?'Guardar cambios':'Crear habitación'}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={open=>!open&&setConfirmId(null)}
        onConfirm={()=>{ deleteHabitacion(confirmId); setConfirmId(null); }}
        message="¿Eliminar esta habitación? Esta acción no se puede deshacer."
      />
    </div>
  );
}
