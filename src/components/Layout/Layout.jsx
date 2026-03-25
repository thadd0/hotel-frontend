import { useState } from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';
import UserSidebar from './UserSidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSidebarOpen, setUserSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay solo para sidebar */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Eliminado overlay para userSidebar (dropdown de perfil) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <UserSidebar open={userSidebarOpen} onClose={() => setUserSidebarOpen(false)} />
      <div className="app-main">
        <Header
          onMenuToggle={() => setSidebarOpen(o => !o)}
          onUserToggle={() => setUserSidebarOpen((o) => !o)}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
