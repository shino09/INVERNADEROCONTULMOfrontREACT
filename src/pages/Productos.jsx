import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Página de gestión de productos
export default function Productos() {
  const [allData, setAllData] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable(allData);

  // Carga productos y categorías al iniciar
  useEffect(() => {
    apiGet('/productos').then(setAllData).catch(() => {});
    apiGet('/categorias').then(setCategorias).catch(() => {});
  }, []);

  // Valida que los campos requeridos estén completos
  function isValid() {
    setShowErrors(true);
    return !!(editItem.nombre && editItem.categoria && Number(editItem.precioCompra) > 0 && Number(editItem.precioVenta) > 0);
  }

  // Abre el formulario para nuevo registro
  function openForm() {
    setShowForm(true); setShowErrors(false); setErrorMsg(''); setIsEditing(false); setEditItem({});
  }

  // Cierra el formulario sin guardar
  function cancelForm() {
    setShowForm(false); setShowErrors(false); setErrorMsg(''); setIsEditing(false); setEditItem({});
  }

  // Carga un registro en el formulario para editar
  function edit(p) { setEditItem({ ...p }); setShowForm(true); setIsEditing(true); setShowErrors(false); }

  // Guarda o actualiza un producto
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      if (isEditing) await apiPut(`/productos/${editItem.id}`, editItem);
      else await apiPost('/productos', editItem);
      const data = await apiGet('/productos');
      setAllData(data); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  // Elimina un producto tras confirmación
  async function deleteRow(id) {
    if (confirm('¿Eliminar producto?')) {
      await apiDelete(`/productos/${id}`);
      setAllData(await apiGet('/productos'));
    }
  }

  return (
    <>
      <h1>Productos</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar producto..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nuevo Producto</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="grid-2">
            <div className="form-group"><label>Nombre</label>
              <input className="form-control" value={editItem.nombre || ''} onChange={e => setEditItem({ ...editItem, nombre: e.target.value })} /></div>
            <div className="form-group"><label>Categoría</label>
              <select className="form-control" value={editItem.categoria || ''} onChange={e => setEditItem({ ...editItem, categoria: e.target.value })}>
                <option value="">-- Seleccione --</option>
                {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
              </select>
              {showErrors && !editItem.categoria && <small className="error">Seleccione una categoría</small>}
            </div>
            <div className="form-group"><label>Precio Compra</label>
              <input className="form-control" type="number" min="0" step="0.01" value={editItem.precioCompra || ''} onChange={e => setEditItem({ ...editItem, precioCompra: e.target.value })} /></div>
            <div className="form-group"><label>Precio Venta</label>
              <input className="form-control" type="number" min="0" step="0.01" value={editItem.precioVenta || ''} onChange={e => setEditItem({ ...editItem, precioVenta: e.target.value })} /></div>
            <div className="form-group"><label>Stock</label>
              <input className="form-control" type="number" min="0" value={editItem.stockActual || 0} onChange={e => setEditItem({ ...editItem, stockActual: e.target.value })} /></div>
            <div className="form-group"><label>Stock Mínimo</label>
              <input className="form-control" type="number" min="0" value={editItem.stockMinimo || 0} onChange={e => setEditItem({ ...editItem, stockMinimo: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Descripción</label>
            <input className="form-control" value={editItem.descripcion || ''} onChange={e => setEditItem({ ...editItem, descripcion: e.target.value })} /></div>
          {showErrors && (!editItem.nombre || !editItem.precioCompra || !editItem.precioVenta) && <small className="error">Complete los campos requeridos</small>}
          <br /><button className="btn btn-primary" onClick={save}>{isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={cancelForm}>Cancelar</button>
        </div>
      )}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th onClick={() => table.sortBy('nombre')}>Nombre {table.sortIcon('nombre')}</th>
              <th onClick={() => table.sortBy('categoria')}>Categoría {table.sortIcon('categoria')}</th>
              <th onClick={() => table.sortBy('precioCompra')}>P.Compra {table.sortIcon('precioCompra')}</th>
              <th onClick={() => table.sortBy('precioVenta')}>P.Venta {table.sortIcon('precioVenta')}</th>
              <th onClick={() => table.sortBy('stockActual')}>Stock {table.sortIcon('stockActual')}</th>
              <th onClick={() => table.sortBy('stockMinimo')}>Stock Min {table.sortIcon('stockMinimo')}</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td><td>{p.categoria}</td><td>S/ {p.precioCompra}</td><td>S/ {p.precioVenta}</td>
                  <td>{p.stockActual}</td><td>{p.stockMinimo}</td>
                  <td className="actions">
                    <button className="btn btn-warning btn-sm" onClick={() => edit(p)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteRow(p.id)}>Eliminar</button>
                  </td>
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

