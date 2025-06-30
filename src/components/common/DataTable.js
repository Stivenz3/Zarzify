import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

function DataTable({
  rows = [],
  columns = [],
  loading = false,
  getRowId,
  pageSize = 10,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrado de datos
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((column) => {
      const value = row[column.field];
      return String(value || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Paginación
  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra de búsqueda */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ minWidth: column.width }}
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => {
                const rowId = getRowId ? getRowId(row) : row.id;
                return (
                  <TableRow key={rowId} hover>
                    {columns.map((column) => (
                      <TableCell
                        key={`${rowId}-${column.field}`}
                        align={column.align || 'left'}
                      >
                        {column.renderCell ? (
                          column.renderCell({ row, value: row[column.field] })
                        ) : (
                          row[column.field] || ''
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchTerm ? 'No se encontraron resultados' : 'No hay datos disponibles'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: '1px solid #e0e0e0',
          }}
        />
      </TableContainer>
    </Box>
  );
}

export default DataTable; 