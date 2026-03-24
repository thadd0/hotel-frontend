import { useLocation } from 'react-router-dom';
import { useHotel } from '../../context/HotelContext';
import { Menu, UserCircle2 } from 'lucide-react';

const TITLES = {
  '/':                 { title:'Vista General',         sub:'Recepción y estado de habitaciones' },
  '/habitaciones':     { title:'Habitaciones',           sub:'Gestión y registro de cuartos' },
  '/configuracion':    { title:'Configuración',          sub:'Tipos de habitación y alquiler' },
  '/tarifas':          { title:'Tarifas',                sub:'Precios por tipo de habitación y alquiler' },
  '/empresa':          { title:'Empresas',               sub:'Empresas registradas' },
  '/caja':             { title:'Caja',                   sub:'Ingresos y egresos' },
  '/clientes':         { title:'Clientes',               sub:'Lista de clientes registrados' },

  '/alquileres':       { title:'Alquileres',             sub:'Rentas activas e historial' },
  '/usuarios':         { title:'Usuarios',               sub:'Gestión de recepcionistas' },
  '/perfil':           { title:'Mi Perfil',              sub:'Datos de tu cuenta' },
};

export default function Header({ onMenuToggle, onUserToggle }) {
  const { pathname } = useLocation();
  const { userRole } = useHotel();
  const info = TITLES[pathname] ?? { title:'Hotel Admin', sub:'' };

  return (
    <header className="app-header">
      <div style={s.left}>
        <button className="menu-toggle" onClick={onMenuToggle} style={{
          border: 'none', background: 'none', cursor: 'pointer', padding: 6,
          color: 'var(--text-muted)', display: 'none',
        }}>
          <Menu size={20} />
        </button>
        <div>
          <h1 style={s.title}>{info.title}</h1>
          <p style={s.sub}>{info.sub}</p>
        </div>
      </div>

      <div className="header-actions" style={s.right}>
        <span style={s.roleBadge}>
          {userRole === 'admin' ? 'Administrador' : 'Recepcionista'}
        </span>
        <button
          type="button"
          style={s.iconBtn}
          onClick={onUserToggle}
          title="Abrir panel de usuario"
          aria-label="Abrir panel de usuario"
        >
          <UserCircle2 size={18} color="var(--text-muted)" />
        </button>
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
    gap: 8,
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
  roleBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    padding: '4px 10px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    userSelect: 'none',
  },
  iconBtn: {
    width:32, height:32, borderRadius:'var(--r-md)',
    border:'1px solid var(--border)', background:'transparent',
    display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
  },
};
