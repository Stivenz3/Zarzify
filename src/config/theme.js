import { createTheme } from '@mui/material/styles';

// Función para crear tema dinámico basado en el modo
export const createAppTheme = (darkMode = false) => {
  return createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
      },
      secondary: {
        main: darkMode ? '#ff7675' : '#9c27b0',
        light: darkMode ? '#fd79a8' : '#ba68c8',
        dark: darkMode ? '#e84393' : '#7b1fa2',
      },
      error: {
        main: darkMode ? '#ff6b6b' : '#d32f2f',
        light: darkMode ? '#ff8a80' : '#ffcdd2',
        dark: darkMode ? '#d63031' : '#c62828',
      },
      warning: {
        main: darkMode ? '#feca57' : '#ed6c02',
        light: darkMode ? '#ffd54f' : '#fff3c4',
        dark: darkMode ? '#ff9f43' : '#e65100',
      },
      info: {
        main: darkMode ? '#54a0ff' : '#0288d1',
        light: darkMode ? '#74b9ff' : '#b3e5fc',
        dark: darkMode ? '#2980b9' : '#01579b',
      },
      success: {
        main: darkMode ? '#5f27cd' : '#2e7d32',
        light: darkMode ? '#8c7ae6' : '#a5d6a7',
        dark: darkMode ? '#341f97' : '#1b5e20',
      },
      // Colores personalizados para modo oscuro
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b3b3b3' : '#666666',
      },
      // Colores personalizados para Dashboard
      dashboard: {
        products: {
          main: darkMode ? '#6c5ce7' : '#1976d2',
          light: darkMode ? '#a29bfe' : '#42a5f5',
          dark: darkMode ? '#5f3dc4' : '#1565c0',
        },
        sales: {
          main: darkMode ? '#00b894' : '#2e7d32',
          light: darkMode ? '#00cec9' : '#4caf50',
          dark: darkMode ? '#00a085' : '#1b5e20',
        },
        clients: {
          main: darkMode ? '#fdcb6e' : '#ed6c02',
          light: darkMode ? '#ffeaa7' : '#ff9800',
          dark: darkMode ? '#e17055' : '#e65100',
        },
        inventory: {
          main: darkMode ? '#fd79a8' : '#9c27b0',
          light: darkMode ? '#fdcbd9' : '#ba68c8',
          dark: darkMode ? '#e84393' : '#7b1fa2',
        },
        revenue: {
          main: darkMode ? '#55efc4' : '#4caf50',
          light: darkMode ? '#81ecec' : '#8bc34a',
          dark: darkMode ? '#00b894' : '#388e3c',
        },
        expenses: {
          main: darkMode ? '#ff7675' : '#f44336',
          light: darkMode ? '#fab1a0' : '#ef5350',
          dark: darkMode ? '#e17055' : '#d32f2f',
        },
        profit: {
          main: darkMode ? '#74b9ff' : '#2196f3',
          light: darkMode ? '#a29bfe' : '#64b5f6',
          dark: darkMode ? '#0984e3' : '#1976d2',
        },
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            boxShadow: darkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            borderRight: darkMode ? '1px solid #333' : '1px solid #e0e0e0',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: darkMode 
                ? 'rgba(25, 118, 210, 0.3)' 
                : 'rgba(25, 118, 210, 0.12)',
              '&:hover': {
                backgroundColor: darkMode 
                  ? 'rgba(25, 118, 210, 0.4)' 
                  : 'rgba(25, 118, 210, 0.15)',
              },
            },
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            border: darkMode ? '1px solid #444' : '1px solid #e0e0e0',
            '& .MuiDataGrid-cell': {
              borderColor: darkMode ? '#444' : '#e0e0e0',
              color: darkMode ? '#ffffff' : '#000000',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: darkMode 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: darkMode 
                  ? 'rgba(25, 118, 210, 0.3)' 
                  : 'rgba(25, 118, 210, 0.12)',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
              borderColor: darkMode ? '#444' : '#e0e0e0',
              color: darkMode ? '#ffffff' : '#000000',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
              borderColor: darkMode ? '#444' : '#e0e0e0',
            },
            '& .MuiDataGrid-toolbarContainer': {
              backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
              borderColor: darkMode ? '#444' : '#e0e0e0',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: darkMode ? '#444' : '#e0e0e0',
            color: darkMode ? '#ffffff' : '#000000',
          },
          head: {
            backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
            color: darkMode ? '#ffffff' : '#000000',
            fontWeight: 'bold',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-selected': {
              backgroundColor: darkMode 
                ? 'rgba(25, 118, 210, 0.3)' 
                : 'rgba(25, 118, 210, 0.12)',
            },
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1e1e1e' : '#f5f5f5',
            borderTop: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': {
              color: darkMode ? '#b3b3b3' : '#666666',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: darkMode ? '#555' : '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? '#777' : '#b0b0b0',
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#555' : '#e0e0e0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#777' : '#b0b0b0',
            },
          },
        },
      },
    },
  });
};

// Tema por defecto (modo claro)
const theme = createAppTheme(false);

export default theme; 