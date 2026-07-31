import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiGetPdf } from '../api/apiService';
import useTable, { Pagination } from '../hooks/useTable';

// Página de gestión de ventas
export default function Ventas() {
  const [allData, setAllData] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [newVenta, setNewVenta] = useState({ clienteId: '', metodoPago: 'Efectivo' });
  const [detalles, setDetalles] = useState([{ productoId: '', cantidad: 1 }]);
  const table = useTable(allData.map(v => ({ ...v, clienteNombre: v.cliente?.nombre || '' })));

  // Carga ventas, productos y clientes al iniciar
  useEffect(() => {
    apiGet('/ventas').then(setAllData).catch(() => {});
    apiGet('/productos').then(setProductos).catch(() => {});
    apiGet('/clientes').then(setClientes).catch(() => {});
  }, []);

  // Valida que todos los campos requeridos estén completos
  function isValid() {
    setShowErrors(true);
    if (!newVenta.clienteId) return false;
    for (const d of detalles) { if (!d.productoId || Number(d.cantidad) < 1) return false; }
    return true;
  }

  // Abre el formulario para nueva venta
  function openForm() { setShowForm(true); setShowErrors(false); setErrorMsg(''); setNewVenta({ clienteId: '', metodoPago: 'Efectivo' }); setDetalles([{ productoId: '', cantidad: 1 }]); }
  // Cierra el formulario sin guardar
  function cancelForm() { setShowForm(false); setShowErrors(false); setErrorMsg(''); }
  // Agrega una línea de detalle a la venta
  function addDetalle() { setDetalles([...detalles, { productoId: '', cantidad: 1 }]); }

  // Guarda la venta con sus detalles
  async function save() {
    if (!isValid()) return;
    setErrorMsg('');
    try {
      await apiPost('/ventas', {
        clienteId: Number(newVenta.clienteId),
        metodoPago: newVenta.metodoPago,
        detalles: detalles.map(d => ({ productoId: Number(d.productoId), cantidad: Number(d.cantidad) }))
      });
      setAllData(await apiGet('/ventas')); cancelForm();
    } catch (e) { setErrorMsg(e.message); }
  }

  // Descarga la factura de una venta en PDF
  function downloadFactura(id) { apiGetPdf(`/ventas/${id}/factura`).catch(e => setErrorMsg(e.message)); }

  return (
    <>
      <h1>Ventas</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="toolbar">
        <input className="search-box" type="text" value={table.searchText} onChange={e => table.onSearch(e.target.value)} placeholder="Buscar factura o cliente..." />
        <button className="btn btn-primary" onClick={openForm}>+ Nueva Venta</button>
      </div>
      {showForm && (
        <div className="card">
          <div className="grid-2">
            <div className="form-group"><label>Cliente</label>
              <select className="form-control" value={newVenta.clienteId} onChange={e => setNewVenta({ ...newVenta, clienteId: e.target.value })}>
                <option value="">-- Seleccione --</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {showErrors && !newVenta.clienteId && <small className="error">Seleccione un cliente</small>}
            </div>
            <div className="form-group"><label>Método Pago</label>
              <select className="form-control" value={newVenta.metodoPago} onChange={e => setNewVenta({ ...newVenta, metodoPago: e.target.value })}>
                <option value="Efectivo">Efectivo</option><option value="Tarjeta">Tarjeta</option><option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>
          <h4>Detalles</h4>
          {detalles.map((d, i) => (
            <div className="grid-2" key={i} style={{ alignItems: 'center' }}>
              <div className="form-group"><label>Producto</label>
                <select className="form-control" value={d.productoId} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, productoId: e.target.value }; setDetalles(nd); }}>
                  <option value="">-- Seleccione --</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} - S/{p.precioVenta}</option>)}
                </select>
                {showErrors && !d.productoId && <small className="error">Seleccione un producto</small>}
              </div>
              <div className="form-group"><label>Cantidad</label>
                <input className="form-control" type="number" min="1" value={d.cantidad} onChange={e => { const nd = [...detalles]; nd[i] = { ...d, cantidad: e.target.value }; setDetalles(nd); }} /></div>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addDetalle}>+ Agregar</button>
          <br /><br /><button className="btn btn-primary" onClick={save}>Guardar Venta</button>
          <button className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={cancelForm}>Cancelar</button>
        </div>
      )}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr>
              <th onClick={() => table.sortBy('numeroFactura')}>Factura {table.sortIcon('numeroFactura')}</th>
              <th onClick={() => table.sortBy('clienteNombre')}>Cliente {table.sortIcon('clienteNombre')}</th>
              <th onClick={() => table.sortBy('total')}>Total {table.sortIcon('total')}</th>
              <th onClick={() => table.sortBy('metodoPago')}>Método {table.sortIcon('metodoPago')}</th>
              <th onClick={() => table.sortBy('fechaVenta')}>Fecha {table.sortIcon('fechaVenta')}</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {table.paginatedData.map(v => (
                <tr key={v.id}>
                  <td>{v.numeroFactura}</td><td>{v.cliente?.nombre}</td><td>S/ {v.total}</td><td>{v.metodoPago}</td>
                  <td>{v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  <td className="actions">
                    <button className="btn btn-primary btn-sm" onClick={() => downloadFactura(v.id)}>PDF</button>
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

