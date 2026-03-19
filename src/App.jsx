import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import { TooltipProvider } from './components/UI/index.jsx';
import Layout        from './components/Layout/Layout.jsx';
import RecepcionGeneral from './pages/RecepcionGeneral.jsx';
import Habitaciones  from './pages/Habitaciones.jsx';
import Categorias    from './pages/Categorias.jsx';
import Ubicaciones   from './pages/Ubicaciones.jsx';
import Tarifas       from './pages/Tarifas.jsx';
import Sucursales    from './pages/Sucursales.jsx';

export default function App() {
  return (
    <HotelProvider>
      <TooltipProvider>
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
      </TooltipProvider>
    </HotelProvider>
  );
}
