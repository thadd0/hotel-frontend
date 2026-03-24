import { useState, useMemo, useEffect } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useHotel } from '../context/HotelContext.jsx';
import { Field, Btn, SearchInput, Modal, useToast } from './UI/index.jsx';
import { Plus, Check } from 'lucide-react';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';

export default function CheckInClienteList({ clientes = [], onClientesChange, onAddModeChange }) {
  const { clientes: allClientes, addCliente, updateCliente, deleteCliente, tiposDocumento, empresas, userRole } = useHotel();
  const isAdmin = userRole === 'admin';
  const addToast = useToast();
  const countryDialOptions = useMemo(() => {
    const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['es'], { type: 'region' })
      : null;

    return getCountries()
      .map((code) => {
        const dialCode = `+${getCountryCallingCode(code)}`;
        const countryName = regionNames?.of(code) || code;
        return {
          code,
          dialCode,
          label: `${countryName} (${code}) ${dialCode}`,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const parsePhoneValue = (rawPhone) => {
    const raw = (rawPhone || '').trim();
    const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return { dialCode: match[1], phone: match[2] || '' };
    }
    return { dialCode: '+51', phone: raw };
  };

  const findCountryCodeByDial = (dialCode) => {
    return countryDialOptions.find((c) => c.dialCode === dialCode)?.code || 'PE';
  };

  const getDialCodeByCountry = (countryCode) => {
    return countryDialOptions.find((c) => c.code === countryCode)?.dialCode || '+51';
  };
  const tiposDocumentoFallback = useMemo(
    () => [
      { id: 1, nombre: 'DNI' },
      { id: 2, nombre: 'CE' },
      { id: 3, nombre: 'PASAPORTE' },
    ],
    []
  );
  const tiposDocumentoSource = useMemo(
    () => (Array.isArray(tiposDocumento) && tiposDocumento.length ? tiposDocumento : tiposDocumentoFallback),
    [tiposDocumento, tiposDocumentoFallback]
  );
  const allowedTipoDocumentoNames = ['DNI', 'CE', 'PASAPORTE'];
  const tiposDocumentoPermitidos = useMemo(
    () => tiposDocumentoSource.filter((td) => allowedTipoDocumentoNames.includes(td?.nombre)),
    [tiposDocumentoSource]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPhoneCountry, setNewPhoneCountry] = useState('PE');
  const [editPhoneCountry, setEditPhoneCountry] = useState('PE');
  const [selectedIds, setSelectedIds] = useState(() => clientes.map((c) => c?.id).filter(Boolean));
  const [newClienteData, setNewClienteData] = useState({
    tipoDocumento: '',
    numDocumento: '',
    nombre: '',
    telefono: '',
    empresaId: '',
  });
  const [editingCliente, setEditingCliente] = useState(null);
  const [editClienteData, setEditClienteData] = useState({
    tipoDocumento: null,
    numDocumento: '',
    nombre: '',
    telefono: '',
    empresaId: '',
  });
  const [editEmpresaEnabled, setEditEmpresaEnabled] = useState(false);

  useEffect(() => {
    setSelectedIds(clientes.map((c) => c?.id).filter(Boolean));
  }, [clientes]);

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return allClientes;
    const term = searchTerm.toLowerCase();
    return allClientes.filter((cliente) =>
      cliente.nombre?.toLowerCase().includes(term) ||
      cliente.numDocumento?.toString().toLowerCase().includes(term)
    );
  }, [allClientes, searchTerm]);

  useEffect(() => {
    if (!newClienteData.tipoDocumento && tiposDocumentoPermitidos.length) {
      setNewClienteData((prev) => ({
        ...prev,
        tipoDocumento: String(tiposDocumentoPermitidos[0].id),
      }));
    }
  }, [tiposDocumentoPermitidos, newClienteData.tipoDocumento]);

  const availableClientes = useMemo(() => {
    if (showNewForm) return [];
    return filteredClientes.filter((cliente) => !selectedIds.includes(cliente.id));
  }, [filteredClientes, selectedIds, showNewForm]);

  const updateSelectedClientes = (nextIds) => {
    const nextSelecionados = allClientes.filter((c) => nextIds.includes(c.id));
    setSelectedIds(nextIds);
    onClientesChange?.(nextSelecionados);
  };

  const toggleSelectCliente = (cliente) => {
    if (!cliente?.id) return;
    const isSelected = selectedIds.includes(cliente.id);
    const nextIds = isSelected ? selectedIds.filter((id) => id !== cliente.id) : [...selectedIds, cliente.id];
    updateSelectedClientes(nextIds);
  };

  const startEditCliente = (cliente) => {
    const tipoActual = cliente.tipoDocumento;
    let tipoDocumentoSeleccionado = null;

    if (tipoActual?.id != null) {
      tipoDocumentoSeleccionado = tiposDocumentoPermitidos.find((td) => td.id === tipoActual.id) || null;
    } else if (typeof tipoActual === 'string') {
      tipoDocumentoSeleccionado = tiposDocumentoPermitidos.find((td) => td.nombre === tipoActual) || null;
    }

    if (!tipoDocumentoSeleccionado) {
      tipoDocumentoSeleccionado = tiposDocumentoPermitidos[0] || null;
    }

    const parsedPhone = parsePhoneValue(cliente.telefono || '');
    setEditPhoneCountry(findCountryCodeByDial(parsedPhone.dialCode));

    const empresaIdActual = cliente.empresaId
      ? String(cliente.empresaId)
      : (cliente.empresaNombre ? String(empresas.find((e) => e.nombre === cliente.empresaNombre)?.id || '') : '');
    setEditEmpresaEnabled(Boolean(empresaIdActual));

    setEditingCliente(cliente);
    setEditClienteData({
      tipoDocumento: tipoDocumentoSeleccionado,
      numDocumento: cliente.numDocumento || '',
      nombre: cliente.nombre || '',
      telefono: parsedPhone.phone,
      empresaId: empresaIdActual,
    });
  };

  const saveEditCliente = async () => {
    if (!editingCliente?.id) return;
    if (!editClienteData.nombre.trim() || !editClienteData.numDocumento.trim()) return;
    if (!editClienteData.tipoDocumento?.id) return;
    try {
      const dialCode = getDialCodeByCountry(editPhoneCountry);
      const telefono = editClienteData.telefono?.trim() ? `${dialCode} ${editClienteData.telefono.trim()}` : '';
      const empresaId = editEmpresaEnabled && editClienteData.empresaId
        ? Number(editClienteData.empresaId)
        : null;
      await updateCliente(editingCliente.id, {
        tipoDocumento: editClienteData.tipoDocumento,
        numDocumento: editClienteData.numDocumento,
        nombre: editClienteData.nombre,
        telefono,
        empresaId,
      });
      setEditingCliente(null);
      updateSelectedClientes(selectedIds);
    } catch {
      // keep modal open so user can retry
    }
  };

  const removeCliente = async (clienteId) => {
    try {
      await deleteCliente(clienteId);
      const nextIds = selectedIds.filter((id) => id !== clienteId);
      setSelectedIds(nextIds);
      onClientesChange?.(allClientes.filter((c) => nextIds.includes(c.id)));
      if (editingCliente?.id === clienteId) setEditingCliente(null);
      addToast('Cliente eliminado', 'info');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'No se puede eliminar: el cliente tiene alquileres asociados', 'error');
    }
  };

  const saveNewCliente = async () => {
    const { tipoDocumento, numDocumento, nombre, telefono } = newClienteData;
    if (!nombre.trim() || !numDocumento.trim()) return;

    try {
      const selectedTipoDocumento = tiposDocumentoPermitidos.find((td) => td.id === Number(tipoDocumento));
      if (!selectedTipoDocumento) return;
      const dialCode = getDialCodeByCountry(newPhoneCountry);
      const telefonoCompleto = telefono?.trim() ? `${dialCode} ${telefono.trim()}` : '';
      const savedCliente = await addCliente({
        tipoDocumento: {
          id: selectedTipoDocumento.id,
          nombre: selectedTipoDocumento.nombre,
        },
        numDocumento,
        nombre,
        telefono: telefonoCompleto,
      });
      if (!savedCliente) return;

      const nextIds = [...selectedIds, savedCliente.id];
      updateSelectedClientes(nextIds);
      setNewClienteData({
        tipoDocumento: tiposDocumentoPermitidos.length ? String(tiposDocumentoPermitidos[0].id) : '',
        numDocumento: '',
        nombre: '',
        telefono: '',
        empresaId: '',
      });
      setNewPhoneCountry('PE');
      setShowNewForm(false);
      setSearchTerm('');
      onAddModeChange?.(false);
    } catch (error) {
      console.error('Error guardando cliente:', error);
    }
  };

  const openNewForm = () => {
    setShowNewForm(true);
    setSearchTerm('');
    onAddModeChange?.(true);
  };

  const closeNewForm = () => {
    setShowNewForm(false);
    onAddModeChange?.(false);
  };

  return (
    <div className="checkin-clients-section">
      <div className="clients-controls">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar cliente..." />
        <button
          className={`add-client-top ${showNewForm ? 'active' : ''}`}
          title={showNewForm ? 'Ocultar formulario de agregar' : 'Agregar huésped'}
          type="button"
          onClick={openNewForm}
        >
          <Plus size={16} />
        </button>
      </div>

      {!showNewForm && (
        <div className="clients-available-list">
          {filteredClientes.length === 0 ? (
            <div className="empty-search">No se encontraron clientes</div>
          ) : (
            filteredClientes.map((cliente) => {
              const isSelected = selectedIds.includes(cliente.id);
              return (
                <div key={cliente.id} className={`client-row ${isSelected ? 'selected' : ''}`}>
                  <Checkbox.Root
                    className="rudimentr-checkbox"
                    checked={isSelected}
                    onCheckedChange={() => toggleSelectCliente(cliente)}
                    id={`cliente-${cliente.id}`}
                  >
                    <Checkbox.Indicator>
                      <Check size={14} />
                    </Checkbox.Indicator>
                  </Checkbox.Root>

                  <div className="client-row-text" onClick={() => toggleSelectCliente(cliente)}>
                    <strong>{cliente.nombre}</strong>
                    <span>{cliente.tipoDocumento?.nombre || cliente.tipoDocumento || 'DNI'}: {cliente.numDocumento || '—'}{cliente.empresaNombre ? ` · ${cliente.empresaNombre}` : ''}</span>
                  </div>
                  <div className="client-row-actions">
                    <button type="button" onClick={() => startEditCliente(cliente)}>Editar</button>
                    {isAdmin && (
                      <button type="button" onClick={() => removeCliente(cliente.id)}>Eliminar</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal open={!!editingCliente} onOpenChange={(open) => !open && setEditingCliente(null)} title="Editar cliente" width={400}>
        {editingCliente && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Nombre" required>
              <input
                type="text"
                value={editClienteData.nombre}
                onChange={(e) => setEditClienteData((s) => ({ ...s, nombre: e.target.value }))}
                placeholder="Nombre completo"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              />
            </Field>

            <Field label="Tipo de documento" required>
              <select
                value={editClienteData.tipoDocumento?.id ?? ''}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selectedTipo = tiposDocumentoPermitidos.find((td) => td.id === selectedId) || null;
                  setEditClienteData((s) => ({ ...s, tipoDocumento: selectedTipo }));
                }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              >
                {tiposDocumentoPermitidos.map((td) => (
                  <option key={td.id} value={td.id}>{td.nombre}</option>
                ))}
              </select>
            </Field>

            <Field label="Número de documento" required>
              <input
                type="text"
                value={editClienteData.numDocumento}
                onChange={(e) => setEditClienteData((s) => ({ ...s, numDocumento: e.target.value }))}
                placeholder="DNI / CE / PASAPORTE"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              />
            </Field>

            <Field label="Teléfono">
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 42%) 1fr', gap: '8px' }}>
                <select
                  value={editPhoneCountry}
                  onChange={(e) => setEditPhoneCountry(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
                >
                  {countryDialOptions.map((country) => (
                    <option key={country.code} value={country.code}>{country.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editClienteData.telefono}
                  onChange={(e) => setEditClienteData((s) => ({ ...s, telefono: e.target.value }))}
                  placeholder="Número"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
                />
              </div>
            </Field>

            <Field label="Empresa">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={editEmpresaEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setEditEmpresaEnabled(enabled);
                      if (!enabled) {
                        setEditClienteData((s) => ({ ...s, empresaId: '' }));
                      } else if (!editClienteData.empresaId && empresas.length) {
                        setEditClienteData((s) => ({ ...s, empresaId: String(empresas[0].id) }));
                      }
                    }}
                  />
                  Pertenece a una empresa
                </label>
                <select
                  value={editClienteData.empresaId}
                  onChange={(e) => setEditClienteData((s) => ({ ...s, empresaId: e.target.value }))}
                  disabled={!editEmpresaEnabled}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--border)',
                    opacity: editEmpresaEnabled ? 1 : 0.6,
                    cursor: editEmpresaEnabled ? 'pointer' : 'not-allowed',
                  }}
                >
                  <option value="" disabled>Selecciona una empresa</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={String(emp.id)}>{emp.nombre} ({emp.ruc})</option>
                  ))}
                </select>
              </div>
            </Field>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Btn onClick={saveEditCliente}>Guardar</Btn>
            </div>
          </div>
        )}
      </Modal>

      {showNewForm && (
        <div className="add-client-panel">
          <Field label="Tipo de documento" required>
            <select
              value={newClienteData.tipoDocumento}
              onChange={(e) => setNewClienteData({ ...newClienteData, tipoDocumento: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
            >
              {tiposDocumentoPermitidos.map(td => (
                <option key={td.id} value={String(td.id)}>{td.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Número de documento" required>
            <input
              type="text"
              value={newClienteData.numDocumento}
              onChange={(e) => setNewClienteData({ ...newClienteData, numDocumento: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              placeholder="Documento"
            />
          </Field>

          <Field label="Nombre completo" required>
            <input
              type="text"
              value={newClienteData.nombre}
              onChange={(e) => setNewClienteData({ ...newClienteData, nombre: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              placeholder="Nombre del huésped"
            />
          </Field>

          <Field label="Teléfono" required>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 42%) 1fr', gap: '8px' }}>
              <select
                value={newPhoneCountry}
                onChange={(e) => setNewPhoneCountry(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              >
                {countryDialOptions.map((country) => (
                  <option key={country.code} value={country.code}>{country.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={newClienteData.telefono}
                onChange={(e) => setNewClienteData({ ...newClienteData, telefono: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
                placeholder="Número"
              />
            </div>
          </Field>

          <Field label="Empresa (opcional)">
            <select
              value={newClienteData.empresaId}
              onChange={(e) => setNewClienteData({ ...newClienteData, empresaId: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
            >
              <option value="">Sin empresa</option>
              {empresas.map(emp => (
                <option key={emp.id} value={String(emp.id)}>{emp.nombre} ({emp.ruc})</option>
              ))}
            </select>
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <Btn onClick={saveNewCliente} variant="primary" full>
              Guardar cliente
            </Btn>
            <Btn variant="ghost" onClick={closeNewForm} full>
              Cancelar
            </Btn>
          </div>
        </div>
      )}

    </div>
  );
}

