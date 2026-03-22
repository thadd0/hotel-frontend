import { useState } from 'react';
import {
  Btn, Card, Table, tdStyle, EditBtn, DeleteBtn,
  Modal, ConfirmDialog, EmptyState, Pagination,
  Field, inputStyle, inputFocus, inputBlur, SwitchField,
} from './UI/index.jsx';
import { Plus } from 'lucide-react';

const PER_PAGE = 10;

export default function GenericCRUD({
  items, onAdd, onUpdate, onDelete,
  columns, formFields, emptyMsg, emptyIcon,
  modalTitle = 'Registro',
  readOnly = false,  // Nuevo: oculta botones para recepcionista
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({});
  const [errors,    setErrors]    = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [page,      setPage]      = useState(1);

  const buildEmpty = () => {
    const obj = { visible:true };
    formFields.forEach(f => { if (!(f.key in obj)) obj[f.key] = ''; });
    return obj;
  };

  const openNew  = () => { setEditId(null); setForm(buildEmpty()); setErrors({}); setModalOpen(true); };
  const openEdit = (item) => {
    setEditId(item.id);
    const obj = { visible:item.visible ?? true };
    formFields.forEach(f => { obj[f.key] = item[f.key] ?? ''; });
    setForm(obj); setErrors({}); setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    formFields.forEach(f => { if (f.required && !String(form[f.key] ?? '').trim()) e[f.key] = `${f.label} es requerido`; });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    editId ? onUpdate(editId, payload) : onAdd(payload);
    setModalOpen(false);
  };

  const paged = items.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <div className="page-anim">
      {!readOnly && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
          <Btn icon={<Plus size={14}/>} onClick={openNew}>+ Nuevo</Btn>
        </div>
      )}

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
                    {col.render ? col.render(item) : (item[col.key] ?? '—')}
                  </td>
                ))}
                <td style={{ ...tdStyle, width: readOnly ? 0 : 80, padding: readOnly ? 0 : 'inherit' }}>
                  {!readOnly && (
                    <div style={{ display:'flex', gap:5 }}>
                      <EditBtn   onClick={()=>openEdit(item)} />
                      <DeleteBtn onClick={()=>setConfirmId(item.id)} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div style={{ padding:'0 16px 4px' }}>
          <Pagination page={page} total={items.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

{readOnly ? null : (
        <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? `Editar ${modalTitle}` : `Nuevo/a ${modalTitle}`} width={460}>
          {formFields.map(f => (
            <Field key={f.key} label={f.label} error={errors[f.key]} required={f.required}>
              {f.type === 'select' ? (
                <select
                  style={inputStyle}
                  value={form[f.key] ?? ''}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                >
                  <option value="">{f.placeholder || 'Selecciona una opción'}</option>
                  {f.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  style={inputStyle}
                  type={f.type ?? 'text'}
                  value={form[f.key] ?? ''}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              )}
            </Field>
          ))}
          <Field label="Visible">
            <SwitchField
              checked={!!form.visible}
              onCheckedChange={v=>setForm(p=>({...p,visible:v}))}
              label={form.visible ? 'Visible' : 'Oculto'}
            />
          </Field>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)' }}>
            <Btn variant="ghost" onClick={()=>setModalOpen(false)}>Cancelar</Btn>
            <Btn onClick={handleSubmit}>{editId ? 'Guardar cambios' : 'Crear'}</Btn>
          </div>
        </Modal>
      )}
      {readOnly ? null : (
        <ConfirmDialog
          open={!!confirmId}
          onOpenChange={open=>!open&&setConfirmId(null)}
          onConfirm={()=>{ onDelete(confirmId); setConfirmId(null); }}
        />
      )}
    </div>
  );
}

