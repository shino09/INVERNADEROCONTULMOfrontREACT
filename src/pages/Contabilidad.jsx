import { useEffect, useState } from 'react';
import { apiGet, apiGetPdf } from '../api/apiService';

// Página de contabilidad con libro diario y libro mayor
export default function Contabilidad() {
  const [libroDiario, setLibroDiario] = useState([]);
  const [libroMayor, setLibroMayor] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [desdeMayor, setDesdeMayor] = useState('');
  const [hastaMayor, setHastaMayor] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Carga el libro diario al iniciar el componente
  useEffect(() => { loadDiario(); }, []);

  // Consulta el libro diario con filtro de fechas
  async function loadDiario() {
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta;
      setLibroDiario(await apiGet('/contabilidad/libro-diario', params));
    } catch (e) { setErrorMsg(e.message); }
  }

  // Consulta el libro mayor con filtro de fechas
  async function loadMayor() {
    try {
      const params = {};
      if (desdeMayor) params.desde = desdeMayor;
      if (hastaMayor) params.hasta = hastaMayor;
      setLibroMayor(await apiGet('/contabilidad/libro-mayor', params));
    } catch (e) { setErrorMsg(e.message); }
  }

  // Descarga el libro diario en PDF
  function downloadDiario() {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    apiGetPdf('/contabilidad/libro-diario', { ...params, format: 'pdf' }).catch(e => setErrorMsg(e.message));
  }

  // Descarga el libro mayor en PDF
  function downloadMayor() {
    const params = {};
    if (desdeMayor) params.desde = desdeMayor;
    if (hastaMayor) params.hasta = hastaMayor;
    apiGetPdf('/contabilidad/libro-mayor', { ...params, format: 'pdf' }).catch(e => setErrorMsg(e.message));
  }

  return (
    <>
      <h1>Contabilidad</h1>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="card">
        <h3>Libro Diario</h3>
        <div className="filters">
          <input className="form-control" type="date" value={desde} onChange={e => setDesde(e.target.value)} placeholder="Desde" />
          <input className="form-control" type="date" value={hasta} onChange={e => setHasta(e.target.value)} placeholder="Hasta" />
          <button className="btn btn-primary" onClick={loadDiario}>Consultar</button>
          <button className="btn btn-secondary" onClick={downloadDiario}>PDF</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Fecha</th><th>Asiento</th><th>Cuenta</th><th>Descripción</th><th>Debe</th><th>Haber</th></tr></thead>
            <tbody>
              {libroDiario.map(a => (
                <tr key={a.id}>
                  <td>{a.fechaAsiento ? new Date(a.fechaAsiento).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  <td>{a.numeroAsiento}</td><td>{a.cuentaContable}</td><td>{a.descripcion}</td><td>S/ {a.debe}</td><td>S/ {a.haber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Libro Mayor</h3>
        <div className="filters">
          <input className="form-control" type="date" value={desdeMayor} onChange={e => setDesdeMayor(e.target.value)} placeholder="Desde" />
          <input className="form-control" type="date" value={hastaMayor} onChange={e => setHastaMayor(e.target.value)} placeholder="Hasta" />
          <button className="btn btn-primary" onClick={loadMayor}>Consultar</button>
          <button className="btn btn-secondary" onClick={downloadMayor}>PDF</button>
        </div>
        {libroMayor.map(c => (
          <div key={c.cuenta} style={{ marginBottom: 15 }}>
            <h4 style={{ background: '#e8f5e9', padding: 8 }}>{c.cuenta}</h4>
            <p>Debe: S/ {c.saldoDebe} | Haber: S/ {c.saldoHaber} | Saldo: S/ {c.saldoFinal}</p>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Fecha</th><th>Asiento</th><th>Descripción</th><th>Debe</th><th>Haber</th></tr></thead>
                <tbody>
                  {c.movimientos.map(m => (
                    <tr key={m.id}>
                      <td>{m.fechaAsiento ? new Date(m.fechaAsiento).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</td>
                      <td>{m.numeroAsiento}</td><td>{m.descripcion}</td><td>S/ {m.debe}</td><td>S/ {m.haber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
