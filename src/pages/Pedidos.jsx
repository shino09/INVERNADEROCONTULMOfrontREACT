import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Página de gestión de pedidos
export default function Pedidos() {
  const [allData, setAllData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [detalles, setDetalles] = useState([{ productoId: '', cantidad: 1 }]);
  const table = useTable(allData.map(p => ({ ...p, clienteNombre: p.cliente?.nombre || '' })));

  // Carga pedidos, productos y clientes al iniciar
  useEffect(() => {
    apiGet('/pedidos').then(setAllData).catch(() => {});
    apiGet('/productos').then(setProductos).catch(() => {});
    apiGet('/clientes').then(setClientes).catch(() => {});
  }, []);

  // Valida que todos los campos requeridos estén completos
  function isValid() {
    setShowErrors(true);
    if (!clienteId) return false;
    for (const d of detalles) { if (!d.productoId || Number(d.cantidad) < 1) return false; }
    return true;
  }

  // Abre el formulario para nuevo pedido
  function openForm() { setShowForm(true); setShowErrors(false); setErrorMsg(''); setClienteId(''); setDetalles([{ productoId: '', cantidad: 1 }]); }
  // Cierra el formulario sin guardar
  function cancelForm() { setShowForm(false); setShowErrors(false); setErrorMsg(''); }
  // Agrega una línea de detalle al pedido
  function addDetalle() { setDetalles([...detalles, { productoId: '', cantidad: 1 }]); }

  // Guarda el pedido en la base de datos
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      await apiPost('/pedidos', { clienteId: Number(clienteId), detalles: detalles.map(d => ({ productoId: Number(d.productoId), cantidad: Number(d.cantidad) })) });
      setAllData(await apiGet('/pedidos')); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  // Actualiza el estado de un pedido (Aprobado/Entregado)
  async function updateEstado(id, estado) {
    try {
      await apiPut(`/pedidos/${id}/estado`, estado);
      setAllData(await apiGet('/pedidos'));
    } catch (e) { setErrorMsg(e.message); }
  }

  return (
    <>
      <h1>Pedidos</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar pedido o cliente..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nuevo Pedido</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="form-group"><label>Cliente</label>
            <select className="form-control" value={clienteId} onChange={e => setClienteId(e.target.value)}>
              <option value="">-- Seleccione --</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {showErrors && !clienteId && <small className="error">Seleccione un cliente</small>}
          </div>
          <h4>Detalles</h4>
          {detalles.map((d, i) => (
            <div className="grid-2" key={i}>
              <div className="form-group"><label>Producto</label>
                <select className="form-control" value={d.productoId} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, productoId: e.target.value }; setDetalles(nd); }}>
                  <option value="">-- Seleccione --</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                {showErrors && !d.productoId && <small className="error">Seleccione un producto</small>}
              </div>
              <div className="form-group"><label>Cantidad</label>
                <input className="form-control" type="number" min="1" value={d.cantidad} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, cantidad: e.target.value }; setDetalles(nd); }} /></div>
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
              <th onClick={() => table.sortBy('numeroPedido')}>N° Pedido {table.sortIcon('numeroPedido')}</th>
              <th onClick={() => table.sortBy('clienteNombre')}>Cliente {table.sortIcon('clienteNombre')}</th>
              <th onClick={() => table.sortBy('estado')}>Estado {table.sortIcon('estado')}</th>
              <th onClick={() => table.sortBy('total')}>Total {table.sortIcon('total')}</th>
              <th onClick={() => table.sortBy('fechaPedido')}>Fecha {table.sortIcon('fechaPedido')}</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(p => (
                <tr key={p.id}>
                  <td>{p.numeroPedido}</td><td>{p.cliente?.nombre}</td><td>{p.estado}</td><td>S/ {p.total}</td>
                  <td>{p.fechaPedido ? new Date(p.fechaPedido).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</td>
                  <td className="actions">
                    {p.estado === 'Pendiente' && <button className="btn btn-primary btn-sm" onClick={() => updateEstado(p.id, 'Aprobado')}>Aprobar</button>}
                    {p.estado === 'Aprobado' && <button className="btn btn-warning btn-sm" onClick={() => updateEstado(p.id, 'Entregado')}>Entregar</button>}
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

