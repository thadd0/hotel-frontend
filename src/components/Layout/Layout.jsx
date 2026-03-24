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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      {userSidebarOpen && (
        <div className="user-sidebar-overlay" onClick={() => setUserSidebarOpen(false)} />
      )}
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
