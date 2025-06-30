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
  Alert,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';

function Employees() {
  const { currentBusiness } = useApp();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [employeeData, setEmployeeData] = useState({
    nombre: '',
    apellido: '',
    cargo: '',
    telefono: '',
    email: '',
    salario: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      loadEmployees();
    }
  }, [currentBusiness]);

  const loadEmployees = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const response = await api.get(`/empleados/${currentBusiness.id}`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setError('Error al cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeData({
        nombre: employee.nombre || '',
        apellido: employee.apellido || '',
        cargo: employee.cargo || '',
        telefono: employee.telefono || '',
        email: employee.email || '',
        salario: employee.salario || '',
      });
    } else {
      setEditingEmployee(null);
      setEmployeeData({
        nombre: '',
        apellido: '',
        cargo: '',
        telefono: '',
        email: '',
        salario: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!employeeData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...employeeData,
        negocio_id: currentBusiness.id,
        salario: parseFloat(employeeData.salario) || 0,
      };

      if (editingEmployee) {
        await api.put(`/empleados/${editingEmployee.id}`, dataToSend);
      } else {
        await api.post('/empleados', dataToSend);
      }

      await loadEmployees();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      setError(error.response?.data?.error || 'Error al guardar el empleado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await api.delete(`/empleados/${employeeId}`);
        await loadEmployees();
        handleCloseMenu();
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        alert(error.response?.data?.error || 'Error al eliminar el empleado');
      }
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const columns = [
    {
      field: 'nombre_completo',
      headerName: 'Nombre Completo',
      flex: 1,
      renderCell: (params) => {
        const nombreCompleto = `${params.row.nombre} ${params.row.apellido || ''}`.trim();
        return nombreCompleto;
      },
    },
    { field: 'cargo', headerName: 'Cargo', width: 150 },
    { field: 'telefono', headerName: 'Teléfono', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'salario',
      headerName: 'Salario',
      width: 120,
      renderCell: (params) => {
        const salario = parseFloat(params.row.salario || 0);
        return (
          <Chip
            label={`$${salario.toFixed(2)}`}
            color="primary"
            size="small"
          />
        );
      },
    },
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
          Selecciona un negocio para ver los empleados
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Empleados
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Empleado
        </Button>
      </Box>

      <DataTable
        rows={employees}
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
          handleOpenDialog(selectedEmployee);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedEmployee?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar empleado */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
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
                label="Nombre *"
                name="nombre"
                value={employeeData.nombre}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                value={employeeData.apellido}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cargo"
                name="cargo"
                value={employeeData.cargo}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Salario"
                name="salario"
                type="number"
                value={employeeData.salario}
                onChange={handleInputChange}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={employeeData.telefono}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={employeeData.email}
                onChange={handleInputChange}
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
          >
            {loading ? 'Guardando...' : editingEmployee ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Employees; 