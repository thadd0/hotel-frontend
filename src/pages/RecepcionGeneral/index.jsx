import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { ESTADOS } from '../../data/initialData';
import { Badge, Card, RSelect, SearchInput, Popover } from '../../components/UI/index.jsx';
import CheckInModal from '../../components/CheckInModal.jsx';
import { BedDouble, Layers, ChevronDown, LogIn, LogOut } from 'lucide-react';

const ESTADO_KEYS = Object.keys(ESTADOS);

export default function RecepcionGeneral() {
  const { habitaciones, categorias, ubicaciones, tarifas, cambiarEstado, checkIn, checkOut } = useHotel();
  const [fUbicacion, setFUbicacion] = useState('');
  const [fEstado,    setFEstado]    = useState('');
  const [busqueda,   setBusqueda]   = useState('');
  const [checkInOpen, setCheckInOpen] = useState(false);

  const filtered = habitaciones.filter(h => {
    const mU = !fUbicacion || String(h.ubicacionId) === fUbicacion;
    const mE = !fEstado    || h.estado === fEstado;
    const mB = !busqueda   || h.numero.toLowerCase().includes(busqueda.toLowerCase());
    return mU && mE && mB;
  });

  const habitacionesDisponibles = habitaciones.filter(h => h.estado === 'DISPONIBLE');

  const handleCheckIn = (persons, roomSelections, nights, startDate, endDate) => {
    checkIn(persons, roomSelections, nights, startDate, endDate);
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
            value={fUbicacion}
            onValueChange={setFUbicacion}
            placeholder="Todas las ubicaciones"
            options={ubicaciones.map(u=>({ value:String(u.id), label:u.nombre }))}
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
            const est   = ESTADOS[hab.estado];
            const cat   = categorias.find(c  => c.id  === hab.categoriaId);
            const ubic  = ubicaciones.find(u  => u.id  === hab.ubicacionId);
            const hTars = tarifas.filter(t => hab.tarifaIds?.includes(t.id));

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
                      {hab.estado === 'OCUPADO' && (
                        <button
                          title="Hacer checkout"
                          onClick={() => checkOut(hab.id)}
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
                    {cat?.nombre}
                  </div>
                  {ubic && (
                    <div style={{ fontSize:10.5, color:'var(--text-xmuted)' }}>{ubic.nombre}</div>
                  )}

                  {hTars.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:8 }}>
                      {hTars.map(t=>(
                        <span key={t.id} style={{
                          background:'var(--accent-light)', color:'var(--accent-dark)',
                          fontSize:10, fontWeight:700, padding:'2px 7px',
                          borderRadius:'var(--r-full)', border:'1px solid var(--accent-mid)',
                        }}>
                          S/ {t.nombre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Huéspedes */}
                  {hab.persons && hab.persons.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${est.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>
                        Huéspedes
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {hab.persons.map((p, idx) => (
                          <div key={idx} style={{ fontSize: 10.5, color: 'var(--text)' }}>
                            <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>
                              {p.tipoDocumento}: {p.documento}
                            </div>
                          </div>
                        ))}
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
        categorias={categorias}
        ubicaciones={ubicaciones}
        onCheckIn={handleCheckIn}
      />
    </div>
  );
}
