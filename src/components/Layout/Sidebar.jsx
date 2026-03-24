import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BedDouble, DollarSign, Hotel, Users, Building2, Settings, ClipboardList, UserCog, User, X } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export default function Sidebar({ open, onClose }) {
  const { userRole } = useHotel();
  const { pathname } = useLocation();

  const NAV_ADMIN = [
    { to:'/',                  icon:LayoutDashboard, label:'Recepción',         sub:'Vista general' },
    { to:'/caja',              icon:DollarSign,      label:'Caja',              sub:'Ingresos/Egresos' },
    { to:'/alquileres',        icon:ClipboardList,   label:'Alquileres',        sub:'Rentas activas' },
    { to:'/habitaciones',      icon:BedDouble,       label:'Habitaciones',      sub:'Gestión de cuartos' },
    { to:'/configuracion',     icon:Settings,        label:'Configuración',     sub:'Tipos hab. y alquiler' },
    { to:'/tarifas',           icon:DollarSign,      label:'Tarifas',           sub:'Precios' },
    { to:'/empresa',           icon:Building2,       label:'Empresas',          sub:'Empresas registradas' },
    { to:'/clientes',          icon:Users,           label:'Clientes',          sub:'Lista completa' },
    { to:'/usuarios',          icon:UserCog,         label:'Usuarios',          sub:'Recepcionistas' },
    { to:'/perfil',            icon:User,            label:'Mi Perfil',         sub:'Datos personales' },
  ];

  const NAV_RECEPCION = [
    { to:'/',             icon:LayoutDashboard, label:'Recepción',    sub:'Vista general' },
    { to:'/caja',         icon:DollarSign,      label:'Caja',         sub:'Ingresos/Egresos' },
    { to:'/alquileres',   icon:ClipboardList,   label:'Alquileres',   sub:'Rentas activas' },
    { to:'/habitaciones', icon:BedDouble,       label:'Habitaciones', sub:'Estado cuartos' },
    { to:'/clientes',     icon:Users,           label:'Clientes',     sub:'Lista disponible' },
    { to:'/perfil',       icon:User,            label:'Mi Perfil',    sub:'Datos personales' },
  ];

  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  const NAV = userRole === 'admin' ? NAV_ADMIN : NAV_RECEPCION;
  return (
    <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
      {/* Logo + close button (mobile) */}
      <div style={s.logo}>
        <div style={s.logoMark}>
          <Hotel size={18} color="var(--accent)" strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={s.logoName}>HotelAdmin</div>
          <div style={s.logoTag}>Sistema de gestión</div>
        </div>
        <button className="sidebar-close" onClick={onClose} style={{
          border: 'none', background: 'none', cursor: 'pointer', padding: 4,
          color: 'var(--text-muted)', display: 'none',
        }}>
          <X size={18} />
        </button>
      </div>

      <div style={s.divider} />

      {/* Navegación */}
      <nav style={s.nav}>
        <p style={s.groupLabel}>MÓDULOS</p>
        {NAV.map(({ to, icon: Icon, label, sub }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              style={{
                ...s.item,
                background: active ? 'var(--side-active-bg)' : 'transparent',
              }}
            >
              <span style={{
                ...s.iconBox,
                background: active ? 'var(--accent)' : 'var(--surface-2)',
                color: active ? '#fff' : 'var(--text-muted)',
              }}>
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:'block', fontSize:12.5, fontWeight: active ? 700 : 500, color: active ? 'var(--accent-dark)' : 'var(--text-2)', lineHeight:1.2 }}>{label}</span>
                <span style={{ display:'block', fontSize:10, color:'var(--text-xmuted)', marginTop:1 }}>{sub}</span>
              </span>
              {active && (
                <span style={{
                  width:3, height:20, borderRadius:2,
                  background:'var(--accent)', flexShrink:0, marginLeft:4,
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const s = {
  logo: {
    display:'flex', alignItems:'center', gap:11,
    padding:'16px 16px 12px',
  },
  logoMark: {
    width:32, height:32, borderRadius:'var(--r-md)',
    background:'var(--accent-light)', border:'1px solid var(--accent-mid)',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  logoName: {
    fontSize:14, fontWeight:800, color:'var(--text)', letterSpacing:'-0.3px',
  },
  logoTag: {
    fontSize:10, color:'var(--text-xmuted)', marginTop:1,
  },
  divider: {
    height:1, background:'var(--border)', margin:'0 14px 8px',
  },
  nav: {
    flex:1, overflowY:'auto', padding:'0 8px 8px',
  },
  groupLabel: {
    fontSize:9, fontWeight:800, letterSpacing:'1.4px',
    color:'var(--text-xmuted)', padding:'4px 10px 6px',
    textTransform:'uppercase', margin:0,
  },
  item: {
    display:'flex', alignItems:'center', gap:8,
    padding:'6px 8px', borderRadius:'var(--r-md)',
    textDecoration:'none', marginBottom:1,
    transition:'background .12s ease',
  },
  itemActive: {
    background:'var(--side-active-bg)',
  },
  iconBox: {
    width:26, height:26, borderRadius:'var(--r-sm)',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0, transition:'all .15s ease',
  },
};

