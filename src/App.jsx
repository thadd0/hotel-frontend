import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HotelProvider, useHotel } from './context/HotelContext';
import { TooltipProvider } from './components/UI/index.jsx';
import Layout        from './components/Layout/Layout.jsx';
import Login         from './pages/Login';
import RecepcionGeneral from './pages/RecepcionGeneral';
import Habitaciones  from './pages/Habitaciones';
import Categorias    from './pages/Categorias';
import Ubicaciones   from './pages/Ubicaciones';
import Tarifas       from './pages/Tarifas';
import Sucursales    from './pages/Sucursales';

function AppContent() {
  const { isLoggedIn } = useHotel();

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index               element={<RecepcionGeneral />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="categorias"   element={<Categorias />} />
          <Route path="ubicaciones"  element={<Ubicaciones />} />
          <Route path="tarifas"      element={<Tarifas />} />
          <Route path="sucursales"   element={<Sucursales />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <HotelProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </HotelProvider>
  );
}
