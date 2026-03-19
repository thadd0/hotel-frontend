import { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { ESTADOS } from '../data/initialData';
import { Badge, Card, RSelect, SearchInput } from '../components/UI/index.jsx';
import { BedDouble, RefreshCw, Layers } from 'lucide-react';

const ESTADO_KEYS = Object.keys(ESTADOS);

export default function RecepcionGeneral() {
  const { habitaciones, categorias, ubicaciones, tarifas, cambiarEstado } = useHotel();
  const [fUbicacion, setFUbicacion] = useState('');
  const [fEstado,    setFEstado]    = useState('');
  const [busqueda,   setBusqueda]   = useState('');

  const filtered = habitaciones.filter(h => {
    const mU = !fUbicacion || String(h.ubicacionId) === fUbicacion;
    const mE = !fEstado    || h.estado === fEstado;
    const mB = !busqueda   || h.numero.toLowerCase().includes(busqueda.toLowerCase());
    return mU && mE && mB;
  });

  const stats = ESTADO_KEYS.reduce((acc, k) => {
    acc[k] = habitaciones.filter(h => h.estado === k).length;
    return acc;
  }, {});

  const cycleEstado = (id, current) => {
    const idx  = ESTADO_KEYS.indexOf(current);
    const next = ESTADO_KEYS[(idx + 1) % ESTADO_KEYS.length];
    cambiarEstado(id, next);
  };

  return (
    <div className="page-anim">
      {/* Stats row */}
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
          <div style={{ marginLeft:'auto', fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>
            {filtered.length} habitación{filtered.length!==1?'es':''} encontrada{filtered.length!==1?'s':''}
          </div>
        </div>
      </Card>

      {/* Grid */}
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
                {/* Color strip */}
                <div style={{ height:4, background:est.dot }} />

                <div style={{ padding:'14px 14px 10px' }}>
                  {/* Status badge + number */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <Badge label={est.label} color={est.color} bg={est.bg} border={est.border} dot={est.dot} />
                    <button
                      title="Cambiar estado"
                      onClick={() => cycleEstado(hab.id, hab.estado)}
                      style={{
                        width:24, height:24, borderRadius:'var(--r-sm)',
                        background:est.bg, border:`1px solid ${est.border}`,
                        display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                        color:est.color,
                      }}
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>

                  {/* Number */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <BedDouble size={20} color={est.dot} strokeWidth={1.5} />
                    <span style={{ fontSize:28, fontWeight:800, color:est.color, lineHeight:1 }}>{hab.numero}</span>
                  </div>

                  {/* Info */}
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
                </div>

                {/* Quick state selector */}
                <div style={{
                  borderTop:`1px solid ${est.border}`, padding:'8px 10px',
                  display:'flex', flexWrap:'wrap', gap:4, background:est.bg,
                }}>
                  {ESTADO_KEYS.filter(k=>k!==hab.estado).map(k=>(
                    <button
                      key={k}
                      onClick={()=>cambiarEstado(hab.id,k)}
                      style={{
                        fontSize:9, fontWeight:700, padding:'3px 7px',
                        borderRadius:'var(--r-full)', cursor:'pointer',
                        border:`1px solid ${ESTADOS[k].border}`,
                        background:ESTADOS[k].bg, color:ESTADOS[k].color,
                        letterSpacing:'.3px',
                      }}
                    >
                      {ESTADOS[k].label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
