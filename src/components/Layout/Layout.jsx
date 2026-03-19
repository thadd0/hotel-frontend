import Sidebar from './Sidebar';
import Header  from './Header';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Header />
        <main style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
