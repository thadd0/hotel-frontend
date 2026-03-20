import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Btn, Field, inputStyle, inputFocus, inputBlur } from '../components/UI/index.jsx';

export default function Login() {
  const { login } = useAuth();
  const [numDocumento, setNumDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setError('');
    if (!numDocumento.trim() || !password.trim()) {
      setError('DNI y contraseña son obligatorios');
      return;
    }
    setLoading(true);
    try {
      await login(numDocumento.trim(), password);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#f4f5f7' }}>
      <div style={{ width:360, padding:24, borderRadius:12, background:'#fff', boxShadow:'0 12px 36px rgba(0,0,0,.08)' }}>
        <h2 style={{ marginBottom:18 }}>Iniciar sesión</h2>

        <Field label="DNI" required>
          <input
            style={inputStyle}
            value={numDocumento}
            onFocus={inputFocus}
            onBlur={inputBlur}
            onChange={e => setNumDocumento(e.target.value)}
            placeholder="Ej: 12345678"
          />
        </Field>

        <Field label="Contraseña" required>
          <input
            style={inputStyle}
            type="password"
            value={password}
            onFocus={inputFocus}
            onBlur={inputBlur}
            onChange={e => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />
        </Field>

        {error && <p style={{ color:'var(--danger)', marginTop:8 }}>{error}</p>}

        <Btn onClick={submit} disabled={loading} style={{ width:'100%', marginTop:12 }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Btn>
      </div>
    </div>
  );
}
