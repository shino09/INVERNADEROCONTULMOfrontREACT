import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../api/apiService";

// Panel principal con indicadores del negocio
export default function Dashboard() {
  const { nombre } = useAuth();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);

  // Carga los indicadores del dashboard al iniciar
  useEffect(() => {
    apiGet("/productos")
      .then(setProductos)
      .catch(() => {});
    apiGet("/clientes")
      .then(setClientes)
      .catch(() => {});
    apiGet("/ventas")
      .then(setVentas)
      .catch(() => {});
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <p>Bienvenido, {nombre}</p>
      <div className="grid-3" style={{ marginTop: 20 }}>
        <div className="card">
          <h3>Productos</h3>
          <p className="stat">{productos.length}</p>
        </div>
        <div className="card">
          <h3>Clientes</h3>
          <p className="stat">{clientes.length}</p>
        </div>
        <div className="card">
          <h3>Ventas</h3>
          <p className="stat">{ventas.length}</p>
        </div>
      </div>
    </>
  );
}
