import { useState, useMemo } from 'react';

// Hook reutilizable para búsqueda, ordenamiento y paginación de tablas
export default function useTable(allData, pageSize = 10) {
  const [searchText, setSearchText] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtra y ordena los datos según búsqueda y columna
  const filteredData = useMemo(() => {
    let data = [...allData];
    if (searchText) {
      const t = searchText.toLowerCase();
      data = data.filter(row =>
        Object.values(row).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(t))
      );
    }
    if (sortColumn) {
      data.sort((a, b) => {
        const va = a[sortColumn] ?? '', vb = b[sortColumn] ?? '';
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [allData, searchText, sortColumn, sortDir]);

  // Calcula el total de páginas disponibles
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Obtiene los datos de la página actual
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Genera el arreglo de números de página
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Cambia la columna de ordenamiento
  function sortBy(col) {
    if (sortColumn === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(col); setSortDir('asc'); }
  }

  // Devuelve el icono según la dirección de orden
  function sortIcon(col) {
    return sortColumn === col ? (sortDir === 'asc' ? '▲' : '▼') : '';
  }

  // Navega a una página específica
  function goPage(p) {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  }

  // Reinicia la paginación al buscar
  function onSearch(text) {
    setSearchText(text);
    setCurrentPage(1);
  }

  // Retorna el menor de dos números
  const min = (a, b) => Math.min(a, b);

  return {
    searchText, setSearchText,
    sortBy, sortIcon, goPage, onSearch, min,
    filteredData, totalPages, paginatedData, pages, currentPage
  };
}

// Componente de paginación reutilizable
export function Pagination({ table, total }) {
  return (
    <div className="pagination">
      <button disabled={table.currentPage === 1} onClick={() => table.goPage(table.currentPage - 1)}>Anterior</button>
      {table.pages.map(p => (
        <button key={p} className={p === table.currentPage ? 'active' : ''} onClick={() => table.goPage(p)}>{p}</button>
      ))}
      <button disabled={table.currentPage === table.totalPages} onClick={() => table.goPage(table.currentPage + 1)}>Siguiente</button>
      <span>Mostrando {table.min((table.currentPage - 1) * 10 + 1, table.filteredData.length)}-{table.min(table.currentPage * 10, table.filteredData.length)} de {table.filteredData.length}</span>
    </div>
  );
}
