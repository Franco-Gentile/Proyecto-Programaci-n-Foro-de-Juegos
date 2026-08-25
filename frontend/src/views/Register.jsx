import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = register(username.trim(), email.trim(), password);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Unite a la comunidad y compartí con otros jugadores"
      error={error}
      footer={
        <>
          <span>¿Ya tenés cuenta? </span>
          <Link to="/login">Iniciar Sesión</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="username"
          label="Nombre de Usuario"
          value={username}
          onChange={setUsername}
          placeholder="Ej: MasterChief_117"
          autoComplete="username"
          required
        />

        <FormField
          id="email"
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="tu_email@ejemplo.com"
          autoComplete="email"
          required
        />

        <FormField
          id="password"
          label="Contraseña (mínimo 8 caracteres)"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Crea una clave segura"
          minLength={8}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          className="btn btn-auth-submit btn-auth-register-submit w-100 mt-2"
        >
          Completar Registro
        </button>
      </form>
    </AuthLayout>
  );
}

export default Register;
