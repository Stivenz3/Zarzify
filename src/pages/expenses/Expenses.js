import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Grid,
  Menu,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  MoneyOff as ExpenseIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { expensesService, employeesService } from '../../services/firestoreService';

function Expenses() {
  const { currentBusiness } = useApp();
  const { markDashboardForRefresh } = useDashboard();
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  const [expenseData, setExpenseData] = useState({
    concepto: '',
    descripcion: '',
    monto: '',
    categoria: '',
    metodo_pago: 'efectivo',
    empleado_id: '',
    fecha_pago: new Date().toISOString().split('T')[0],
  });

  const categorias = [
    { value: 'sueldos', label: 'Sueldos y Salarios' },
    { value: 'servicios', label: 'Servicios (Luz, Agua, Internet)' },
    { value: 'proveedores', label: 'Pago a Proveedores' },
    { value: 'gastos_operativos', label: 'Gastos Operativos' },
    { value: 'marketing', label: 'Marketing y Publicidad' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'otros', label: 'Otros' },
  ];

  // Estados para filtros
  const [filters, setFilters] = useState({
    amountOrder: null, // null = sin filtro, 'desc' = mayor a menor, 'asc' = menor a mayor
    dateOrder: null,   // null = sin filtro, 'desc' = recientes primero, 'asc' = antiguas primero
    categoria: ''
  });

  useEffect(() => {
    if (currentBusiness) {
      loadEmployees();
    }
  }, [currentBusiness]);

  useEffect(() => {
    if (currentBusiness && employees.length > 0) {
      loadExpenses();
    }
  }, [currentBusiness, employees]);

  const loadExpenses = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      // Cargar gastos desde Firestore filtrados por business_id
      const allExpenses = await expensesService.getWhere('business_id', '==', currentBusiness.id);
      
      // Enriquecer gastos con nombres de empleados
      const enrichedExpenses = allExpenses.map(expense => {
        const employee = employees.find(emp => emp.id === expense.empleado_id);
        return {
          ...expense,
          empleado_nombre: employee ? employee.nombre : '-'
        };
      });
      
      setExpenses(enrichedExpenses);
    } catch (error) {
      console.error('Error al cargar egresos:', error);
      setError('Error al cargar los egresos');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    if (!currentBusiness) return;
    try {
      // Cargar empleados desde Firestore filtrados por business_id
      const allEmployees = await employeesService.getWhere('business_id', '==', currentBusiness.id);
      setEmployees(allEmployees);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseData({
        concepto: expense.concepto || '',
        descripcion: expense.descripcion || '',
        monto: expense.monto || '',
        categoria: expense.categoria || '',
        metodo_pago: expense.metodo_pago || 'efectivo',
        empleado_id: expense.empleado_id || '',
        fecha_pago: expense.fecha_pago ? 
          (expense.fecha_pago?.toDate ? expense.fecha_pago.toDate().toISOString().split('T')[0] : expense.fecha_pago.split('T')[0]) : 
          new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingExpense(null);
      setExpenseData({
        concepto: '',
        descripcion: '',
        monto: '',
        categoria: '',
        metodo_pago: 'efectivo',
        empleado_id: '',
        fecha_pago: new Date().toISOString().split('T')[0],
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!expenseData.concepto.trim()) {
      setError('El concepto es requerido');
      return;
    }

    if (!expenseData.monto || parseFloat(expenseData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (!expenseData.categoria) {
      setError('La categoría es requerida');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...expenseData,
        business_id: currentBusiness.id,
        monto: parseFloat(expenseData.monto),
        empleado_id: expenseData.empleado_id || null,
      };

      if (editingExpense) {
        // Actualizar gasto existente en Firestore
        await expensesService.update(editingExpense.id, dataToSend);
        markDashboardForRefresh('egreso actualizado');
      } else {
        // Crear nuevo gasto en Firestore
        await expensesService.create(dataToSend);
        markDashboardForRefresh('nuevo egreso registrado');
      }

      await loadExpenses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar egreso:', error);
      setError(error.response?.data?.error || 'Error al guardar el egreso');
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar y ordenar gastos
  const getFilteredExpenses = () => {
    let filteredExpenses = expenses.filter(expense => {
      // Filtro por categoría
      if (filters.categoria && expense.categoria !== filters.categoria) {
        return false;
      }
      
      return true;
    });

    // Si no hay filtros de ordenamiento activos, ordenar por fecha (más reciente arriba)
    if (filters.amountOrder === null && filters.dateOrder === null) {
      filteredExpenses.sort((a, b) => {
        const dateA = new Date(a.created_at || a.fecha);
        const dateB = new Date(b.created_at || b.fecha);
        return dateB - dateA; // Más reciente arriba
      });
      return filteredExpenses;
    }

    // Ordenar por monto si está activo
    if (filters.amountOrder !== null) {
      filteredExpenses.sort((a, b) => {
        const amountA = parseFloat(a.monto) || 0;
        const amountB = parseFloat(b.monto) || 0;
        
        if (filters.amountOrder === 'desc') {
          return amountB - amountA; // Mayor a menor
        } else {
          return amountA - amountB; // Menor a mayor
        }
      });
    }

    // Ordenar por fecha si está activo (puede sobrescribir el orden de monto)
    if (filters.dateOrder !== null) {
      filteredExpenses.sort((a, b) => {
        const dateA = new Date(a.created_at || a.fecha);
        const dateB = new Date(b.created_at || b.fecha);
        
        if (filters.dateOrder === 'desc') {
          return dateB - dateA; // Recientes primero
        } else {
          return dateA - dateB; // Antiguas primero
        }
      });
    }

    return filteredExpenses;
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este egreso?')) {
      try {
        // Eliminar gasto de Firestore
        await expensesService.delete(expenseId);
        markDashboardForRefresh('egreso eliminado');
        await loadExpenses();
        handleCloseMenu();
      } catch (error) {
        console.error('Error al eliminar egreso:', error);
        alert('Error al eliminar el egreso');
      }
    }
  };

  const handleMenuClick = (event, expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const getCategoriaLabel = (categoria) => {
    const cat = categorias.find(c => c.value === categoria);
    return cat ? cat.label : categoria;
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      'sueldos': 'primary',
      'servicios': 'secondary',
      'proveedores': 'warning',
      'gastos_operativos': 'info',
      'marketing': 'success',
      'mantenimiento': 'error',
      'otros': 'default'
    };
    return colors[categoria] || 'default';
  };

  const columns = [
    {
      field: 'fecha_pago',
      headerName: 'Fecha',
      width: 120,
      renderCell: (params) => {
        if (!params.row.fecha_pago) return '-';
        const date = params.row.fecha_pago?.toDate ? 
          params.row.fecha_pago.toDate() : new Date(params.row.fecha_pago);
        return date.toLocaleDateString();
      },
    },
    { field: 'concepto', headerName: 'Concepto', flex: 1 },
    {
      field: 'categoria',
      headerName: 'Categoría',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={getCategoriaLabel(params.row.categoria)}
          color={getCategoriaColor(params.row.categoria)}
          size="small"
        />
      ),
    },
    {
      field: 'monto',
      headerName: 'Monto',
      width: 160,
      renderCell: (params) => (
        <CurrencyDisplay 
          amount={params.row.monto}
          variant="body2"
          sx={{ fontWeight: 'bold', color: 'error.main' }}
        />
      ),
    },
    { field: 'metodo_pago', headerName: 'Método de Pago', width: 140 },
    { field: 'empleado_nombre', headerName: 'Empleado', width: 150 },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Selecciona un negocio para ver los egresos
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Egresos y Gastos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Egreso
        </Button>
      </Box>

      <DataTable
        rows={getFilteredExpenses()}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        extraFilters={
          <>
            <Button
              variant={filters.amountOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, amountOrder: prev.amountOrder === 'desc' ? null : 'desc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              ^ Mayor $
            </Button>
            <Button
              variant={filters.amountOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, amountOrder: prev.amountOrder === 'asc' ? null : 'asc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              v Menor $
            </Button>
            <Button
              variant={filters.dateOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, dateOrder: prev.dateOrder === 'desc' ? null : 'desc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              Recientes
            </Button>
            <Button
              variant={filters.dateOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, dateOrder: prev.dateOrder === 'asc' ? null : 'asc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              Antiguos
            </Button>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.categoria}
                onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
                label="Categoría"
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(filters.amountOrder !== null || filters.dateOrder !== null || filters.categoria) && (
              <Button
                variant="text"
                size="small"
                onClick={() => setFilters({ amountOrder: null, dateOrder: null, categoria: '' })}
                sx={{ minWidth: 'auto', px: 1, color: 'text.secondary' }}
              >
                ✕ Limpiar Todo
              </Button>
            )}
          </>
        }
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          handleOpenDialog(selectedExpense);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedExpense?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar egreso */}
      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingExpense ? 'Editar Egreso' : 'Nuevo Egreso'}
        subtitle={editingExpense ? 'Modifica los datos del egreso' : 'Registra un nuevo gasto o egreso para tu negocio'}
        icon={ExpenseIcon}
        maxWidth="md"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading || !expenseData.concepto.trim() || !expenseData.monto || !expenseData.categoria}
            >
              {loading ? 'Guardando...' : (editingExpense ? 'Actualizar' : 'Crear')}
            </PrimaryButton>
          </>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Concepto *"
              name="concepto"
              value={expenseData.concepto}
              onChange={handleInputChange}
              required
              error={Boolean(!expenseData.concepto.trim() && error)}
              helperText={!expenseData.concepto.trim() && error ? 'El concepto es requerido' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={Boolean(!expenseData.categoria && error)}>
              <InputLabel>Categoría *</InputLabel>
              <Select
                name="categoria"
                value={expenseData.categoria}
                onChange={handleInputChange}
                label="Categoría *"
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monto *"
              name="monto"
              type="number"
              value={expenseData.monto}
              onChange={handleInputChange}
              inputProps={{ step: "0.01", min: "0" }}
              required
              error={Boolean(!expenseData.monto && error)}
              helperText={!expenseData.monto && error ? 'El monto es requerido' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                name="metodo_pago"
                value={expenseData.metodo_pago}
                onChange={handleInputChange}
                label="Método de Pago"
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha de Pago"
              name="fecha_pago"
              type="date"
              value={expenseData.fecha_pago}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Empleado (opcional)</InputLabel>
              <Select
                name="empleado_id"
                value={expenseData.empleado_id}
                onChange={handleInputChange}
                label="Empleado (opcional)"
              >
                <MenuItem value="">
                  <em>Ninguno</em>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={expenseData.descripcion}
              onChange={handleInputChange}
              multiline
              rows={3}
              placeholder="Descripción opcional del egreso"
            />
          </Grid>
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Expenses; 