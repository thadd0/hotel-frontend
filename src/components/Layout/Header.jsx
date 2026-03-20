import { useLocation } from 'react-router-dom';
import { useHotel } from '../../context/HotelContext';
import { Btn } from '../UI/index.jsx';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, Building2, Bell, LogOut } from 'lucide-react';

const TITLES = {
  '/':             { title:'Vista General',       sub:'Recepción y estado de habitaciones' },
  '/habitaciones': { title:'Habitaciones',         sub:'Gestión y registro de cuartos' },
  '/categorias':   { title:'Categorías',           sub:'Tipos de habitación' },
  '/ubicaciones':  { title:'Ubicaciones',          sub:'Pisos y zonas del hotel' },
  '/tarifas':      { title:'Tarifas',              sub:'Precios y tarifas por habitación' },
  '/sucursales':   { title:'Sucursales',           sub:'Gestión de oficinas y sedes' },
};

export default function Header() {
  const { pathname } = useLocation();
  const { sucursales, sucursalActiva, setSucursalActiva, logout, userRole } = useHotel();
  const info = TITLES[pathname] ?? { title:'Hotel Admin', sub:'' };

  return (
    <header style={s.root}>
      <div style={s.left}>
        <div>
          <h1 style={s.title}>{info.title}</h1>
          <p style={s.sub}>{info.sub}</p>
        </div>
      </div>

      <div style={s.right}>
        {/* Role Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: userRole === 'admin' ? 'var(--purple-light)' : 'var(--green-light)',
          borderRadius: 'var(--r-md)',
          border: `1px solid ${userRole === 'admin' ? 'var(--purple)' : 'var(--green)'}`,
          fontSize: 12,
          fontWeight: 700,
          color: userRole === 'admin' ? 'var(--purple)' : 'var(--green)',
        }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {userRole === 'admin' ? 'Administración' : 'Recepción'}
          </span>
        </div>

        {/* Campana */}
        <button style={s.iconBtn}>
          <Bell size={16} color="var(--text-muted)" />
        </button>

        {/* Cerrar Sesión */}
        <Btn variant="ghost" size="sm" icon={<LogOut size={14} />} onClick={logout}>
          Cerrar Sesión
        </Btn>
      </div>
    </header>
  );
}

const s = {
  root: {
    height:58, background:'var(--surface)',
    borderBottom:'1px solid var(--border)',
    display:'flex', alignItems:'center',
    justifyContent:'space-between', padding:'0 24px',
    position:'sticky', top:0, zIndex:100,
  },
  left: { display:'flex', alignItems:'center', gap:12 },
  title: { fontSize:16, fontWeight:700, color:'var(--text)', letterSpacing:'-0.3px', lineHeight:1.2 },
  sub:   { fontSize:11, color:'var(--text-xmuted)', marginTop:1 },
  right: { display:'flex', alignItems:'center', gap:8 },
  branchTrigger: {
    display:'inline-flex', alignItems:'center', gap:7,
    padding:'6px 11px', borderRadius:'var(--r-md)', cursor:'pointer',
    border:'1px solid var(--accent-mid)', background:'var(--accent-light)',
    fontSize:'12.5px', color:'var(--accent-dark)', fontFamily:'inherit',
    fontWeight:600, outline:'none', minWidth:150,
  },
  iconBtn: {
    width:32, height:32, borderRadius:'var(--r-md)',
    border:'1px solid var(--border)', background:'transparent',
    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
  },
};
