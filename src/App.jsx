import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TooltipProvider } from './components/UI/index.jsx';
import Layout        from './components/Layout/Layout.jsx';
import RecepcionGeneral from './pages/RecepcionGeneral.jsx';
import Habitaciones  from './pages/Habitaciones.jsx';
import Categorias    from './pages/Categorias.jsx';
import Ubicaciones   from './pages/Ubicaciones.jsx';
import Tarifas       from './pages/Tarifas.jsx';
import Sucursales    from './pages/Sucursales.jsx';
import Login         from './pages/Login.jsx';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  return token ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index               element={<RecepcionGeneral />} />
                <Route path="habitaciones" element={<Habitaciones />} />
                <Route path="categorias"   element={<Categorias />} />
                <Route path="ubicaciones"  element={<Ubicaciones />} />
                <Route path="tarifas"      element={<Tarifas />} />
                <Route path="sucursales"   element={<Sucursales />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HotelProvider>
    </AuthProvider>
  );
}
