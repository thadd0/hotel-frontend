import { useState, useMemo, useEffect } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useHotel } from '../context/HotelContext.jsx';
import { Field, Btn, SearchInput } from './UI/index.jsx';
import { Users, Plus, Check } from 'lucide-react';

export default function CheckInClienteList({ clientes = [], onClientesChange, onAddModeChange }) {
  const { clientes: allClientes, addCliente, updateCliente, deleteCliente, tiposDocumento, empresas } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => clientes.map((c) => c?.id).filter(Boolean));
  const [newClienteData, setNewClienteData] = useState({
    tipoDocumento: 'DNI',
    numDocumento: '',
    nombre: '',
    telefono: '',
    empresaId: '',
  });
  const [editingCliente, setEditingCliente] = useState(null);
  const [editClienteData, setEditClienteData] = useState({
    tipoDocumento: 'DNI',
    numDocumento: '',
    nombre: '',
    telefono: '',
  });

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
    setEditingCliente(cliente);
    setEditClienteData({
      tipoDocumento: cliente.tipoDocumento?.nombre || cliente.tipoDocumento || 'DNI',
      numDocumento: cliente.numDocumento || '',
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
    });
  };

  const cancelEditCliente = () => {
    setEditingCliente(null);
  };

  const saveEditCliente = async () => {
    if (!editingCliente?.id) return;
    if (!editClienteData.nombre.trim() || !editClienteData.numDocumento.trim()) return;
    try {
      await updateCliente(editingCliente.id, {
        tipoDocumento: editClienteData.tipoDocumento,
        numDocumento: editClienteData.numDocumento,
        nombre: editClienteData.nombre,
        telefono: editClienteData.telefono,
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
    } catch {
      // keep list unchanged if delete fails
    }
  };

  const saveNewCliente = async () => {
    const { tipoDocumento, numDocumento, nombre, telefono } = newClienteData;
    if (!nombre.trim() || !numDocumento.trim()) return;

    try {
      const savedCliente = await addCliente({ tipoDocumento, numDocumento, nombre, telefono });
      if (!savedCliente) return;

      const nextIds = [...selectedIds, savedCliente.id];
      updateSelectedClientes(nextIds);
      setNewClienteData({ tipoDocumento: 'DNI', numDocumento: '', nombre: '', telefono: '', empresaId: '' });
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

{editingCliente?.id === cliente.id ? (
                    <div className="cliente-edit-row cliente-edit-active">
                      <div className="form-row">
                        <label>Nombre</label>
                        <input
                          type="text"
                          value={editClienteData.nombre}
                          onChange={(e) => setEditClienteData((s) => ({ ...s, nombre: e.target.value }))}
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div className="form-row">
                        <label>Documento</label>
                        <input
                          type="text"
                          value={editClienteData.numDocumento}
                          onChange={(e) => setEditClienteData((s) => ({ ...s, numDocumento: e.target.value }))}
                          placeholder="DNI / RUC / Carné"
                        />
                      </div>
                      <div className="form-row">
                        <label>Teléfono</label>
                        <input
                          type="text"
                          value={editClienteData.telefono}
                          onChange={(e) => setEditClienteData((s) => ({ ...s, telefono: e.target.value }))}
                          placeholder="Teléfono"
                        />
                      </div>
                      <div className="edit-actions">
                        <button type="button" className="btn-primary" onClick={saveEditCliente}>Guardar</button>
                        <button type="button" className="btn-secondary" onClick={cancelEditCliente}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="client-row-text" onClick={() => toggleSelectCliente(cliente)}>
                        <strong>{cliente.nombre}</strong>
                        <span>{cliente.tipoDocumento?.nombre || cliente.tipoDocumento || 'DNI'}: {cliente.numDocumento || '—'}{cliente.empresaNombre ? ` · ${cliente.empresaNombre}` : ''}</span>
                      </div>
                      <div className="client-row-actions">
                        <button type="button" onClick={() => startEditCliente(cliente)}>Editar</button>
                        <button type="button" onClick={() => removeCliente(cliente.id)}>Eliminar</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {showNewForm && (
        <div className="add-client-panel">
          <Field label="Tipo de documento" required>
            <select
              value={newClienteData.tipoDocumento}
              onChange={(e) => setNewClienteData({ ...newClienteData, tipoDocumento: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
            >
              {tiposDocumento.map(td => (
                <option key={td.id} value={td.nombre}>{td.nombre}</option>
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
            <input
              type="text"
              value={newClienteData.telefono}
              onChange={(e) => setNewClienteData({ ...newClienteData, telefono: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}
              placeholder="Teléfono"
            />
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

