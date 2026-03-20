import { useLocation } from 'react-router-dom';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, Building2, Bell, CircleUser } from 'lucide-react';

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
  const { sucursales, sucursalActiva, setSucursalActiva } = useHotel();
  const { logout, user } = useAuth();
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
        {/* Selección Radix para sucursal */}
        <Select.Root value={String(sucursalActiva)} onValueChange={v=>setSucursalActiva(Number(v))}>
          <Select.Trigger style={s.branchTrigger} aria-label="Sucursal">
            <Building2 size={14} color="var(--accent)" />
            <Select.Value />
            <ChevronDown size={13} color="var(--text-muted)" style={{ marginLeft:'auto' }} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content data-radix-select-content position="popper" sideOffset={6}>
              <Select.Viewport style={{ padding:4 }}>
                {sucursales.map(s2=>(
                  <Select.Item key={s2.id} value={String(s2.id)} data-radix-select-item>
                    <Select.ItemIndicator style={{ marginLeft:'auto', paddingLeft:8 }}>
                      <Check size={12} />
                    </Select.ItemIndicator>
                    <Select.ItemText>{s2.nombre}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* Campana */}
        <button style={s.iconBtn}>
          <Bell size={16} color="var(--text-muted)" />
        </button>

        {/* Avatar */}
        <div style={s.avatar}>
          <CircleUser size={18} color="var(--accent)" />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {user ? <span style={{ fontSize:12, color:'var(--text-muted)' }}>{user.nombre}</span> : null}
          <button onClick={logout} style={s.logoutBtn}>Salir</button>
        </div>
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
  logoutBtn: {
    border:'1px solid var(--border)',
    background:'var(--danger-light)',
    color:'var(--danger)',
    borderRadius:'6px',
    padding:'6px 10px',
    cursor:'pointer',
    fontWeight:600,
  },
  branchTrigger: {    display:'inline-flex', alignItems:'center', gap:7,
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
  avatar: {
    width:32, height:32, borderRadius:'var(--r-md)',
    background:'var(--accent-light)', border:'1px solid var(--accent-mid)',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
};
