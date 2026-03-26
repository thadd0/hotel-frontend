import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card, Btn } from '../../components/UI/index.jsx';
import { Label } from '@radix-ui/react-label';
import { LogIn, Loader2, Hotel } from 'lucide-react';
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
      background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg) 50%, var(--surface-2) 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative accent circle */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,134,12,.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,134,12,.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <Card style={{
        width: '100%', maxWidth: 400, padding: '36px 32px', margin: '0 16px',
        boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="Hospedaje ARROYO" style={{
            width: 80, height: 80, objectFit: 'contain', marginBottom: 14,
          }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline-flex'; }} />
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--r-lg)',
            background: 'var(--accent-light)', border: '1.5px solid var(--accent-mid)',
            display: 'none', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, margin: '0 auto 14px',
          }}>
            <Hotel size={24} color="var(--accent)" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.3px' }}>
            Hospedaje ARROYO
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>
            Ingresa tus credenciales para acceder al sistema
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
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,134,12,.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
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
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(212,134,12,.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: 'var(--red-bg)', border: '1px solid var(--red-border)',
              borderRadius: 'var(--r-md)', color: 'var(--red)',
              fontSize: 13, fontWeight: 500, lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          <Btn type="submit" full icon={loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />} disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar Sesión'}
          </Btn>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-xmuted)', marginTop: 24, marginBottom: 0 }}>
          Sistema de gestión hotelera v1.0
        </p>
      </Card>
    </div>
  );
}