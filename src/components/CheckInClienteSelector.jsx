import { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext.jsx';
import { Field, Btn, SearchInput } from './UI/index.jsx';
import { UserPlus } from 'lucide-react';

export default function CheckInClienteSelector({ value, onClienteChange, clientes = [] }) {
  const { addCliente } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoDoc, setTipoDoc] = useState('DNI');
  const [showNew, setShowNew] = useState(false);
  const [newCliente, setNewCliente] = useState({ nombre: '', telefono: '' });

  const tiposDoc = [
    { value: 'DNI', label: 'DNI' },
    { value: 'RUC', label: 'RUC' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'CARNET', label: 'Carnet' },
    { value: 'OTRO', label: 'Otro' }
  ];

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return clientes.filter(cliente => 
      cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.num_documento?.includes(searchTerm) ||
      cliente.documento?.includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  const selectCliente = (cliente) => {
    onClienteChange({
      id: cliente.id,
      nombre: cliente.nombre,
      num_documento: cliente.num_documento,
      tipoDocumento: cliente.tipoDocumento || 'DNI',
      telefono: cliente.telefono || '',
      documento: cliente.num_documento
    });
    setShowNew(false);
  };

  const saveNewCliente = () => {
    if (!newCliente.nombre.trim()) return;
    onClienteChange({
      nuevo: true,
      num_documento: searchTerm,
      tipoDocumento: tipoDoc,
      nombre: newCliente.nombre,
      telefono: newCliente.telefono,
      documento: searchTerm
    });
    setShowNew(false);
    setNewCliente({ nombre: '', telefono: '' });
  };

  const inputBase = {
    padding: '8px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '13px',
    width: '100%',
    outline: 'none'
  };

  return (
    <Field label="Buscar cliente" required>
      <SearchInput 
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Nombre o documento..."
      />
      {filteredClientes.length > 0 ? (
        <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
          {filteredClientes.slice(0, 5).map((cliente) => (
            <div key={cliente.id} style={{
              padding: '12px',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              border: '1px solid transparent'
            }} 
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => selectCliente(cliente)}>
              <div style={{ fontWeight: 600 }}>{cliente.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {cliente.num_documento}
              </div>
            </div>
          ))}
        </div>
      ) : searchTerm ? (
        showNew ? (
          <div style={{ marginTop: 12 }}>
            <input 
              value={newCliente.nombre}
              onChange={(e) => setNewCliente({...newCliente, nombre: e.target.value})}
              placeholder="Nombre completo"
              style={inputBase}
            />
            <input 
              value={newCliente.telefono}
              onChange={(e) => setNewCliente({...newCliente, telefono: e.target.value})}
              placeholder="Teléfono"
              style={inputBase}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn onClick={saveNewCliente} size="sm">Guardar nuevo</Btn>
              <Btn variant="ghost" onClick={() => setShowNew(false)} size="sm">Cancelar</Btn>
            </div>
          </div>
        ) : (
          <div className="cliente-selector-notfound">
            <span className="notfound-label">No existe: {searchTerm}</span>
            <button
              onClick={() => setShowNew(true)}
              title={`Crear nuevo cliente ${tipoDoc}: ${searchTerm}`}
              className="notfound-add-btn"
            >
              +
            </button>
          </div>
        )
      ) : null}
      {showNew && (
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Tipo Doc</label>
          <select 
            value={tipoDoc} 
            onChange={(e) => setTipoDoc(e.target.value)}
            style={inputBase}
          >
            {tiposDoc.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      )}
    </Field>
  );
}

