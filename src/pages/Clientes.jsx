import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Valida formato de email
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
// Valida formato de teléfono chileno
function isValidPhone(phone) { return /^(\+56\s?)?9\s?\d{4}\s?\d{4}$/.test((phone || '').trim()) || phone === ''; }

// Página de gestión de clientes
export default function Clientes() {
  const [allData, setAllData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable(allData);

  // Carga los clientes al iniciar
  useEffect(() => { apiGet('/clientes').then(setAllData).catch(() => {}); }, []);

  // Valida campos requeridos y formatos
  function isValid() {
    setShowErrors(true);
    if (!editItem.nombre) return false;
    if (editItem.email && !isValidEmail(editItem.email)) return false;
    if (editItem.telefono && !isValidPhone(editItem.telefono)) return false;
    return true;
  }

  // Abre el formulario para nuevo registro
  function openForm() { setShowForm(true); setShowErrors(false); setErrorMsg(''); setIsEditing(false); setEditItem({}); }
  // Cierra el formulario sin guardar
  function cancelForm() { setShowForm(false); setShowErrors(false); setErrorMsg(''); setIsEditing(false); setEditItem({}); }
  // Carga un registro en el formulario para editar
  function edit(c) { setEditItem({ ...c }); setShowForm(true); setIsEditing(true); setShowErrors(false); }

  // Guarda o actualiza un cliente
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      if (isEditing) await apiPut(`/clientes/${editItem.id}`, editItem);
      else await apiPost('/clientes', editItem);
      setAllData(await apiGet('/clientes')); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  // Elimina un cliente tras confirmación
  async function deleteRow(id) {
    if (confirm('¿Eliminar cliente?')) {
      await apiDelete(`/clientes/${id}`);
      setAllData(await apiGet('/clientes'));
    }
  }

  return (
    <>
      <h1>Clientes</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar cliente..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nuevo Cliente</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="grid-2">
            <div className="form-group"><label>Nombre</label>
              <input className="form-control" value={editItem.nombre || ''} onChange={e => setEditItem({ ...editItem, nombre: e.target.value })} />
              {showErrors && !editItem.nombre && <small className="error">Requerido</small>}
            </div>
            <div className="form-group"><label>Documento</label>
              <input className="form-control" placeholder="RUT: XX.XXX.XXX-X" value={editItem.documento || ''} onChange={e => setEditItem({ ...editItem, documento: e.target.value })} /></div>
            <div className="form-group"><label>Email</label>
              <input className="form-control" type="email" placeholder="ejemplo@correo.cl" value={editItem.email || ''} onChange={e => setEditItem({ ...editItem, email: e.target.value })} />
              {showErrors && editItem.email && !isValidEmail(editItem.email) && <small className="error">Email inválido</small>}
            </div>
            <div className="form-group"><label>Teléfono</label>
              <input className="form-control" type="tel" placeholder="+56 9 XXXX XXXX" value={editItem.telefono || ''} onChange={e => setEditItem({ ...editItem, telefono: e.target.value })} />
              {showErrors && editItem.telefono && !isValidPhone(editItem.telefono) && <small className="error">Teléfono inválido</small>}
            </div>
          </div>
          <div className="form-group"><label>Dirección</label>
            <input className="form-control" value={editItem.direccion || ''} onChange={e => setEditItem({ ...editItem, direccion: e.target.value })} /></div>
          <button className="btn btn-primary" onClick={save}>{isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={cancelForm}>Cancelar</button>
        </div>
      )}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th onClick={() => table.sortBy('nombre')}>Nombre {table.sortIcon('nombre')}</th>
              <th onClick={() => table.sortBy('documento')}>Documento {table.sortIcon('documento')}</th>
              <th onClick={() => table.sortBy('email')}>Email {table.sortIcon('email')}</th>
              <th onClick={() => table.sortBy('telefono')}>Teléfono {table.sortIcon('telefono')}</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td><td>{c.documento}</td><td>{c.email}</td><td>{c.telefono}</td>
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

