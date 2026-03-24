import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { ESTADOS } from '../../data/initialData';
import { Badge, Card, RSelect, SearchInput, Popover, Modal, Btn, Field, useToast } from '../../components/UI/index.jsx';
import CheckInModal from '../../components/CheckInModal.jsx';
import { BedDouble, Layers, ChevronDown, LogIn, LogOut } from 'lucide-react';

const ESTADO_KEYS = Object.keys(ESTADOS);

export default function RecepcionGeneral() {
  const { habitaciones, tiposHabitacion, pisos, tarifas, cambiarEstado, checkIn, checkOut, alquileres } = useHotel();
  const addToast = useToast();
  const [fPiso,      setFPiso]      = useState('');
  const [fEstado,    setFEstado]    = useState('');
  const [busqueda,   setBusqueda]   = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutTarget, setCheckOutTarget] = useState(null); // alquiler to check-out
  const [checkOutMetodo, setCheckOutMetodo] = useState('EFECTIVO');

  const filtered = habitaciones.filter(h => {
    const mP = !fPiso   || String(h.piso) === fPiso;
    const mE = !fEstado || h.estado === fEstado;
    const mB = !busqueda || h.numero.toLowerCase().includes(busqueda.toLowerCase());
    return mP && mE && mB;
  });

  const habitacionesDisponibles = habitaciones.filter(h => h.estado === 'DISPONIBLE');

  const handleCheckIn = async (checkInData) => {
    try {
      await checkIn(checkInData);
      addToast('Check-in realizado con éxito', 'success');
    } catch {
      addToast('Error al registrar el check-in', 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!checkOutTarget) return;
    try {
      await checkOut(checkOutTarget.id, checkOutMetodo);
      addToast('Check-out realizado con éxito', 'success');
      setCheckOutTarget(null);
    } catch {
      addToast('Error al registrar el check-out', 'error');
    }
  };

  const stats = ESTADO_KEYS.reduce((acc, k) => {
    acc[k] = habitaciones.filter(h => h.estado === k).length;
    return acc;
  }, {});

  return (
    <div className="page-anim">
      {/* Estadísticas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px,1fr))', gap:12, marginBottom:24 }}>
        {[...ESTADO_KEYS, '__total__'].map(k => {
          const isTotal = k === '__total__';
          const e = isTotal ? null : ESTADOS[k];
          const count = isTotal ? habitaciones.length : stats[k];
          const label = isTotal ? 'TOTAL' : e.label;
          const dotColor = isTotal ? 'var(--accent)' : e.dot;
          return (
            <Card key={k} padding="14px 18px" style={{ cursor: isTotal?'default':'pointer' }}
              onClick={() => !isTotal && setFEstado(fEstado===k?'':k)}
            >
              <div style={{ fontSize:26, fontWeight:800, color: isTotal?'var(--accent)':e.color, lineHeight:1, marginBottom:4 }}>
                {count}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:dotColor, flexShrink:0 }} />
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.6px', color:'var(--text-xmuted)', textTransform:'uppercase' }}>{label}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Barra de herramientas */}
      <Card padding="12px 16px" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
          <RSelect
            value={fPiso}
            onValueChange={setFPiso}
            placeholder="Todos los pisos"
            options={pisos.map(p=>({ value:String(p), label:`Piso ${p}` }))}
          />
          <RSelect
            value={fEstado}
            onValueChange={setFEstado}
            placeholder="Todos los estados"
            options={ESTADO_KEYS.map(k=>({ value:k, label:k }))}
          />
          <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar habitación..." />
          <div style={{ marginLeft:'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>
              {filtered.length} habitación{filtered.length!==1?'es':''} encontrada{filtered.length!==1?'s':''}
            </div>
            <button
              onClick={() => setCheckInOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 'var(--r-md)', fontSize: '13.5px',
                fontWeight: 600, border: '1px solid transparent', background: 'var(--accent)',
                color: '#fff', cursor: 'pointer', transition: 'all .15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
            >
              <LogIn size={14} /> Check-In
            </button>
          </div>
        </div>
      </Card>

      {/* Cuadrícula */}
      {filtered.length === 0 ? (
        <Card padding="60px 20px" style={{ textAlign:'center' }}>
          <Layers size={36} style={{ opacity:.25, marginBottom:10, display:'block', margin:'0 auto 10px' }} />
          <p style={{ color:'var(--text-muted)', fontWeight:500 }}>No se encontraron habitaciones</p>
        </Card>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px,1fr))', gap:14 }}>
          {filtered.map(hab => {
            const est  = ESTADOS[hab.estado] || ESTADOS.DISPONIBLE;
            // Find active alquiler for this room
            const activeAlquiler = alquileres.find(a => a.numeroHabitacion === hab.numero && a.estadoAlquiler === 'ACTIVO');

            return (
              <div key={hab.id} style={{
                background:'var(--surface)', borderRadius:'var(--r-lg)',
                border:`1px solid ${est.border}`, boxShadow:'var(--shadow-sm)',
                overflow:'hidden', transition:'transform .15s ease, box-shadow .15s ease',
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
              >
                {/* Color */}
                <div style={{ height:4, background:est.dot }} />

                <div style={{ padding:'14px 14px 10px' }}>
                  {/* Barra de estado */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <Badge label={est.label} color={est.color} bg={est.bg} border={est.border} dot={est.dot} />
                    <div style={{ display:'flex', gap:6 }}>
                      {hab.estado === 'OCUPADA' && activeAlquiler && (
                        <button
                          title="Hacer checkout"
                          onClick={() => { setCheckOutTarget(activeAlquiler); setCheckOutMetodo('EFECTIVO'); }}
                          style={{
                            width:24, height:24, borderRadius:'var(--r-sm)',
                            background:est.bg, border:`1px solid ${est.border}`,
                            display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                            color:est.color,
                          }}
                        >
                          <LogOut size={12} />
                        </button>
                      )}
                      <Popover.Root>
                        <Popover.Trigger asChild>
                          <button
                            title="Cambiar estado"
                            style={{
                              width:24, height:24, borderRadius:'var(--r-sm)',
                              background:est.bg, border:`1px solid ${est.border}`,
                              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                              color:est.color,
                            }}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                          <Popover.Content
                            side="right"
                            align="start"
                            sideOffset={8}
                            style={{
                              background:'var(--surface)', borderRadius:'var(--r-md)',
                              border:'1px solid var(--border)', boxShadow:'var(--shadow-lg)',
                              padding:'8px', width:140, zIndex:1000,
                            }}
                          >
                            <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, textAlign:'center' }}>
                              Cambiar estado
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {ESTADO_KEYS.map(k=>(
                                <button
                                  key={k}
                                  onClick={()=>{ cambiarEstado(hab.id, k); }}
                                  disabled={k === hab.estado}
                                  style={{
                                    padding:'6px 8px', borderRadius:'var(--r-sm)',
                                    background: k === hab.estado ? est.bg : ESTADOS[k].bg,
                                    border:`1px solid ${ESTADOS[k].border}`,
                                    color: ESTADOS[k].color,
                                    fontSize:11, fontWeight:600, cursor:'pointer',
                                    opacity: k === hab.estado ? 0.5 : 1,
                                    textAlign:'left',
                                  }}
                                >
                                  {ESTADOS[k].label}
                                </button>
                              ))}
                            </div>
                          </Popover.Content>
                        </Popover.Portal>
                      </Popover.Root>
                    </div>
                  </div>

                  {/* Número */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <BedDouble size={20} color={est.dot} strokeWidth={1.5} />
                    <span style={{ fontSize:28, fontWeight:800, color:est.color, lineHeight:1 }}>{hab.numero}</span>
                  </div>

                  {/* Información */}
                  <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500, marginBottom:6, textTransform:'uppercase', letterSpacing:'.3px' }}>
                    {hab.tipoHabitacion?.nombre}
                  </div>
                  <div style={{ fontSize:10.5, color:'var(--text-xmuted)' }}>Piso {hab.piso}</div>

                  {/* Huésped activo */}
                  {activeAlquiler && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${est.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>
                        Huésped
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text)', fontWeight: 600 }}>
                        {activeAlquiler.nombreCliente}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        Pendiente: S/ {activeAlquiler.pagoPendiente?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CheckInModal 
        open={checkInOpen} 
        onOpenChange={setCheckInOpen}
        habitacionesDisponibles={habitacionesDisponibles}
        tarifas={tarifas}
        tiposHabitacion={tiposHabitacion}
        pisos={pisos}
        onCheckIn={handleCheckIn}
      />

      {/* Check-out modal — POST /{id}/check-out?metodoPago=X */}
      <Modal open={!!checkOutTarget} onOpenChange={(open) => !open && setCheckOutTarget(null)} title="Confirmar Check-out" width={400}>
        {checkOutTarget && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>Habitación:</strong> {checkOutTarget.numeroHabitacion} — <strong>{checkOutTarget.nombreCliente}</strong>
              </div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>
                <strong>Pendiente:</strong>{' '}
                <span style={{ color: checkOutTarget.pagoPendiente > 0 ? 'var(--red, #e53935)' : 'var(--green, #43a047)', fontWeight: 700 }}>
                  S/ {parseFloat(checkOutTarget.pagoPendiente).toFixed(2)}
                </span>
              </div>
            </div>
            <Field label="Método de pago">
              <select value={checkOutMetodo} onChange={(e) => setCheckOutMetodo(e.target.value)} style={{
                width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md, 8px)',
                border: '1px solid var(--border)', fontSize: 14,
                color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
              }}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="YAPE">Yape</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <Btn variant="ghost" onClick={() => setCheckOutTarget(null)}>Cancelar</Btn>
              <Btn variant="primary" icon={<LogOut size={14} />} onClick={handleCheckOut}>Confirmar Check-out</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
