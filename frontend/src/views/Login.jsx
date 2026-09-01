import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username.trim(), password.trim());
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Ingresá tus credenciales para acceder a la comunidad"
      error={error}
      footer={
        <>
          <span>¿No tenés cuenta? </span>
          <Link to="/register">Registrate acá</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="username"
          label="Usuario"
          value={username}
          onChange={setUsername}
          placeholder="Ej: gamer_pro"
          autoComplete="username"
          required
        />

        <FormField
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Tu contraseña secreta"
          autoComplete="current-password"
          required
        />

        <button type="submit" className="btn btn-auth-submit w-100 mt-2">
          Entrar al Foro
        </button>
      </form>
    </AuthLayout>
  );
}

export default Login;
