import { useState, useCallback, useEffect, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Table, Btn, Field, Modal, ConfirmDialog, EmptyState, Pagination, Card, useToast } from '../../components/UI/index.jsx';
import { UserCog, Plus, KeyRound } from 'lucide-react';
import { getRecepcionistas, postRecepcionista, putRecepcionista, resetRecepcionistaPassword } from '../../api/usuarios';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';

const PER_PAGE = 10;

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md, 8px)',
  border: '1px solid var(--border)', fontSize: 14,
  color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
};

const COUNTRY_DIAL_OPTIONS = getCountries()
  .map((code) => ({
    code,
    dialCode: `+${getCountryCallingCode(code)}`,
    label: `${code} ${`+${getCountryCallingCode(code)}`}`,
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
  if (!cleanNumber) return null;
  const dialCode = COUNTRY_DIAL_OPTIONS.find((c) => c.code === countryCode)?.dialCode || '+51';
  return `${dialCode} ${cleanNumber}`;
}

export default function Usuarios() {
  const { tiposDocumento } = useHotel();
  const addToast = useToast();
  const tiposDocumentoPermitidos = useMemo(() => {
    const allowed = ['DNI', 'CE', 'PASAPORTE'];
    const source = Array.isArray(tiposDocumento) && tiposDocumento.length
      ? tiposDocumento
      : [
          { id: 1, nombre: 'DNI' },
          { id: 2, nombre: 'CE' },
          { id: 3, nombre: 'PASAPORTE' },
        ];
    return source.filter((td) => allowed.includes(td?.nombre));
  }, [tiposDocumento]);

  const [recepcionistas, setRecepcionistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  // Reset password modal
  const [resetModal, setResetModal] = useState(null); // user id
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await getRecepcionistas();
        if (!alive) return;
        setRecepcionistas(Array.isArray(data) ? data : []);
      } catch {
        if (!alive) return;
        setRecepcionistas([]);
        addToast('No se pudo cargar recepcionistas desde el backend.', 'error');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [addToast]);

  const openNew = () => {
    setEditId(null);
    setForm({
      nombre: '',
      numDocumento: '',
      password: '',
      telefono: '',
      telefonoCountry: 'PE',
      tipoDocumento: tiposDocumentoPermitidos[0]?.nombre || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (user) => {
    const parsedPhone = parseIntlPhone(user.telefono || '');
    setEditId(user.id);
    setForm({
      nombre: user.nombre,
      telefono: parsedPhone.number,
      telefonoCountry: parsedPhone.countryCode,
      tipoDocumento: user.tipoDocumento?.nombre || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = 'Nombre requerido';
    if (!editId) {
      if (!form.numDocumento?.trim()) e.numDocumento = 'N° Documento requerido';
      if (!form.password?.trim()) e.password = 'Contraseña requerida';
    }
    if (!form.tipoDocumento) e.tipoDocumento = 'Tipo documento requerido';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    const telefonoCompleto = buildIntlPhone(form.telefonoCountry, form.telefono);
    if (editId) {
      // PUT — ActualizarRecepcionistaRequestDTO: {nombre, telefono, tipoDocumento}
      const payload = { nombre: form.nombre, telefono: telefonoCompleto, tipoDocumento: form.tipoDocumento };
      try {
        const updated = await putRecepcionista(editId, payload);
        setRecepcionistas(p => p.map(r => r.id === editId ? updated : r));
        addToast('Recepcionista actualizado.', 'success');
      } catch {
        addToast('No se pudo actualizar. Verifica backend/permisos.', 'error');
        return;
      }
    } else {
      // POST — CrearRecepcionistaRequestDTO: {nombre, numDocumento, password, telefono?, tipoDocumento}
      const payload = {
        nombre: form.nombre,
        numDocumento: form.numDocumento,
        password: form.password,
        telefono: telefonoCompleto,
        tipoDocumento: form.tipoDocumento,
      };
      try {
        const created = await postRecepcionista(payload);
        setRecepcionistas(p => [...p, created]);
        addToast('Recepcionista creado.', 'success');
      } catch {
        addToast('No se pudo crear. Verifica backend/permisos.', 'error');
        return;
      }
    }
    setModalOpen(false);
  }, [editId, form, addToast]);

  const handleResetPassword = useCallback(async () => {
    if (!newPassword.trim() || !resetModal) return;
    try {
      await resetRecepcionistaPassword(resetModal, newPassword);
      addToast('Contraseña reseteada.', 'success');
    } catch {
      addToast('No se pudo resetear contraseña.', 'error');
      return;
    }
    setResetModal(null);
    setNewPassword('');
  }, [resetModal, newPassword, addToast]);

  const paged = recepcionistas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="page-anim">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Usuarios</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Gestión de recepcionistas</p>
        </div>
        <Btn icon={<Plus size={14} />} onClick={openNew}>Nuevo Recepcionista</Btn>
      </div>

      {loading ? (
        <EmptyState message="Cargando recepcionistas..." icon={<UserCog size={48} />} />
      ) : paged.length === 0 ? (
        <EmptyState message="No hay recepcionistas en backend" icon={<UserCog size={48} />} />
      ) : (
        <Card>
          <Table headers={['Nombre', 'Documento', 'Tipo Doc.', 'Teléfono', 'Rol', '']}>
            {paged.map(u => (
              <tr key={u.id}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ transition: 'background .12s' }}
              >
                <td style={td}><span style={{ fontWeight: 600 }}>{u.nombre}</span></td>
                <td style={td}>{u.numDocumento}</td>
                <td style={td}>{u.tipoDocumento?.nombre || '—'}</td>
                <td style={td}>{u.telefono || '—'}</td>
                <td style={td}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--r-sm, 4px)', fontSize: 11, fontWeight: 600,
                    background: 'var(--accent-light, #e3f2fd)', color: 'var(--accent)',
                  }}>
                    Recepcionista
                  </span>
                </td>
                <td style={{ ...td, width: 140 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn variant="ghost" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => openEdit(u)}>Editar</Btn>
                    <Btn variant="ghost" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => { setResetModal(u.id); setNewPassword(''); }}
                      icon={<KeyRound size={12} />}>
                      Clave
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          <div style={{ padding: '0 16px 4px' }}>
            <Pagination page={page} total={recepcionistas.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? 'Editar Recepcionista' : 'Nuevo Recepcionista'} width={440}>
        <Field label="Nombre completo" error={errors.nombre} required>
          <input style={inputStyle} value={form.nombre || ''} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del recepcionista" />
        </Field>
        {!editId && (
          <>
            <Field label="N° Documento" error={errors.numDocumento} required>
              <input style={inputStyle} value={form.numDocumento || ''} onChange={e => setForm(p => ({ ...p, numDocumento: e.target.value }))} placeholder="Documento de identidad" />
            </Field>
            <Field label="Contraseña" error={errors.password} required>
              <input style={inputStyle} type="password" value={form.password || ''} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Contraseña inicial" />
            </Field>
          </>
        )}
        <Field label="Tipo Documento" error={errors.tipoDocumento} required>
          <select style={inputStyle} value={form.tipoDocumento || ''} onChange={e => setForm(p => ({ ...p, tipoDocumento: e.target.value }))}>
            <option value="" disabled>Seleccionar...</option>
            {tiposDocumentoPermitidos.map(td => (
              <option key={td.id} value={td.nombre}>{td.nombre}</option>
            ))}
          </select>
        </Field>
        <Field label="Teléfono">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 38%) 1fr', gap: 8 }}>
            <select
              style={inputStyle}
              value={form.telefonoCountry || 'PE'}
              onChange={e => setForm(p => ({ ...p, telefonoCountry: e.target.value }))}
            >
              {COUNTRY_DIAL_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>{opt.label}</option>
              ))}
            </select>
            <input
              style={inputStyle}
              value={form.telefono || ''}
              onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
              placeholder="Número"
            />
          </div>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId ? 'Guardar cambios' : 'Crear'}</Btn>
        </div>
      </Modal>

      {/* Reset Password Modal — ResetPasswordRequestDTO: {newPassword} */}
      <Modal open={!!resetModal} onOpenChange={(open) => !open && setResetModal(null)} title="Resetear Contraseña" width={380}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Asigna una nueva contraseña para este recepcionista.
        </p>
        <Field label="Nueva contraseña" required>
          <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setResetModal(null)}>Cancelar</Btn>
          <Btn onClick={handleResetPassword}>Resetear</Btn>
        </div>
      </Modal>
    </div>
  );
}

const td = { padding: '10px 14px', fontSize: 13 };
