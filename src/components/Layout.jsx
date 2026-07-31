import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout principal con barra de navegación y zona de contenido
export default function Layout() {
  const { nombre, signOut } = useAuth();

  // Clase activa para los enlaces del menú
  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="logo">🌿 INVERNADEROCONTULMO</div>
        <div className="nav-links">
          <NavLink className={linkClass} to="/dashboard">Dashboard</NavLink>
          <NavLink className={linkClass} to="/productos">Productos</NavLink>
          <NavLink className={linkClass} to="/categorias">Categorías</NavLink>
          <NavLink className={linkClass} to="/proveedores">Proveedores</NavLink>
          <NavLink className={linkClass} to="/clientes">Clientes</NavLink>
          <NavLink className={linkClass} to="/ventas">Ventas</NavLink>
          <NavLink className={linkClass} to="/pedidos">Pedidos</NavLink>
          <NavLink className={linkClass} to="/compras">Compras</NavLink>
          <NavLink className={linkClass} to="/contabilidad">Contabilidad</NavLink>
        </div>
        <div className="nav-user">
          <span>{nombre}</span>
          <button className="btn btn-secondary btn-sm" onClick={signOut}>Cerrar Sesión</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
