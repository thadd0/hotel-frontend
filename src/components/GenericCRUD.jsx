import { useState } from 'react';
import {
  Btn, Card, Table, tdStyle, EditBtn, DeleteBtn,
  Modal, ConfirmDialog, EmptyState, Pagination,
  Field, inputStyle, inputFocus, inputBlur, SwitchField,
  useToast,
} from './UI/index.jsx';
import { Plus } from 'lucide-react';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';

const PER_PAGE = 10;

const COUNTRY_DIAL_OPTIONS = getCountries()
  .map((code) => ({
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

function parseIntlPhone(rawPhone) {
  const raw = String(rawPhone || '').trim();
  const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
  if (!match) {
    return { countryCode: 'PE', number: raw };
  }

  const dialCode = match[1];
  const number = match[2] || '';
  const found = COUNTRY_DIAL_OPTIONS.find((c) => c.dialCode === dialCode);
  return {
    countryCode: found?.code || 'PE',
    number,
  };
}

function buildIntlPhone(countryCode, number) {
  const cleanNumber = String(number || '').trim();
  if (!cleanNumber) return '';
  const dialCode = COUNTRY_DIAL_OPTIONS.find((c) => c.code === countryCode)?.dialCode || '+51';
  return `${dialCode} ${cleanNumber}`;
}

export default function GenericCRUD({
  items, onAdd, onUpdate, onDelete,
  columns, formFields, emptyMsg, emptyIcon,
  modalTitle = 'Registro',
  readOnly = false,
  showVisible = false,
  elevatedInputs = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({});
  const [errors,    setErrors]    = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [page,      setPage]      = useState(1);
  const addToast = useToast();

  const buildEmpty = () => {
    const obj = {};
    if (showVisible) obj.visible = true;
    formFields.forEach(f => {
      if (f.type === 'phoneIntl') {
        obj[f.key] = '';
        obj[`${f.key}Country`] = 'PE';
        return;
      }
      if (f.type === 'optionalSelectToggle') {
        obj[f.key] = '';
        obj[`${f.key}Enabled`] = false;
        return;
      }
      if (!(f.key in obj)) obj[f.key] = '';
    });
    return obj;
  };

  const openNew  = () => { setEditId(null); setForm(buildEmpty()); setErrors({}); setModalOpen(true); };
  const openEdit = (item) => {
    setEditId(item.id);
    const obj = {};
    if (showVisible) obj.visible = item.visible ?? true;
    formFields.forEach(f => {
      if (f.type === 'phoneIntl') {
        const parsed = parseIntlPhone(item[f.key] ?? '');
        obj[f.key] = parsed.number;
        obj[`${f.key}Country`] = parsed.countryCode;
      } else if (f.type === 'optionalSelectToggle') {
        const value = item[f.key] != null ? String(item[f.key]) : '';
        obj[f.key] = value;
        obj[`${f.key}Enabled`] = Boolean(value);
      } else {
        obj[f.key] = item[f.key] ?? '';
      }
    });
    setForm(obj); setErrors({}); setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    formFields.forEach(f => { if (f.required && !String(form[f.key] ?? '').trim()) e[f.key] = `${f.label} es requerido`; });
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = { ...form };
    formFields.forEach((f) => {
      if (f.type === 'phoneIntl') {
        payload[f.key] = buildIntlPhone(form[`${f.key}Country`], form[f.key]);
        delete payload[`${f.key}Country`];
      }
      if (f.type === 'optionalSelectToggle') {
        const enabled = !!form[`${f.key}Enabled`];
        payload[f.key] = enabled && String(form[f.key] ?? '').trim() ? form[f.key] : null;
        delete payload[`${f.key}Enabled`];
      }
    });
    try {
      editId ? await onUpdate(editId, payload) : await onAdd(payload);
      addToast(editId ? 'Registro actualizado' : 'Registro creado', 'success');
      setModalOpen(false);
    } catch {
      addToast('Error al guardar el registro', 'error');
    }
  };

  const paged = items.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const controlStyle = elevatedInputs
    ? { ...inputStyle, boxShadow: 'var(--shadow-sm)', borderColor: 'var(--border)' }
    : inputStyle;

  return (
    <div className="page-anim">
      {!readOnly && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
          <Btn icon={<Plus size={14}/>} onClick={openNew}>Nuevo</Btn>
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
                  style={controlStyle}
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
              ) : f.type === 'optionalSelectToggle' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    <input
                      type="checkbox"
                      checked={!!form[`${f.key}Enabled`]}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setForm((p) => {
                          const next = { ...p, [`${f.key}Enabled`]: enabled };
                          if (!enabled) next[f.key] = '';
                          else if (!next[f.key] && f.options?.length) next[f.key] = f.options[0].value;
                          return next;
                        });
                      }}
                    />
                    {f.toggleLabel || 'Habilitar campo'}
                  </label>
                  <select
                    style={{ ...controlStyle, opacity: form[`${f.key}Enabled`] ? 1 : 0.65, cursor: form[`${f.key}Enabled`] ? 'pointer' : 'not-allowed' }}
                    value={form[f.key] ?? ''}
                    disabled={!form[`${f.key}Enabled`]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    <option value="" disabled>{f.placeholder || 'Selecciona una opción'}</option>
                    {f.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ) : f.type === 'textarea' ? (
                <textarea
                  style={{ ...controlStyle, minHeight: 80, resize: 'vertical' }}
                  value={form[f.key] ?? ''}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  rows={f.rows ?? 3}
                />
              ) : f.type === 'phoneIntl' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 42%) 1fr', gap: '8px' }}>
                  <select
                    style={controlStyle}
                    value={form[`${f.key}Country`] ?? 'PE'}
                    onChange={e=>setForm(p=>({...p,[`${f.key}Country`]:e.target.value}))}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  >
                    {COUNTRY_DIAL_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>{`${opt.code} ${opt.dialCode}`}</option>
                    ))}
                  </select>
                  <input
                    style={controlStyle}
                    type="text"
                    value={form[f.key] ?? ''}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.placeholder || 'Número'}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </div>
              ) : (
                <input
                  style={controlStyle}
                  type={f.type ?? 'text'}
                  value={form[f.key] ?? ''}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                />
              )}
            </Field>
          ))}
          {showVisible && (
            <Field label="Visible">
              <SwitchField
                checked={!!form.visible}
                onCheckedChange={v=>setForm(p=>({...p,visible:v}))}
                label={form.visible ? 'Visible' : 'Oculto'}
              />
            </Field>
          )}
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
          onConfirm={async ()=>{ try { await onDelete(confirmId); addToast('Registro eliminado', 'info'); } catch { addToast('Error al eliminar', 'error'); } setConfirmId(null); }}
        />
      )}
    </div>
  );
}

