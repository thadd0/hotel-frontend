import { useState } from 'react';
import {
  Btn, Card, Table, tdStyle, EditBtn, DeleteBtn,
  Modal, ConfirmDialog, EmptyState, Pagination,
  Field, inputStyle, inputFocus, inputBlur, SwitchField,
} from '../components/UI/index.jsx';
import { Plus } from 'lucide-react';

const PER_PAGE = 10;

export default function GenericCRUD({
  items, onAdd, onUpdate, onDelete,
  columns, formFields, emptyMsg, emptyIcon,
  modalTitle = 'Registro', sucursalActiva,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({});
  const [errors,    setErrors]    = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [page,      setPage]      = useState(1);

  const buildEmpty = () => {
    const obj = { visible:true, sucursalId:sucursalActiva };
    formFields.forEach(f => { if (!(f.key in obj)) obj[f.key] = ''; });
    return obj;
  };

  const openNew  = () => { setEditId(null); setForm(buildEmpty()); setErrors({}); setModalOpen(true); };
  const openEdit = (item) => {
    setEditId(item.id);
    const obj = { visible:item.visible??true, sucursalId:item.sucursalId };
    formFields.forEach(f => { obj[f.key] = item[f.key]??''; });
    setForm(obj); setErrors({}); setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    formFields.forEach(f => { if (f.required && !String(form[f.key]??'').trim()) e[f.key] = `${f.label} es requerido`; });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form, sucursalId:sucursalActiva };
    editId ? onUpdate(editId, payload) : onAdd(payload);
    setModalOpen(false);
  };

  const paged = items.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div className="page-anim">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
        <Btn icon={<Plus size={14}/>} onClick={openNew}>+ Nuevo</Btn>
      </div>

      <Card>
        {paged.length === 0 ? (
          <EmptyState message={emptyMsg} icon={emptyIcon} />
        ) : (
          <Table headers={[...columns.map(c=>c.label),'']}>
            {paged.map(item => (
              <tr key={item.id}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                style={{ transition:'background .12s' }}
              >
                {columns.map(col => (
                  <td key={col.key} style={tdStyle}>
                    {col.render ? col.render(item) : (item[col.key]??'—')}
                  </td>
                ))}
                <td style={{ ...tdStyle, width:80 }}>
                  <div style={{ display:'flex', gap:5 }}>
                    <EditBtn   onClick={()=>openEdit(item)} />
                    <DeleteBtn onClick={()=>setConfirmId(item.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div style={{ padding:'0 16px 4px' }}>
          <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId?`Editar ${modalTitle}`:`Nuevo/a ${modalTitle}`} width={460}>
        {formFields.map(f => (
          <Field key={f.key} label={f.label} error={errors[f.key]} required={f.required}>
            <input
              style={inputStyle}
              type={f.type??'text'}
              value={form[f.key]??''}
              onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
              placeholder={f.placeholder}
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
          </Field>
        ))}
        <Field label="Visible">
          <SwitchField
            checked={!!form.visible}
            onCheckedChange={v=>setForm(p=>({...p,visible:v}))}
            label={form.visible?'Visible':'Oculto'}
          />
        </Field>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
          <Btn variant="ghost" onClick={()=>setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId?'Guardar cambios':'Crear'}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={open=>!open&&setConfirmId(null)}
        onConfirm={()=>{ onDelete(confirmId); setConfirmId(null); }}
      />
    </div>
  );
}
