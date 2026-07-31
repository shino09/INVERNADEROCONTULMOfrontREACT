import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Página de gestión de compras
export default function Compras() {
  const [allData, setAllData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [detalles, setDetalles] = useState([{ productoId: '', cantidad: 1, precioUnitario: 0 }]);
  const table = useTable(allData);

  // Carga compras, productos y proveedores al iniciar
  useEffect(() => {
    apiGet('/compras').then(setAllData).catch(() => {});
    apiGet('/productos').then(setProductos).catch(() => {});
    apiGet('/proveedores').then(setProveedores).catch(() => {});
  }, []);

  // Valida que todos los campos requeridos estén completos
  function isValid() {
    setShowErrors(true);
    if (!proveedorId) return false;
    for (const d of detalles) { if (!d.productoId || Number(d.cantidad) < 1 || Number(d.precioUnitario) <= 0) return false; }
    return true;
  }

  // Abre el formulario para nueva compra
  function openForm() { setShowForm(true); setShowErrors(false); setErrorMsg(''); setProveedorId(''); setDetalles([{ productoId: '', cantidad: 1, precioUnitario: 0 }]); }
  // Cierra el formulario sin guardar
  function cancelForm() { setShowForm(false); setShowErrors(false); setErrorMsg(''); }
  // Agrega una línea de detalle a la compra
  function addDetalle() { setDetalles([...detalles, { productoId: '', cantidad: 1, precioUnitario: 0 }]); }

  // Guarda la compra con sus detalles
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      const prov = proveedores.find(p => p.id === Number(proveedorId));
      await apiPost('/compras', {
        proveedor: prov?.nombre || '',
        detalles: detalles.map(d => ({ productoId: Number(d.productoId), cantidad: Number(d.cantidad), precioUnitario: Number(d.precioUnitario) }))
      });
      setAllData(await apiGet('/compras')); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  return (
    <>
      <h1>Compras</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar compra o proveedor..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nueva Compra</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="form-group"><label>Proveedor</label>
            <select className="form-control" value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
              <option value="">-- Seleccione --</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre} - {p.rut}</option>)}
            </select>
            {showErrors && !proveedorId && <small className="error">Seleccione un proveedor</small>}
          </div>
          <h4>Detalles</h4>
          {detalles.map((d, i) => (
            <div className="grid-3" key={i}>
              <div className="form-group"><label>Producto</label>
                <select className="form-control" value={d.productoId} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, productoId: e.target.value }; setDetalles(nd); }}>
                  <option value="">-- Seleccione --</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                {showErrors && !d.productoId && <small className="error">Seleccione un producto</small>}
              </div>
              <div className="form-group"><label>Cantidad</label>
                <input className="form-control" type="number" min="1" value={d.cantidad} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, cantidad: e.target.value }; setDetalles(nd); }} /></div>
              <div className="form-group"><label>P.Unitario</label>
                <input className="form-control" type="number" min="0.01" step="0.01" value={d.precioUnitario} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, precioUnitario: e.target.value }; setDetalles(nd); }} /></div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addDetalle}>+ Agregar</button>
          <br /><br /><button className="btn btn-primary" onClick={save}>Guardar</button>
          <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={cancelForm}>Cancelar</button>
        </div>
      )}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th onClick={() => table.sortBy('numeroCompra')}>N° Compra {table.sortIcon('numeroCompra')}</th>
              <th onClick={() => table.sortBy('proveedor')}>Proveedor {table.sortIcon('proveedor')}</th>
              <th onClick={() => table.sortBy('total')}>Total {table.sortIcon('total')}</th>
              <th onClick={() => table.sortBy('fechaCompra')}>Fecha {table.sortIcon('fechaCompra')}</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(c => (
                <tr key={c.id}>
                  <td>{c.numeroCompra}</td><td>{c.proveedor}</td><td>S/ {c.total}</td>
                  <td>{c.fechaCompra ? new Date(c.fechaCompra).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination table={table} />
      </div>
    </>
  );
}

