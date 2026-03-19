import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BedDouble, Tag, MapPin, DollarSign, Building2, Hotel } from 'lucide-react';

const NAV = [
  { to:'/',             icon:LayoutDashboard, label:'Recepción',    sub:'Vista general' },
  { to:'/habitaciones', icon:BedDouble,       label:'Habitaciones', sub:'Gestión de cuartos' },
  { to:'/categorias',   icon:Tag,             label:'Categorías',   sub:'Tipos de habitación' },
  { to:'/ubicaciones',  icon:MapPin,          label:'Ubicaciones',  sub:'Pisos y zonas' },
  { to:'/tarifas',      icon:DollarSign,      label:'Tarifas',      sub:'Precios' },
  { to:'/sucursales',   icon:Building2,       label:'Sucursales',   sub:'Oficinas' },
];

export default function Sidebar() {
  return (
    <aside style={s.root}>
      {/* Logo */}
      <div style={s.logo}>
        <div style={s.logoMark}>
          <Hotel size={18} color="var(--accent)" strokeWidth={2} />
        </div>
        <div>
          <div style={s.logoName}>HotelAdmin</div>
          <div style={s.logoTag}>Sistema de gestión</div>
        </div>
      </div>

      <div style={s.divider} />

      {/* Nav */}
      <nav style={s.nav}>
        <p style={s.groupLabel}>MÓDULOS</p>
        {NAV.map(({ to, icon: Icon, label, sub }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...s.item,
              ...(isActive ? s.itemActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  ...s.iconBox,
                  background: isActive ? 'var(--accent)' : 'var(--surface-2)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                }}>
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:'block', fontSize:13.5, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--accent-dark)' : 'var(--text-2)', lineHeight:1.2 }}>{label}</span>
                  <span style={{ display:'block', fontSize:10.5, color:'var(--text-xmuted)', marginTop:1 }}>{sub}</span>
                </span>
                {isActive && (
                  <span style={{
                    width:3, height:20, borderRadius:2,
                    background:'var(--accent)', flexShrink:0, marginLeft:4,
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={s.footer}>
        <div style={s.footerCard}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)', marginBottom:2 }}>Hotel Admin v2.0</div>
          <div style={{ fontSize:10, color:'var(--text-xmuted)' }}>Frontend · React 19 + Radix UI</div>
        </div>
      </div>
    </aside>
  );
}

const s = {
  root: {
    width: 220,
    minWidth: 220,
    height: '100vh',
    background: 'var(--side-bg)',
    borderRight: '1px solid var(--side-border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
  },
  logo: {
    display:'flex', alignItems:'center', gap:11,
    padding:'20px 16px 16px',
  },
  logoMark: {
    width:36, height:36, borderRadius:'var(--r-md)',
    background:'var(--accent-light)', border:'1px solid var(--accent-mid)',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  logoName: {
    fontSize:14.5, fontWeight:800, color:'var(--text)', letterSpacing:'-0.3px',
  },
  logoTag: {
    fontSize:10.5, color:'var(--text-xmuted)', marginTop:1,
  },
  divider: {
    height:1, background:'var(--border)', margin:'0 14px 12px',
  },
  nav: {
    flex:1, overflowY:'auto', padding:'0 8px',
  },
  groupLabel: {
    fontSize:9.5, fontWeight:800, letterSpacing:'1.4px',
    color:'var(--text-xmuted)', padding:'6px 10px 8px',
    textTransform:'uppercase',
  },
  item: {
    display:'flex', alignItems:'center', gap:10,
    padding:'8px 10px', borderRadius:'var(--r-md)',
    textDecoration:'none', marginBottom:2,
    transition:'background .12s ease',
  },
  itemActive: {
    background:'var(--side-active-bg)',
  },
  iconBox: {
    width:28, height:28, borderRadius:'var(--r-sm)',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0, transition:'all .15s ease',
  },
  footer: {
    padding:'12px',
    borderTop:'1px solid var(--border)',
  },
  footerCard: {
    background:'var(--bg)', borderRadius:'var(--r-md)',
    border:'1px solid var(--border)', padding:'10px 12px',
  },
};
