import { Navigate, Outlet } from 'react-router-dom';

// Ruta protegida que redirige al login si no hay token
export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
