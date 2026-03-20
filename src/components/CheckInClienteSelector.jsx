import { useState, useEffect } from 'react';
import { RSelect, Field, Btn } from './UI/index.jsx';
import { getClienteByDocumento } from '../api/clientes';

export default function CheckInClienteSelector({ value, onChange }) {
  const [documento, setDocumento] = useState('');
  const [tipoDoc, setTipoDoc] = useState('DNI');
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '' });

  const tiposDoc = [
    { value: 'DNI', label: 'DNI' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'CARNET', label: 'Carnet' },
    { value: 'OTRO', label: 'Otro' }
  ];

  useEffect(() => {
    if (documento && cliente === null) {
      buscarCliente();
    }
  }, [documento]);

  const buscarCliente = async () => {
    if (!documento.trim()) return;
    setBuscando(true);
    try {
      const found = await getClienteByDocumento(documento);
      if (found) {
        setCliente(found);
        onChange({
          id: found.id,
          nombre: found.nombre,
          num_documento: found.num_documento,
          telefono: found.telefono,
          tipoDocumento: tiposDoc.find(t => t.value === found.tipo_documento)?.label || 'DNI'
        });
      } else {
        setCliente(null);
        setNuevoCliente({ nombre: '', telefono: '' });
      }
    } catch (error) {
      setCliente(null);
    }
    setBuscando(false);
  };

  const crearCliente = () => {
    if (!nuevoCliente.nombre.trim()) return;
    // Trigger parent to create cliente
    onChange({
      nuevo: true,
      num_documento: documento,
      tipoDocumento: tipoDoc,
      nombre: nuevoCliente.nombre,
      telefono: nuevoCliente.telefono
    });
    setCliente({ nombre: nuevoCliente.nombre, telefono: nuevoCliente.telefono });
  };

  const handleDocumentoChange = (value) => {
    setDocumento(value);
    setCliente(null);
    onChange(null);
  };

  if (cliente) {
    return (
      <Field label="Cliente encontrado">
        <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{cliente.nombre}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {tipoDoc}: {documento} | {cliente.telefono || 'Sin teléfono'}
          </div>
        </div>
        <div style={{ opacity: 0.6, fontSize: 11, textAlign: 'center' }}>
          Cliente registrado ✓
        </div>
      </Field>
    );
  }

  return (
    <Field label="Cliente" required>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Tipo Doc</label>
          <select 
            value={tipoDoc} 
            onChange={(e) => setTipoDoc(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13, width: 80 }}
          >
            {tiposDoc.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 160 }}>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Nº Documento</label>
          <input 
            value={documento}
            onChange={(e) => handleDocumentoChange(e.target.value)}
            placeholder="Ej: 12345678"
            style={{ padding: '6px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13, width: '100%' }}
          />
        </div>
      </div>
      {buscando && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8 }}>Buscando...</div>}
      {documento && !buscando && !cliente && (
        <div>
          <Field label="Nuevo cliente">
            <input 
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              placeholder="Nombre completo"
              style={{ marginBottom: 8, width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text)', background: 'var(--surface)' }} 
            />
            <input 
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
              placeholder="+51 999 999 999"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text)', background: 'var(--surface)' }}
            />
            <Btn onClick={crearCliente} style={{ marginTop: 8, width: '100%' }} size="sm">
              Crear cliente
            </Btn>
          </Field>
        </div>
      )}
    </Field>
  );
}

