import { useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';
import { useHotel } from '../../context/HotelContext';
import {
  Btn,
  Card,
  ConfirmDialog,
  DeleteBtn,
  EditBtn,
  EmptyState,
  Field,
  Modal,
  Pagination,
  Table,
  tdStyle,
  useToast,
} from '../../components/UI/index.jsx';
import { Plus, Users } from 'lucide-react';

const PER_PAGE = 10;

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--border)',
  fontSize: 14,
  color: 'var(--text)',
  background: 'var(--surface)',
  fontFamily: 'inherit',
};

const selectStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 'var(--r-sm)',
  border: '1px solid var(--border)',
  fontSize: 14,
  color: 'var(--text)',
  fontFamily: 'inherit',
};

function parseIntlPhone(rawPhone) {
  const raw = String(rawPhone || '').trim();
  const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
  if (!match) {
    return { countryCode: 'PE', number: raw };
  }

  const dialCode = match[1];
  const number = match[2] || '';
  return { dialCode, number };
}

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente, empresas, userRole, tiposDocumento } = useHotel();
  const addToast = useToast();
  const isAdmin = userRole === 'admin';
  const canEdit = userRole === 'admin' || userRole === 'recepcion';

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

  const countryDialOptions = useMemo(() => {
    const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['es'], { type: 'region' })
      : null;
    return getCountries().map((code) => {
      const dialCode = `+${getCountryCallingCode(code)}`;
      const countryName = regionNames?.of(code) || code;
      return { code, dialCode, label: `${countryName} (${code}) ${dialCode}` };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nombre: '',
    numDocumento: '',
    tipoDocumento: '',
    telefono: '',
    telefonoCountry: 'PE',
    empresaEnabled: false,
    empresaId: '',
  });

  const paged = clientes.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const findCountryCodeByDial = (dialCode) => {
    return countryDialOptions.find((c) => c.dialCode === dialCode)?.code || 'PE';
  };

  const getDialCodeByCountry = (countryCode) => {
    return countryDialOptions.find((c) => c.code === countryCode)?.dialCode || '+51';
  };

  const resetForm = () => {
    setForm({
      nombre: '',
      numDocumento: '',
      tipoDocumento: tiposDocumentoPermitidos[0]?.nombre || '',
      telefono: '',
      telefonoCountry: 'PE',
      empresaEnabled: false,
      empresaId: '',
    });
    setErrors({});
  };

  const openNew = () => {
    setEditId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (cliente) => {
    const parsedPhone = parseIntlPhone(cliente.telefono || '');
    const empresaId = cliente.empresaId ? String(cliente.empresaId) : '';
    setEditId(cliente.id);
    setForm({
      nombre: cliente.nombre || '',
      numDocumento: cliente.numDocumento || '',
      tipoDocumento: cliente.tipoDocumento?.nombre || tiposDocumentoPermitidos[0]?.nombre || '',
      telefono: parsedPhone.number,
      telefonoCountry: findCountryCodeByDial(parsedPhone.dialCode),
      empresaEnabled: Boolean(empresaId),
      empresaId,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!form.numDocumento.trim()) e.numDocumento = 'Número de documento requerido';
    if (!form.tipoDocumento) e.tipoDocumento = 'Tipo de documento requerido';
    if (form.empresaEnabled && !form.empresaId) e.empresaId = 'Seleccione una empresa';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const selectedTipo = tiposDocumentoPermitidos.find((td) => td.nombre === form.tipoDocumento);
    if (!selectedTipo) {
      addToast('Tipo de documento inválido', 'error');
      return;
    }

    const telefono = form.telefono?.trim()
      ? `${getDialCodeByCountry(form.telefonoCountry)} ${form.telefono.trim()}`
      : '';

    const payload = {
      nombre: form.nombre.trim(),
      numDocumento: form.numDocumento.trim(),
      telefono,
      tipoDocumento: {
        id: selectedTipo.id,
        nombre: selectedTipo.nombre,
      },
      empresaId: form.empresaEnabled && form.empresaId ? Number(form.empresaId) : null,
    };

    try {
      if (editId) {
        await updateCliente(editId, payload);
        addToast('Cliente actualizado', 'success');
      } else {
        await addCliente(payload);
        addToast('Cliente creado', 'success');
      }
      setModalOpen(false);
    } catch {
      addToast('Error al guardar cliente', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCliente(confirmId);
      addToast('Cliente eliminado', 'info');
    } catch {
      addToast('Error al eliminar cliente', 'error');
    }
    setConfirmId(null);
  };

  return (
    <div className="page-anim">
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <Btn icon={<Plus size={14} />} onClick={openNew}>Nuevo</Btn>
        </div>
      )}

      <Card>
        {paged.length === 0 ? (
          <EmptyState message="No hay clientes registrados" icon={<Users size={42} />} />
        ) : (
          <Table headers={['Nombre Completo', 'Documento', 'Tipo Doc.', 'Teléfono', 'Empresa', '']}>
            {paged.map((item) => (
              <tr
                key={item.id}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                style={{ transition: 'background .12s' }}
              >
                <td style={tdStyle}>{item.nombre ?? '—'}</td>
                <td style={tdStyle}>{item.numDocumento ?? '—'}</td>
                <td style={tdStyle}>{item.tipoDocumento?.nombre ?? '—'}</td>
                <td style={tdStyle}>{item.telefono ?? '—'}</td>
                <td style={tdStyle}>{item.empresaNombre ?? '—'}</td>
                <td style={{ ...tdStyle, width: canEdit ? 80 : 0, padding: canEdit ? 'inherit' : 0 }}>
                  {canEdit && (
                    <div style={{ display: 'flex', gap: 5 }}>
                      <EditBtn onClick={() => openEdit(item)} />
                      {isAdmin && <DeleteBtn onClick={() => setConfirmId(item.id)} />}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div style={{ padding: '0 16px 4px' }}>
          <Pagination page={page} total={clientes.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </Card>

      {canEdit ? (
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editId ? 'Editar cliente' : 'Nuevo cliente'}
          width={400}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Nombre" error={errors.nombre} required>
              <input
                style={inputStyle}
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre completo"
              />
            </Field>

            <Field label="Tipo de documento" error={errors.tipoDocumento} required>
              <select
                style={selectStyle}
                value={form.tipoDocumento}
                onChange={(e) => setForm((p) => ({ ...p, tipoDocumento: e.target.value }))}
              >
                {tiposDocumentoPermitidos.map((td) => (
                  <option key={td.id} value={td.nombre}>{td.nombre}</option>
                ))}
              </select>
            </Field>

            <Field label="Número de documento" error={errors.numDocumento} required>
              <input
                style={inputStyle}
                value={form.numDocumento}
                onChange={(e) => setForm((p) => ({ ...p, numDocumento: e.target.value }))}
                placeholder="DNI / CE / PASAPORTE"
              />
            </Field>

            <Field label="Teléfono">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 42%) 1fr', gap: '8px' }}>
                <select
                  style={selectStyle}
                  value={form.telefonoCountry}
                  onChange={(e) => setForm((p) => ({ ...p, telefonoCountry: e.target.value }))}
                >
                  {countryDialOptions.map((country) => (
                    <option key={country.code} value={country.code}>{country.label}</option>
                  ))}
                </select>
                <input
                  style={inputStyle}
                  value={form.telefono}
                  onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))}
                  placeholder="Número"
                />
              </div>
            </Field>

            <Field label="Empresa" error={errors.empresaId}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={form.empresaEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setForm((p) => ({
                        ...p,
                        empresaEnabled: enabled,
                        empresaId: enabled ? (p.empresaId || (empresas[0] ? String(empresas[0].id) : '')) : '',
                      }));
                    }}
                  />
                  Pertenece a una empresa
                </label>
                <select
                  style={{ ...selectStyle, opacity: form.empresaEnabled ? 1 : 0.65, cursor: form.empresaEnabled ? 'pointer' : 'not-allowed' }}
                  value={form.empresaId}
                  disabled={!form.empresaEnabled}
                  onChange={(e) => setForm((p) => ({ ...p, empresaId: e.target.value }))}
                >
                  <option value="" disabled>Selecciona una empresa</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={String(emp.id)}>{emp.nombre} ({emp.ruc})</option>
                  ))}
                </select>
              </div>
            </Field>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Btn onClick={handleSubmit}>Guardar</Btn>
            </div>
          </div>
        </Modal>
      ) : null}

      {isAdmin ? (
        <ConfirmDialog
          open={!!confirmId}
          onOpenChange={(open) => !open && setConfirmId(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
}

