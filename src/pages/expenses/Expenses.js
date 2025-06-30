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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  MoneyOff as ExpenseIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';

function Expenses() {
  const { currentBusiness } = useApp();
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

  useEffect(() => {
    if (currentBusiness) {
      loadExpenses();
      loadEmployees();
    }
  }, [currentBusiness]);

  const loadExpenses = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const response = await api.get(`/egresos/${currentBusiness.id}`);
      setExpenses(response.data);
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
      const response = await api.get(`/empleados/${currentBusiness.id}`);
      setEmployees(response.data);
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
        fecha_pago: expense.fecha_pago ? expense.fecha_pago.split('T')[0] : new Date().toISOString().split('T')[0],
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
        negocio_id: currentBusiness.id,
        monto: parseFloat(expenseData.monto),
        empleado_id: expenseData.empleado_id || null,
      };

      if (editingExpense) {
        await api.put(`/egresos/${editingExpense.id}`, dataToSend);
      } else {
        await api.post('/egresos', dataToSend);
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

  const handleDelete = async (expenseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este egreso?')) {
      try {
        await api.delete(`/egresos/${expenseId}`);
        await loadExpenses();
        handleCloseMenu();
      } catch (error) {
        console.error('Error al eliminar egreso:', error);
        alert(error.response?.data?.error || 'Error al eliminar el egreso');
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
        const date = new Date(params.row.fecha_pago);
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
      width: 120,
      renderCell: (params) => `$${parseFloat(params.row.monto || 0).toFixed(2)}`,
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
        rows={expenses}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Editar Egreso' : 'Nuevo Egreso'}
        </DialogTitle>
        <DialogContent>
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={<ExpenseIcon />}
          >
            {loading ? 'Guardando...' : editingExpense ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Expenses; 