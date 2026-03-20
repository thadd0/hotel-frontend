import { useState } from 'react';
import CheckInClienteSelector from './CheckInClienteSelector.jsx';
import { Modal, Btn, Field, inputStyle, inputFocus, inputBlur } from './UI/index.jsx';

import { Label } from '@radix-ui/react-label';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import './CheckInModal.css';

const DOCUMENTO_TIPOS = ['DNI', 'PASAPORTE', 'CARNET', 'OTRO'];
const TIPO_ALQUILERES = [
  { value: 'dia', label: 'Por día', multiplier: 1, durationLabel: 'Días', needsDateRange: true },
  { value: 'noche', label: 'Por noche', multiplier: 0.8, durationLabel: 'Noches', needsDateRange: true },
  { value: 'hora', label: 'Por horas', multiplier: 0.04, durationLabel: 'Horas', needsDateRange: false },
];

const BASE_TARIFAS_CATEGORIA = { 
  1: 50, 2: 80, 3: 70, 4: 40, 5: 120, 6: 200, 7: 60 
};

export default function CheckInModal({ open, onOpenChange, habitacionesDisponibles, tarifas, categorias, ubicaciones, onCheckIn }) {
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState([{id:Date.now(), nombre:'', telefono:'', tipoDocumento:'DNI', documento:''}]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [tipoAlquilerGlobal, setTipoAlquilerGlobal] = useState('dia');
  const [filterPiso, setFilterPiso] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]);
  const [duration, setDuration] = useState(1);

  const tipoAlquilerConfig = TIPO_ALQUILERES.find(t => t.value === tipoAlquilerGlobal) || TIPO_ALQUILERES[0];

  const parseDate = (value) => value ? new Date(value + 'T00:00:00') : null;
  const toInputDate = (date) => date instanceof Date ? date.toISOString().split('T')[0] : new Date(date).toISOString().split('T')[0];
  const todayDate = new Date().toISOString().split('T')[0];

  const actualDuration = tipoAlquilerConfig.needsDateRange 
    ? (() => {
        const start = parseDate(checkInDate);
        const end = parseDate(checkOutDate);
        if (!start || !end) return 0;
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 ? Math.floor(diff) : 0;
      })()
    : duration;

  const canProceedStep1 = clientes.every(p => p.nombre.trim() && p.documento.trim());
  const canFinish = selectedRooms.length > 0 && actualDuration > 0;

  const addPerson = () => setPersons([...persons, {id:Date.now(), nombre:'', telefono:'', tipoDocumento:'DNI', documento:''}]);
  const removePerson = (id) => setPersons(persons.filter(p => p.id !== id));
  const updatePerson = (id, field, value) => setPersons(persons.map(p => p.id === id ? {...p, [field]: value} : p));

  const toggleRoom = (room) => {
    const exists = selectedRooms.find(r => r.id === room.id);
    if (exists) {
      setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
    } else {
      setSelectedRooms([...selectedRooms, { 
        id: room.id, 
        tipoAlquiler: tipoAlquilerGlobal, 
        cantidad: 1
      }]);
    }
  };

  const updateRoomConfig = (roomId, updates) => {
    setSelectedRooms(selectedRooms.map(r => r.id === roomId ? { ...r, ...updates } : r));
  };

  const getPisoNombre = (ubicacionId) => {
    return ubicaciones?.find(u => u.id === Number(ubicacionId))?.nombre || 'Piso desconocido';
  };

  const getTarifaValueByCategoria = (categoriaId) => BASE_TARIFAS_CATEGORIA[categoriaId] || 50;

  const selectedRoomsDetails = selectedRooms.map(sel => {
    const room = habitacionesDisponibles.find(r => r.id === sel.id);
    if (!room) return null;
    const tarifaBase = getTarifaValueByCategoria(room.categoriaId);
    const tarifaValue = tarifaBase * tipoAlquilerConfig.multiplier * sel.cantidad;
    return { room, tipoAlquilerConfig, tarifaValue };
  }).filter(Boolean);

  const totalPrice = selectedRoomsDetails.reduce((sum, { tarifaValue }) => sum + tarifaValue, 0);

  const filteredRooms = habitacionesDisponibles.filter(room => {
    const matchesPiso = !filterPiso || String(room.ubicacionId) === filterPiso;
    const matchesCategoria = !filterCategoria || String(room.categoriaId) === filterCategoria;
    return matchesPiso && matchesCategoria;
  });

  const handleFinish = () => {
    if (canFinish) {
      const roomSelections = selectedRooms.map(r => {
        const room = habitacionesDisponibles.find(h => h.id === r.id);
        const tarifaBase = getTarifaValueByCategoria(room.categoriaId);
        const tarifaValue = tarifaBase * tipoAlquilerConfig.multiplier * r.cantidad;
        return { id: r.id, tarifaId: tipoAlquilerConfig.value, tarifaValue, cantidad: r.cantidad };
      });
      onCheckIn(clientes, roomSelections, actualDuration, checkInDate, checkOutDate);
      // Don't reset here, let parent handle
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    // Reset logic moved to parent if needed
    onOpenChange(false);
  };

  return (
        <Modal open={open} onOpenChange={handleClose} title="Check-In" width={680} aria-describedby="checkin-desc" description="Modal para registrar check-in de huéspedes">
      {step === 1 ? (
        <div className="step-content">
          <h3>Paso 1: Cliente(s)</h3>
        <CheckInClienteSelector 
            value={clientes[0]} 
            onChange={(cliente) => {
              if (cliente) {
                const newClientes = [...clientes];
                if (cliente.nuevo) {
                newClientes[0] = {
                  id: Date.now(),
                  ...cliente,
                  nombre: cliente.nombre,
                  documento: cliente.num_documento,
                  tipoDocumento: cliente.tipoDocumento,
                  telefono: cliente.telefono
                };
              } else {
                newClientes[0] = cliente;
              }
              setClientes(newClientes);
            }}}
          />
          <Btn variant="ghost" onClick={() => setClientes([...clientes, {id:Date.now(), nombre:'', telefono:'', tipoDocumento:'DNI', documento:''}])}>
            + Agregar otro cliente
          </Btn>
          <div className="modal-buttons">
            <Btn variant="ghost" onClick={handleClose}>Cancelar</Btn>
            <Btn disabled={!canProceedStep1} onClick={() => setStep(2)}>Siguiente →</Btn>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="step-content">
          <h3>Paso 2: Tipo de Alquiler</h3>
          <div className="alquiler-options">
            {TIPO_ALQUILERES.map(tipo => (
              <div key={tipo.value} className={`alquiler-card ${tipoAlquilerGlobal === tipo.value ? 'selected' : ''}`} onClick={() => setTipoAlquilerGlobal(tipo.value)}>
                <div className="alquiler-title">{tipo.label}</div>
                <div className="alquiler-subtitle">{tipo.needsDateRange ? 'Usar fechas' : 'Número directo'}</div>
              </div>
            ))}
          </div>
          <div className="modal-buttons">
            <Btn variant="ghost" onClick={() => setStep(1)}>← Atrás</Btn>
            <Btn onClick={() => setStep(3)}>Siguiente →</Btn>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="step-content">
          <h3>Paso 3: Duración ({tipoAlquilerConfig.label})</h3>
          {tipoAlquilerConfig.needsDateRange ? (
            <div className="date-range">
              <Field label="Fecha de Ingreso">
                <input 
                  type="date" 
                  value={checkInDate} 
                  min={todayDate}
                  onChange={(e) => {
                    setCheckInDate(e.target.value);
                    const end = parseDate(checkOutDate);
                    const start = parseDate(e.target.value);
                    if (end && start && end <= start) {
                      setCheckOutDate(toInputDate(new Date(start.getTime() + 24*60*60*1000)));
                    }
                  }}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </Field>
              <Field label="Fecha de Salida">
                <input 
                  type="date" 
                  value={checkOutDate} 
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </Field>
              <div className="duration-display">
                <span className="duration-number">{actualDuration}</span>
                <span>{tipoAlquilerConfig.durationLabel.toLowerCase()}</span>
              </div>
            </div>
          ) : (
            <Field label={`Cantidad ${tipoAlquilerConfig.durationLabel.toLowerCase()}`}>
              <input 
                type="number" 
                value={duration} 
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))} 
                min="1"
                style={{ ...inputStyle, fontSize: '18px', textAlign: 'center' }}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </Field>
          )}
          <div className="modal-buttons">
            <Btn variant="ghost" onClick={() => setStep(2)}>← Atrás</Btn>
            <Btn onClick={() => setStep(4)}>Siguiente →</Btn>
          </div>
        </div>
      ) : step === 4 ? (
        <div className="step-content">
          <div className="filters-row">
            <Field label="Piso">
              <select value={filterPiso} onChange={(e) => setFilterPiso(e.target.value)} style={inputStyle}>
                <option value="">Todos</option>
                {ubicaciones?.map(u => <option key={u.id} value={String(u.id)}>{u.nombre}</option>)}
              </select>
            </Field>
            <Field label="Tipo Habitación">
              <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} style={inputStyle}>
                <option value="">Todos</option>
                {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
              </select>
            </Field>
          </div>
          <div className="rooms-section">
            <div className="rooms-grid">
              {filteredRooms.map(room => {
                const isSelected = selectedRooms.some(r => r.id === room.id);
                const pisoNombre = getPisoNombre(room.ubicacionId);
                const cat = categorias.find(c => c.id === room.categoriaId);
                return (
                  <button key={room.id} className={`room-btn ${isSelected ? 'selected' : ''}`} onClick={() => toggleRoom(room)}>
                    <div className="room-number">{room.numero}</div>
                    <div className="room-type">{cat?.nombre?.split(' ')[0] || 'Tipo'}</div>
                    <div className="room-floor">{pisoNombre}</div>
                  </button>
                );
              })}
            </div>
          </div>
          {selectedRooms.length > 0 && (
            <div className="summary">
              <h4>Resumen ({selectedRooms.length} hab{selectedRooms.length !== 1 ? 's' : ''})</h4>
              {selectedRoomsDetails.map(({ room, tipoAlquilerConfig, tarifaValue }) => (
                <div key={room.id} className="summary-row">
                  <span>{room.numero}</span>
                  <span>{tipoAlquilerConfig.label}</span>
                  <span className="price">S/ {tarifaValue.toFixed(2)}</span>
                </div>
              ))}
              <div className="total-row">
                <strong>Total: S/ {totalPrice.toFixed(2)}</strong>
              </div>
            </div>
          )}
          <div className="modal-buttons">
            <Btn variant="ghost" onClick={() => setStep(3)}>← Atrás</Btn>
            <Btn disabled={!canFinish} onClick={handleFinish}>Confirmar Check-In</Btn>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

