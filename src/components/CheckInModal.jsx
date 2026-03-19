import { useState } from 'react';
import { Modal, Btn } from './UI/index.jsx';
import { Label } from '@radix-ui/react-label';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const DOCUMENTO_TIPOS = ['DNI', 'PASAPORTE', 'CARNET', 'OTRO'];

export default function CheckInModal({ open, onOpenChange, habitacionesDisponibles, tarifas, categorias, onCheckIn }) {
  const [step, setStep] = useState(1);
  const [persons, setPersons] = useState([{id:Date.now(), nombre:'', telefono:'', tipoDocumento:'DNI', documento:''}]);
  const [selectedRooms, setSelectedRooms] = useState([]); // [{id, tarifaId}]

  const today = new Date();
  const toInputDate = (d) => d.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(toInputDate(today));
  const [checkOutDate, setCheckOutDate] = useState(toInputDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)));

  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterTarifa, setFilterTarifa] = useState('');

  const addPerson = () => {
    setPersons([...persons, {id:Date.now(), nombre:'', telefono:'', tipoDocumento:'DNI', documento:''}]);
  };

  const removePerson = (id) => {
    setPersons(persons.filter(p => p.id !== id));
  };

  const updatePerson = (id, field, value) => {
    setPersons(persons.map(p => p.id === id ? {...p, [field]: value} : p));
  };

  const toggleRoom = (room) => {
    const exists = selectedRooms.find(r => r.id === room.id);
    if (exists) {
      setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
      return;
    }

    const defaultTarifaId = room.tarifaIds?.[0] ?? null;
    setSelectedRooms([...selectedRooms, { id: room.id, tarifaId: defaultTarifaId }]);
  };

  const updateRoomTarifa = (roomId, tarifaId) => {
    setSelectedRooms(selectedRooms.map(r => r.id === roomId ? { ...r, tarifaId } : r));
  };

  const parseDate = (value) => value ? new Date(value + 'T00:00:00') : null;
  const calculateNights = (start, end) => {
    if (!start || !end) return 0;
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights(parseDate(checkInDate), parseDate(checkOutDate));

  const canProceedStep1 = persons.every(p => p.nombre.trim() && p.telefono.trim() && p.documento.trim());
  const canProceedStep2 = selectedRooms.length > 0 && nights > 0;
  const canFinish = canProceedStep2;

  const handleFinish = () => {
    if (canFinish) {
      onCheckIn(persons, selectedRooms, nights, checkInDate, checkOutDate);
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    const now = new Date();

    setStep(1);
    setPersons([{id:Date.now(), nombre:'', telefono:'', tipoDocumento:'DNI', documento:''}]);
    setSelectedRooms([]);

    setCheckInDate(toInputDate(now));
    setCheckOutDate(toInputDate(new Date(now.getTime() + 24 * 60 * 60 * 1000)));

    setFilterCategoria('');
    setFilterTarifa('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getTarifaById = (tarifaId) => tarifas.find(t => t.id === tarifaId);

  const getRoomDefaultTarifaId = (room) => room.tarifaIds?.[0] ?? null;

  const getRoomTarifaValue = (room, tarifaIdOverride) => {
    const tarifaId = tarifaIdOverride ?? getRoomDefaultTarifaId(room);
    const tarifa = getTarifaById(tarifaId);
    return Number(tarifa?.nombre || 0);
  };

  const selectedRoomsDetails = selectedRooms
    .map(sel => {
      const room = habitacionesDisponibles.find(r => r.id === sel.id);
      if (!room) return null;
      return {
        room,
        tarifaId: sel.tarifaId ?? getRoomDefaultTarifaId(room),
      };
    })
    .filter(Boolean);

  const totalPrice = selectedRoomsDetails.reduce((sum, { room, tarifaId }) => {
    return sum + getRoomTarifaValue(room, tarifaId) * nights;
  }, 0);

  const filteredRooms = habitacionesDisponibles.filter(room => {
    const matchesCategoria = !filterCategoria || String(room.categoriaId) === filterCategoria;
    const matchesTarifa = !filterTarifa || room.tarifaIds?.includes(Number(filterTarifa));
    return matchesCategoria && matchesTarifa;
  });

  return (
    <Modal open={open} onOpenChange={handleClose} title="Check-In" width={850}>
      {step === 1 ? (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Paso 1 de 3: Registrar Huéspedes
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Ingresa los datos de los huéspedes que ocuparán la habitación
            </div>
          </div>

          <div style={{ maxHeight: 350, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}>
            {persons.map((person, idx) => (
              <div key={person.id} style={{ marginBottom: 16, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                    Huésped #{idx + 1}
                  </div>
                  {persons.length > 1 && (
                    <button
                      onClick={() => removePerson(person.id)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <Label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3, textTransform: 'uppercase' }}>
                    Nombre
                  </Label>
                  <input
                    value={person.nombre}
                    onChange={(e) => updatePerson(person.id, 'nombre', e.target.value)}
                    placeholder="Nombre completo"
                    style={{
                      width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text)',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <Label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3, textTransform: 'uppercase' }}>
                      Tipo de Documento
                    </Label>
                    <select
                      value={person.tipoDocumento}
                      onChange={(e) => updatePerson(person.id, 'tipoDocumento', e.target.value)}
                      style={{
                        width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text)',
                      }}
                    >
                      {DOCUMENTO_TIPOS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3, textTransform: 'uppercase' }}>
                      Número
                    </Label>
                    <input
                      value={person.documento}
                      onChange={(e) => updatePerson(person.id, 'documento', e.target.value)}
                      placeholder="Número de documento"
                      style={{
                        width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text)',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                </div>

                <div>
                  <Label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 3, textTransform: 'uppercase' }}>
                    Teléfono
                  </Label>
                  <input
                    value={person.telefono}
                    onChange={(e) => updatePerson(person.id, 'telefono', e.target.value)}
                    placeholder="Número de teléfono"
                    style={{
                      width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text)',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <Btn variant="ghost" size="sm" icon={<Plus size={14} />} onClick={addPerson} full>
              + Agregar Huésped
            </Btn>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={handleClose}>Cancelar</Btn>
            <Btn disabled={!canProceedStep1} onClick={() => setStep(2)} icon={<ChevronRight size={14} />}>
              Siguiente
            </Btn>
          </div>
        </div>
      ) : step === 2 ? (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Paso 2 de 3: Seleccionar Habitaciones
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Selecciona las habitaciones disponibles para los huéspedes y define la duración de la estancia.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div>
              <Label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase' }}>
                Filtrar por tipo
              </Label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', background: 'var(--surface)', color: 'var(--text)',
                }}
              >
                <option value="">-- Todos los tipos --</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <Label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase' }}>
                Filtrar por tarifa
              </Label>
              <select
                value={filterTarifa}
                onChange={(e) => setFilterTarifa(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)', background: 'var(--surface)', color: 'var(--text)',
                }}
              >
                <option value="">-- Todas las tarifas --</option>
                {tarifas.map(t => (
                  <option key={t.id} value={t.id}>S/ {t.nombre}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <Label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Fecha de ingreso
                </Label>
                <input
                  type="date"
                  value={checkInDate}
                  min={toInputDate(today)}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    setCheckInDate(newCheckIn);
                    const start = parseDate(newCheckIn);
                    const end = parseDate(checkOutDate);
                    if (end && start && end <= start) {
                      setCheckOutDate(toInputDate(new Date(start.getTime() + 24 * 60 * 60 * 1000)));
                    }
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)', background: 'var(--surface)', color: 'var(--text)',
                  }}
                />
              </div>

              <div>
                <Label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Fecha de salida
                </Label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={toInputDate(new Date(parseDate(checkInDate).getTime() + 24 * 60 * 60 * 1000))}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)', background: 'var(--surface)', color: 'var(--text)',
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Noches: <strong>{nights}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
            {filteredRooms.map(room => {
              const isSelected = selectedRooms.some(r => r.id === room.id);
              const roomTarifaValue = getRoomTarifaValue(room);
              const cat = categorias.find(c => c.id === room.categoriaId);
              return (
                <button
                  key={room.id}
                  onClick={() => toggleRoom(room)}
                  style={{
                    padding: '14px 12px', minHeight: 120, borderRadius: 'var(--r-md)', cursor: 'pointer',
                    border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-light)' : 'var(--bg)',
                    color: isSelected ? 'var(--accent-dark)' : 'var(--text)',
                    fontWeight: 600, fontSize: 13, transition: 'all .15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{room.numero}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {cat?.nombre || 'Sin tipo'}
                  </span>
                  <span style={{ fontSize: 12, marginTop: 6 }}>
                    Tarifa: <strong>S/ {roomTarifaValue}</strong>
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRoomsDetails.length > 0 && (
            <div style={{ marginBottom: 20, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
                Detalles de la reserva
              </div>

              {selectedRoomsDetails.map(({ room, tarifaId }) => {
                const tarifa = getTarifaById(tarifaId);
                const tarifaValue = getRoomTarifaValue(room, tarifaId);
                const availableTarifas = room.tarifaIds || [];
                return (
                  <div key={room.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{room.numero}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Tarifa por noche: S/ {tarifaValue}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {availableTarifas.length > 1 ? (
                        <select
                          value={tarifaId}
                          onChange={(e) => updateRoomTarifa(room.id, Number(e.target.value))}
                          style={{
                            width: 130, padding: '8px 10px', fontSize: 12, border: '1px solid var(--border)',
                            borderRadius: 'var(--r-sm)', background: 'var(--surface)', color: 'var(--text)',
                          }}
                        >
                          {availableTarifas.map(tid => {
                            const t = getTarifaById(tid);
                            return <option key={tid} value={tid}>S/ {t?.nombre || '-'}</option>;
                          })}
                        </select>
                      ) : (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Tarifa fija
                        </div>
                      )}

                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>
                        Subtotal: S/ {tarifaValue * nights}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Total a pagar</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>S/ {totalPrice}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setStep(1)}>
              Atrás
            </Btn>
            <Btn disabled={!canProceedStep2} onClick={() => setStep(3)} icon={<ChevronRight size={14} />}>
              Siguiente
            </Btn>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
              Paso 3 de 3: Resumen
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Verifica toda la información antes de confirmar el check-in
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Huéspedes
              </div>
              {persons.map((p, idx) => (
                <div key={p.id} style={{ fontSize: 12, color: 'var(--text)', marginBottom: 6, paddingBottom: 6, borderBottom: idx !== persons.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {p.tipoDocumento}: {p.documento} | Tel: {p.telefono}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Habitaciones
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
                {selectedRoomsDetails.map(d => d.room.numero).join(', ')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Check-in / Check-out
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
                  {checkInDate} → {checkOutDate}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Noches
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
                  {nights}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Total a pagar
                </div>
                <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>
                  S/ {totalPrice}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" icon={<ChevronLeft size={14} />} onClick={() => setStep(2)}>
              Atrás
            </Btn>
            <Btn onClick={handleFinish}>Guardar Check-In</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}