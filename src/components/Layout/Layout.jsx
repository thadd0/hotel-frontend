import { useState } from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
