import { createTheme } from '@mui/material/styles';

// Color palette
const red = '#D32F2F';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
    },
    divider: '#000000',
    action: {
      active: '#000000',
      hover: '#000000',
      selected: '#000000',
      disabled: '#CCCCCC',
      disabledBackground: '#F5F5F5',
    },
    error: {
      main: red,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#000000',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#000000',
    },
    h2: {
      fontWeight: 700,
      color: '#000000',
    },
    h3: {
      fontWeight: 700,
      color: '#000000',
    },
    h4: {
      fontWeight: 700,
      color: '#000000',
    },
    h5: {
      fontWeight: 700,
      color: '#000000',
    },
    h6: {
      fontWeight: 700,
      color: '#000000',
    },
    body1: {
      color: '#000000',
    },
    body2: {
      color: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderWidth: 2,
          '&.MuiButton-contained': {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#000000',
              opacity: 0.9,
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#000000',
            color: '#000000',
            '&:hover': {
              borderColor: '#000000',
              backgroundColor: '#000000',
              color: '#FFFFFF',
            },
          },
          '&.MuiButton-text': {
            color: '#000000',
            '&:hover': {
              backgroundColor: '#F5F5F5',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#000000',
            },
            '&:hover fieldset': {
              borderColor: '#000000',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#000000',
            },
            '&.Mui-error fieldset': {
              borderColor: red,
            },
            '&.Mui-error:hover fieldset': {
              borderColor: red,
            },
            '&.Mui-error.Mui-focused fieldset': {
              borderColor: red,
            },
          },
          '& .MuiFormHelperText-root.Mui-error': {
            color: red,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '2px solid #000000',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #000000',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#000000',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#F5F5F5',
          },
          '&.Mui-selected': {
            backgroundColor: '#E0E0E0',
            '&:hover': {
              backgroundColor: '#D5D5D5',
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        option: {
          '&:hover': {
            backgroundColor: '#F5F5F5',
          },
          '&[aria-selected="true"]': {
            backgroundColor: '#E0E0E0',
            '&:hover': {
              backgroundColor: '#D5D5D5',
            },
          },
          '&.Mui-focused': {
            backgroundColor: '#F5F5F5',
          },
        },
        tag: {
          color: '#FFFFFF',
          '& .MuiChip-deleteIcon': {
            color: '#FFFFFF',
            '&:hover': {
              color: '#CCCCCC',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorDefault.MuiChip-filled': {
            color: '#FFFFFF',
          },
          '&.MuiChip-colorDefault.MuiChip-outlined': {
            color: '#000000',
            borderColor: '#000000',
          },
        },
        deleteIcon: {
          '.MuiChip-colorDefault.MuiChip-filled &': {
            color: '#FFFFFF',
            '&:hover': {
              color: '#CCCCCC',
            },
          },
          '.MuiChip-colorDefault.MuiChip-outlined &': {
            color: '#000000',
            '&:hover': {
              color: '#666666',
            },
          },
        },
      },
    },
  },
});

export default theme;
