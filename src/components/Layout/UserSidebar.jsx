import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, UserCog, X } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

export default function UserSidebar({ open, onClose }) {
  const { userRole, logout } = useHotel();
  const { pathname } = useLocation();

  const navItems = userRole === 'admin'
    ? [
        { to: '/usuarios', label: 'Usuarios', sub: 'Gestion de recepcionistas', icon: UserCog },
        { to: '/perfil', label: 'Mi Perfil', sub: 'Datos de tu cuenta', icon: User },
      ]
    : [
        { to: '/perfil', label: 'Mi Perfil', sub: 'Datos de tu cuenta', icon: User },
      ];

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <aside className={`user-sidebar${open ? ' user-sidebar--open' : ''}`}>
      <div className="user-sidebar-head">
        <div>
          <p className="user-sidebar-eyebrow">Cuenta</p>
          <h3 className="user-sidebar-title">Panel de usuario</h3>
        </div>
        <button type="button" className="user-sidebar-close" onClick={onClose} aria-label="Cerrar panel de usuario">
          <X size={18} />
        </button>
      </div>

      <div className="user-sidebar-role">
        {userRole === 'admin' ? 'Administrador' : 'Recepcionista'}
      </div>

      <button type="button" className="user-sidebar-bell" aria-label="Notificaciones">
        <Bell size={16} />
        Notificaciones
      </button>

      <nav className="user-sidebar-nav">
        {navItems.map(({ to, label, sub, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`user-sidebar-item${active ? ' active' : ''}`}
            >
              <span className="user-sidebar-item-icon">
                <Icon size={15} />
              </span>
              <span>
                <span className="user-sidebar-item-title">{label}</span>
                <span className="user-sidebar-item-sub">{sub}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <button type="button" className="user-sidebar-logout" onClick={logout}>
        <LogOut size={15} />
        Cerrar sesion
      </button>
    </aside>
  );
}
