import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Valida formato de email
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
// Valida formato de teléfono chileno
function isValidPhone(phone) { return /^(\+56\s?)?9\s?\d{4}\s?\d{4}$/.test((phone || '').trim()) || phone === ''; }

// Página de gestión de proveedores
export default function Proveedores() {
  const [allData, setAllData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const table = useTable(allData);

  // Carga los proveedores al iniciar
  useEffect(() => { apiGet('/proveedores').then(setAllData).catch(() => {}); }, []);

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
  function edit(p) { setEditItem({ ...p }); setShowForm(true); setIsEditing(true); setShowErrors(false); }

  // Guarda o actualiza un proveedor
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      if (isEditing) await apiPut(`/proveedores/${editItem.id}`, editItem);
      else await apiPost('/proveedores', editItem);
      setAllData(await apiGet('/proveedores')); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  // Elimina un proveedor tras confirmación
  async function deleteRow(id) {
    if (confirm('¿Eliminar proveedor?')) {
      await apiDelete(`/proveedores/${id}`);
      setAllData(await apiGet('/proveedores'));
    }
  }

  return (
    <>
      <h1>Proveedores</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar proveedor..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nuevo Proveedor</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="grid-2">
            <div className="form-group"><label>Nombre</label>
              <input className="form-control" value={editItem.nombre || ''} onChange={e => setEditItem({ ...editItem, nombre: e.target.value })} />
              {showErrors && !editItem.nombre && <small className="error">Requerido</small>}
            </div>
            <div className="form-group"><label>RUT</label>
              <input className="form-control" placeholder="XX.XXX.XXX-X" value={editItem.rut || ''} onChange={e => setEditItem({ ...editItem, rut: e.target.value })} /></div>
            <div className="form-group"><label>Email</label>
              <input className="form-control" type="email" placeholder="ejemplo@correo.cl" value={editItem.email || ''} onChange={e => setEditItem({ ...editItem, email: e.target.value })} />
              {showErrors && editItem.email && !isValidEmail(editItem.email) && <small className="error">Email inválido</small>}
            </div>
            <div className="form-group"><label>Teléfono</label>
              <input className="form-control" type="tel" placeholder="+56 9 XXXX XXXX" value={editItem.telefono || ''} onChange={e => setEditItem({ ...editItem, telefono: e.target.value })} />
              {showErrors && editItem.telefono && !isValidPhone(editItem.telefono) && <small className="error">Teléfono inválido</small>}
            </div>
            <div className="form-group"><label>Dirección</label>
              <input className="form-control" value={editItem.direccion || ''} onChange={e => setEditItem({ ...editItem, direccion: e.target.value })} /></div>
            <div className="form-group"><label>Contacto</label>
              <input className="form-control" value={editItem.contacto || ''} onChange={e => setEditItem({ ...editItem, contacto: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" onClick={save}>{isEditing ? 'Actualizar' : 'Guardar'}</button>
          <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={cancelForm}>Cancelar</button>
        </div>
      )}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th onClick={() => table.sortBy('nombre')}>Nombre {table.sortIcon('nombre')}</th>
              <th onClick={() => table.sortBy('rut')}>RUT {table.sortIcon('rut')}</th>
              <th onClick={() => table.sortBy('email')}>Email {table.sortIcon('email')}</th>
              <th onClick={() => table.sortBy('telefono')}>Teléfono {table.sortIcon('telefono')}</th>
              <th onClick={() => table.sortBy('contacto')}>Contacto {table.sortIcon('contacto')}</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td><td>{p.rut}</td><td>{p.email}</td><td>{p.telefono}</td><td>{p.contacto}</td>
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

