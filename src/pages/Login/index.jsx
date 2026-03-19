import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card, Btn } from '../../components/UI/index.jsx';
import { Label } from '@radix-ui/react-label';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useHotel();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dni.trim() || !password.trim()) {
      setError('Por favor, ingresa tu DNI y contraseña');
      return;
    }
    // Simple mock auth
    login();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)',
    }}>
      <Card style={{ width: 400, padding: '32px' }}>
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

          <Btn type="submit" full icon={<LogIn size={16} />}>
            Iniciar Sesión
          </Btn>
        </form>
      </Card>
    </div>
  );
}