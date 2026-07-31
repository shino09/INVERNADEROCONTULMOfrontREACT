import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/apiService';

const AuthContext = createContext();

// Proveedor de autenticación que gestiona el token JWT y el rol del usuario
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [rol, setRol] = useState(() => localStorage.getItem('rol') || '');
  const [nombre, setNombre] = useState(() => localStorage.getItem('nombre') || '');
  const navigate = useNavigate();

  // Autentica al usuario con email y contraseña
  async function signIn(email, password) {
    const res = await apiLogin({ email, password });
    localStorage.setItem('token', res.token);
    localStorage.setItem('rol', res.rol);
    localStorage.setItem('nombre', res.nombre);
    setToken(res.token);
    setRol(res.rol);
    setNombre(res.nombre);
    navigate('/dashboard');
  }

  // Cierra la sesión y limpia los datos del usuario
  function signOut() {
    localStorage.clear();
    setToken('');
    setRol('');
    setNombre('');
    navigate('/login');
  }

  // Verifica si el usuario tiene una sesión activa
  const isLoggedIn = () => !!token;

  // Al iniciar, si no hay token redirige al login
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/login');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ token, rol, nombre, signIn, signOut, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para acceder al contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}
