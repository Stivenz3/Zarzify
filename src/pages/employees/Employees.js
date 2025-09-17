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
  Menu,
  MenuItem,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Divider,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Image as ImageIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import getImageUrl from '../../utils/imageUtils';
import DataTable from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { employeesService } from '../../services/firestoreService';

function Employees() {
  const { currentBusiness } = useApp();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  
  const [employeeData, setEmployeeData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    cargo: '',
    salario: '',
    fecha_contratacion: null,
    imagen_url: '',
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    salaryOrder: null, // null = sin filtro, 'desc' = mayor a menor, 'asc' = menor a mayor
    dateOrder: null    // null = sin filtro, 'desc' = recientes primero, 'asc' = antiguas primero
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
      // Cargar empleados desde Firestore filtrados por business_id
      const allEmployees = await employeesService.getWhere('business_id', '==', currentBusiness.id);
      setEmployees(allEmployees);
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
        email: employee.email || '',
        telefono: employee.telefono || '',
        direccion: employee.direccion || '',
        cargo: employee.cargo || '',
        salario: employee.salario || '',
        fecha_contratacion: employee.fecha_contratacion ? 
          (employee.fecha_contratacion?.toDate ? employee.fecha_contratacion.toDate() : new Date(employee.fecha_contratacion)) : null,
        imagen_url: employee.imagen_url || '',
      });
    } else {
      setEditingEmployee(null);
      setEmployeeData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        cargo: '',
        salario: '',
        fecha_contratacion: null,
        imagen_url: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
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
      setError('El nombre es obligatorio');
      return;
    }

    // Validar email si se proporciona
    if (employeeData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(employeeData.email.trim())) {
        setError('Por favor ingresa un email válido');
        return;
      }
    }

    // Validar teléfono si se proporciona
    if (employeeData.telefono.trim()) {
      const phoneRegex = /^3\d{9}$/;
      if (!phoneRegex.test(employeeData.telefono.trim())) {
        setError('El teléfono debe tener 10 dígitos');
        return;
      }
    }

    // Validar salario si se proporciona
    if (employeeData.salario && parseFloat(employeeData.salario) < 0) {
      setError('El salario debe ser un valor positivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = employeeData.imagen_url;

      const dataToSend = {
        ...employeeData,
        nombre: employeeData.nombre.trim(),
        email: employeeData.email.trim() || null,
        telefono: employeeData.telefono.trim() || null,
        direccion: employeeData.direccion.trim() || null,
        cargo: employeeData.cargo.trim() || null,
        salario: employeeData.salario ? parseFloat(employeeData.salario) : null,
        fecha_contratacion: employeeData.fecha_contratacion ? 
          employeeData.fecha_contratacion.toISOString().split('T')[0] : null,
        imagen_url: imageUrl || null,
        business_id: currentBusiness.id
      };

      // Removemos imagen_file del dataToSend ya que no debe enviarse al backend
      delete dataToSend.imagen_file;

      if (editingEmployee) {
        // Actualizar empleado existente en Firestore
        await employeesService.update(editingEmployee.id, dataToSend);
      } else {
        // Crear nuevo empleado en Firestore
        await employeesService.create(dataToSend);
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

  // Función para filtrar y ordenar empleados
  const getFilteredEmployees = () => {
    let filteredEmployees = [...employees];

    // Si no hay filtros de ordenamiento activos, ordenar por fecha de registro (más reciente arriba)
    if (filters.salaryOrder === null && filters.dateOrder === null) {
      filteredEmployees.sort((a, b) => {
        const dateA = new Date(a.created_at || a.id);
        const dateB = new Date(b.created_at || b.id);
        return dateB - dateA; // Más reciente arriba
      });
      return filteredEmployees;
    }

    // Ordenar por salario si está activo
    if (filters.salaryOrder !== null) {
      filteredEmployees.sort((a, b) => {
        const salaryA = parseFloat(a.salario) || 0;
        const salaryB = parseFloat(b.salario) || 0;
        
        if (filters.salaryOrder === 'desc') {
          return salaryB - salaryA; // Mayor a menor
        } else {
          return salaryA - salaryB; // Menor a mayor
        }
      });
    }

    // Ordenar por fecha de contratación si está activo (puede sobrescribir el orden de salario)
    if (filters.dateOrder !== null) {
      filteredEmployees.sort((a, b) => {
        const dateA = a.fecha_contratacion?.toDate ? a.fecha_contratacion.toDate() : new Date(a.fecha_contratacion);
        const dateB = b.fecha_contratacion?.toDate ? b.fecha_contratacion.toDate() : new Date(b.fecha_contratacion);
        
        if (filters.dateOrder === 'desc') {
          return dateB - dateA; // Recientes primero
        } else {
          return dateA - dateB; // Antiguas primero
        }
      });
    }

    return filteredEmployees;
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        // Eliminar empleado de Firestore
        await employeesService.delete(employeeId);
        await loadEmployees();
      } catch (error) {
        console.error('Error al eliminar empleado:', error);
        setError('Error al eliminar el empleado');
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
      field: 'imagen_url', 
      headerName: 'Foto', 
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.imagen_url}
          alt={params.row.nombre}
          sx={{ width: 40, height: 40 }}
        >
          <PersonIcon />
        </Avatar>
      )
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'cargo',
      headerName: 'Cargo',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => params.row.cargo || 'No especificado',
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 130,
      renderCell: (params) => params.row.telefono || '-',
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => params.row.email || '-',
    },
    {
      field: 'salario',
      headerName: 'Salario',
      width: 160,
      renderCell: (params) => {
        const salario = parseFloat(params.row.salario || 0);
        return salario > 0 ? (
          <CurrencyDisplay 
            amount={salario}
            variant="body2"
            sx={{ fontWeight: 'bold', color: 'success.main' }}
          />
        ) : '-';
      },
    },
    {
      field: 'fecha_contratacion',
      headerName: 'Contratación',
      width: 130,
      renderCell: (params) => {
        if (!params.row.fecha_contratacion) return '-';
        const date = params.row.fecha_contratacion?.toDate ? 
          params.row.fecha_contratacion.toDate() : new Date(params.row.fecha_contratacion);
        return date.toLocaleDateString();
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

  const renderCardsView = () => (
      <Grid container spacing={3}>
        {getFilteredEmployees().map((employee) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={employee.id}>
          <Card 
            sx={{ 
              height: 320,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 6 
              }
            }}
          >
            <CardMedia
              component="div"
              sx={{
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                backgroundImage: employee.imagen_url ? `url(${getImageUrl(employee.imagen_url)})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!employee.imagen_url && (
                <PersonIcon sx={{ fontSize: 60, color: 'grey.400' }} />
              )}
            </CardMedia>
            <CardContent sx={{ height: 200, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {employee.nombre}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick(e, employee);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                {employee.cargo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {employee.cargo}
                    </Typography>
                  </Box>
                )}
                
                {employee.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {employee.email}
                    </Typography>
                  </Box>
                )}
                
                {employee.telefono && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {employee.telefono}
                    </Typography>
                  </Box>
                )}
                
                {employee.salario && parseFloat(employee.salario) > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <CurrencyDisplay 
                      amount={employee.salario}
                      variant="body2" 
                      sx={{ color: 'success.main', fontWeight: 'bold' }}
                    />
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {employee.fecha_contratacion 
                  ? `Desde: ${(employee.fecha_contratacion?.toDate ? employee.fecha_contratacion.toDate() : new Date(employee.fecha_contratacion)).toLocaleDateString()}`
                  : 'Fecha no especificada'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      </Grid>
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
            size="small"
          >
            <ToggleButton value="cards" aria-label="vista de tarjetas">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="vista de tabla">
              <TableRowsIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Empleado
          </Button>
        </Box>
      </Box>

      {viewMode === 'cards' ? renderCardsView() : (
        <DataTable
          rows={getFilteredEmployees()}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          extraFilters={
          <>
            <Button
              variant={filters.salaryOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, salaryOrder: prev.salaryOrder === 'desc' ? null : 'desc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              ^ Mayor Salario $
            </Button>
            <Button
              variant={filters.salaryOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, salaryOrder: prev.salaryOrder === 'asc' ? null : 'asc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              v Menor Salario $
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
            {(filters.salaryOrder !== null || filters.dateOrder !== null) && (
              <Button
                variant="text"
                size="small"
                onClick={() => setFilters({ salaryOrder: null, dateOrder: null })}
                sx={{ minWidth: 'auto', px: 1, color: 'text.secondary' }}
              >
                ✕ Limpiar Todo
              </Button>
            )}
          </>
        }
        />
      )}

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
        <MenuItem onClick={() => {
          handleDelete(selectedEmployee.id);
          handleCloseMenu();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar empleado */}
      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
        subtitle={editingEmployee ? 'Modifica los datos del empleado' : 'Agrega un nuevo empleado a tu equipo'}
        icon={WorkIcon}
        maxWidth="md"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading || !employeeData.nombre.trim()}
            >
              {loading ? 'Guardando...' : (editingEmployee ? 'Actualizar' : 'Crear')}
            </PrimaryButton>
          </>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre *"
              name="nombre"
              value={employeeData.nombre}
              onChange={handleInputChange}
              required
              error={Boolean(!employeeData.nombre.trim() && error)}
              helperText={!employeeData.nombre.trim() && error ? 'El nombre es requerido' : ''}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cargo"
              name="cargo"
              value={employeeData.cargo}
              onChange={handleInputChange}
              placeholder="Ej: Vendedor, Gerente, etc."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={employeeData.telefono}
              onChange={handleInputChange}
              placeholder="3001234567"
              helperText="Debe tener 10 dígitos"
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
              placeholder="empleado@ejemplo.com"
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
              inputProps={{ min: 0 }}
              placeholder="1000000"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Fecha de Contratación"
              value={employeeData.fecha_contratacion}
              onChange={(newValue) => 
                setEmployeeData(prev => ({ ...prev, fecha_contratacion: newValue }))
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth />
              )}
              maxDate={new Date()}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={employeeData.direccion}
              onChange={handleInputChange}
              multiline
              rows={2}
              placeholder="Dirección completa del empleado"
            />
          </Grid>

          {/* Sección de imagen */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Foto del Empleado
            </Typography>
            
            <TextField
              fullWidth
              label="URL de la Imagen"
              name="imagen_url"
              value={employeeData.imagen_url}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/foto.jpg"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Preview de la imagen */}
          {employeeData.imagen_url && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Avatar
                  src={getImageUrl(employeeData.imagen_url)}
                  alt="Preview"
                  sx={{ width: 100, height: 100 }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
            </Grid>
          )}
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Employees; 