import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card, Btn } from '../../components/UI/index.jsx';
import { Label } from '@radix-ui/react-label';
import { LogIn, Loader2 } from 'lucide-react';
import { login as apiLogin } from '../../auth/api';

export default function Login() {
  const { login } = useHotel();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dni.trim() || !password.trim()) {
      setError('Por favor, ingresa tu DNI y contraseña');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const authResponse = await apiLogin({ numDocumento: dni.trim(), password });
      login(authResponse);
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || 'Credenciales inválidas o servidor no disponible';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)',
    }}>
      <Card style={{ width: '100%', maxWidth: 400, padding: '32px', margin: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Iniciar Sesión
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '8px 0 0' }}>
            Accede al panel de administración del hotel
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <Label htmlFor="dni" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              DNI
            </Label>
            <input
              id="dni"
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="12345678"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                background: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Label htmlFor="password" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
              Contraseña
            </Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                background: 'var(--surface)',
                color: 'var(--text)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--red-light)', border: '1px solid var(--red)', borderRadius: 'var(--r-sm)', color: 'var(--red)', fontSize: 14 }}>
              {error}
            </div>
          )}

          <Btn type="submit" full icon={loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />} disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar Sesión'}
          </Btn>
        </form>
      </Card>
    </div>
  );
}