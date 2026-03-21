import { useState, useCallback } from "react";
import CheckInClienteList from "./CheckInClienteList.jsx";
import { Modal, Btn, Field, inputStyle, inputFocus, inputBlur } from "./UI/index.jsx";
import { LogIn, Trash2 } from "lucide-react";
import "./CheckInModal.css";

const TIPO_ALQUILERES = [
  { value: "dia", label: "Por día", multiplier: 1, durationLabel: "Días", needsDateRange: true },
  { value: "noche", label: "Por noche", multiplier: 0.8, durationLabel: "Noches", needsDateRange: true },
  { value: "hora", label: "Por horas", multiplier: 0.04, durationLabel: "Horas", needsDateRange: false },
];

const BASE_TARIFAS_CATEGORIA = { 1: 50, 2: 80, 3: 70, 4: 40, 5: 120, 6: 200, 7: 60 };

export default function CheckInModal({
  open,
  onOpenChange,
  habitacionesDisponibles,
  tarifas,
  categorias,
  ubicaciones,
  onCheckIn,
}) {
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [tipoAlquilerGlobal, setTipoAlquilerGlobal] = useState("dia");
  const [isAddClienteOpen, setIsAddClienteOpen] = useState(false);
  const [filterPiso, setFilterPiso] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [duration, setDuration] = useState(1);

  const tipoAlquilerConfig = TIPO_ALQUILERES.find((t) => t.value === tipoAlquilerGlobal) || TIPO_ALQUILERES[0];

  const todayDate = new Date().toISOString().split("T")[0];
  const parseDate = (value) => (value ? new Date(value + "T00:00:00") : null);
  const toInputDate = (date) => (date instanceof Date ? date.toISOString().split("T")[0] : new Date(date).toISOString().split("T")[0]);

  const actualDuration = tipoAlquilerConfig.needsDateRange
    ? (() => {
        const start = parseDate(checkInDate);
        const end = parseDate(checkOutDate);
        if (!start || !end) return 0;
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 ? Math.floor(diff) : 0;
      })()
    : duration;

  // Validaciones
  const canProceedStep1 = !isAddClienteOpen && clientes.length > 0 && clientes.every(c => c.nombre?.trim());
  const canProceedStep2 = !!tipoAlquilerGlobal && actualDuration > 0;
  const canFinish = selectedRooms.length > 0 && canProceedStep2;

  const getTarifaValueByCategoria = (categoriaId) => BASE_TARIFAS_CATEGORIA[categoriaId] || 50;
  const getPisoNombre = (ubicacionId) => ubicaciones?.find((u) => u.id === Number(ubicacionId))?.nombre || "Piso desconocido";

  const selectedRoomsDetails = selectedRooms
    .map((sel) => {
      const room = habitacionesDisponibles.find((r) => r.id === sel.id);
      if (!room) return null;
      const tarifaBase = getTarifaValueByCategoria(room.categoriaId);
      const tarifaValue = tarifaBase * tipoAlquilerConfig.multiplier * sel.cantidad;
      return { room, tipoAlquilerConfig, tarifaValue };
    })
    .filter(Boolean);

  const totalPrice = selectedRoomsDetails.reduce((sum, { tarifaValue }) => sum + tarifaValue, 0);

  const filteredRooms = habitacionesDisponibles.filter((room) => {
    const matchesPiso = !filterPiso || String(room.ubicacionId) === filterPiso;
    const matchesCategoria = !filterCategoria || String(room.categoriaId) === filterCategoria;
    return matchesPiso && matchesCategoria;
  });

  const toggleRoom = (room) => {
    const exists = selectedRooms.find((r) => r.id === room.id);
    if (exists) {
      setSelectedRooms(selectedRooms.filter((r) => r.id !== room.id));
    } else {
      setSelectedRooms([...selectedRooms, { id: room.id, tipoAlquiler: tipoAlquilerGlobal, cantidad: 1 }]);
    }
  };

  const resetForm = useCallback(() => {
    setStep(1);
    setClientes([]);
    setSelectedRooms([]);
    setTipoAlquilerGlobal("dia");
    setFilterPiso("");
    setFilterCategoria("");
    setCheckInDate(new Date().toISOString().split("T")[0]);
    setCheckOutDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setDuration(1);
  }, []);

  const handleFinish = () => {
    if (canFinish && canProceedStep1) {
      const roomSelections = selectedRooms.map((r) => {
        const room = habitacionesDisponibles.find((h) => h.id === r.id);
        const tarifaBase = getTarifaValueByCategoria(room.categoriaId);
        const tarifaValue = tarifaBase * tipoAlquilerConfig.multiplier * r.cantidad;
        return { id: r.id, tarifaId: tipoAlquilerConfig.value, tarifaValue, cantidad: r.cantidad };
      });

      // Ejecutar callback
      onCheckIn(clientes, roomSelections, actualDuration, checkInDate, checkOutDate);

      // Cerrar modal después del check-in exitoso
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Check-In"
      width={700}
      aria-describedby="checkin-desc"
      description="Registro de check-in de huéspedes"
    >
      {/* PASO 1: CLIENTES */}
      {step === 1 && (
        <div className="step-wrapper">
          <div className="step-header">
            <h3>Paso 1 de 3: Cliente(s)</h3>
            <p className="step-description">Agregue al menos un huésped para continuar</p>
          </div>

          <div className="step-content">
            <CheckInClienteList clientes={clientes} onClientesChange={setClientes} onAddModeChange={setIsAddClienteOpen} />
          </div>

          <div className="step-footer">
            <Btn variant="ghost" onClick={handleClose}>
              Cancelar
            </Btn>
            <Btn disabled={!canProceedStep1} onClick={() => setStep(2)}>
              Siguiente →
            </Btn>
          </div>
        </div>
      )}

      {/* PASO 2: TIPO DE ALQUILER + DURACIÓN */}
      {step === 2 && (
        <div className="step-wrapper">
          <div className="step-header">
            <h3>Paso 2 de 3: Tipo de Alquiler + Duración</h3>
            <p className="step-description">Seleccione cómo se cobrará la estadía y el período</p>
          </div>

          <div className="step-content">
            <div className="alquiler-grid">
              {TIPO_ALQUILERES.map((tipo) => (
                <div
                  key={tipo.value}
                  className={`alquiler-card ${tipoAlquilerGlobal === tipo.value ? "selected" : ""}`}
                  onClick={() => setTipoAlquilerGlobal(tipo.value)}
                  role="button"
                  tabIndex={0}
                  onKeyUp={(e) => e.key === "Enter" && setTipoAlquilerGlobal(tipo.value)}
                >
                  <div className="alquiler-title">{tipo.label}</div>
                  <div className="alquiler-subtitle">{tipo.needsDateRange ? "Con fechas" : "Cantidad directa"}</div>
                </div>
              ))}
            </div>

            {tipoAlquilerConfig.needsDateRange ? (
              <div className="date-grid">
                <Field label="Fecha de Ingreso" required>
                  <input
                    type="date"
                    value={checkInDate}
                    min={todayDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      const end = parseDate(checkOutDate);
                      const start = parseDate(e.target.value);
                      if (end && start && end <= start) {
                        setCheckOutDate(toInputDate(new Date(start.getTime() + 24 * 60 * 60 * 1000)));
                      }
                    }}
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </Field>

                <Field label="Fecha de Salida" required>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={toInputDate(new Date(parseDate(checkInDate).getTime() + 24 * 60 * 60 * 1000))}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                </Field>
              </div>
            ) : (
              <div className="hours-controls">
                <Field label="Cantidad de horas" required>
                  <div className="hours-only-wrap">
                    <button type="button" className="hours-step" onClick={() => setDuration(Math.max(1, duration - 1))}>-</button>
                    <span className="hours-value">{duration}</span>
                    <button type="button" className="hours-step" onClick={() => setDuration(duration + 1)}>+</button>
                  </div>
                </Field>
              </div>
            )}

            {tipoAlquilerConfig.needsDateRange && (
              <div className="duration-display duration-fixed">
                <div className="duration-number">{actualDuration}</div>
                <div className="duration-label">{tipoAlquilerConfig.durationLabel}</div>
              </div>
            )}
          </div>

          <div className="step-footer">
            <Btn variant="ghost" onClick={() => setStep(1)}>
              ← Atrás
            </Btn>
            <Btn disabled={!canProceedStep2} onClick={() => setStep(3)}>
              Siguiente →
            </Btn>
          </div>
        </div>
      )}

      {/* PASO 3: HABITACIONES */}
      {step === 3 && (
        <div className="step-wrapper">
          <div className="step-header">
            <h3>Paso 3 de 3: Habitaciones</h3>
            <p className="step-description">Seleccione las habitaciones para el check-in</p>
          </div>

          <div className="step-content">
            <div className="filters-row">
              <Field label="Piso">
                <select value={filterPiso} onChange={(e) => setFilterPiso(e.target.value)} style={inputStyle}>
                  <option value="">Todos los pisos</option>
                  {ubicaciones?.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo Habitación">
                <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} style={inputStyle}>
                  <option value="">Todos los tipos</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="rooms-section">
              {filteredRooms.length === 0 ? (
                <div className="empty-rooms">
                  <p>No hay habitaciones disponibles con estos filtros</p>
                </div>
              ) : (
                <div className="rooms-grid">
                  {filteredRooms.map((room) => {
                    const isSelected = selectedRooms.some((r) => r.id === room.id);
                    const cat = categorias.find((c) => c.id === room.categoriaId);
                    return (
                      <button
                        key={room.id}
                        className={`room-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleRoom(room)}
                        title={`Habitación ${room.numero} - ${cat?.nombre}`}
                      >
                        <div className="room-number">{room.numero}</div>
                        <div className="room-type">{cat?.nombre?.split(" ")[0] || "Tipo"}</div>
                        <div className="room-floor">{getPisoNombre(room.ubicacionId)}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedRooms.length > 0 && (
              <div className="summary-section">
                <h4 className="summary-title">
                  Resumen ({selectedRooms.length} {selectedRooms.length === 1 ? "habitación" : "habitaciones"})
                </h4>
                <div className="summary-rows">
                  {selectedRoomsDetails.map(({ room, tipoAlquilerConfig, tarifaValue }) => (
                    <div key={room.id} className="summary-row">
                      <span className="room-num">Hab. {room.numero}</span>
                      <span className="room-rental">{tipoAlquilerConfig.label}</span>
                      <span className="room-price">S/ {tarifaValue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <strong>Total:</strong>
                  <strong className="total-amount">S/ {totalPrice.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="step-footer">
            <Btn variant="ghost" onClick={() => setStep(2)}>
              ← Atrás
            </Btn>
            <Btn disabled={!canFinish} variant="primary" icon={<LogIn size={14} />} onClick={handleFinish}>
              Confirmar Check-In
            </Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}
