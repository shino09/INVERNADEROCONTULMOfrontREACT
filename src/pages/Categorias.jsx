import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Página de gestión de categorías
export default function Categorias() {
  const [allData, setAllData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable(allData);

  // Carga las categorías al iniciar
  useEffect(() => { apiGet('/categorias').then(setAllData).catch(() => {}); }, []);

  // Valida que el nombre esté presente
  function isValid() { setShowErrors(true); return !!editItem.nombre; }

  // Abre el formulario para nuevo registro
  function openForm() { setShowForm(true); setShowErrors(false); setErrorMsg(''); setIsEditing(false); setEditItem({}); }
  // Cierra el formulario sin guardar
  function cancelForm() { setShowForm(false); setShowErrors(false); setErrorMsg(''); setIsEditing(false); setEditItem({}); }
  // Carga un registro en el formulario para editar
  function edit(c) { setEditItem({ ...c }); setShowForm(true); setIsEditing(true); setShowErrors(false); }

  // Guarda o actualiza una categoría
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      if (isEditing) await apiPut(`/categorias/${editItem.id}`, editItem);
      else await apiPost('/categorias', editItem);
      setAllData(await apiGet('/categorias')); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  // Elimina una categoría tras confirmación
  async function deleteRow(id) {
    if (confirm('¿Eliminar categoría?')) {
      await apiDelete(`/categorias/${id}`);
      setAllData(await apiGet('/categorias'));
    }
  }

  return (
    <>
      <h1>Categorías</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar categoría..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nueva Categoría</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="form-group"><label>Nombre</label>
            <input className="form-control" value={editItem.nombre || ''} onChange={e => setEditItem({ ...editItem, nombre: e.target.value })} />
            {showErrors && !editItem.nombre && <small className="error">Requerido</small>}
          </div>
          <div className="form-group"><label>Descripción</label>
            <input className="form-control" value={editItem.descripcion || ''} onChange={e => setEditItem({ ...editItem, descripcion: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={save}>{isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={cancelForm}>Cancelar</button>
        </div>
      )}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th onClick={() => table.sortBy('nombre')}>Nombre {table.sortIcon('nombre')}</th>
              <th onClick={() => table.sortBy('descripcion')}>Descripción {table.sortIcon('descripcion')}</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td><td>{c.descripcion}</td>
                  <td className="actions">
                    <button className="btn btn-warning btn-sm" onClick={() => edit(c)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteRow(c.id)}>Eliminar</button>
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

