import { createTheme } from '@mui/material/styles';

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
      main: '#000000',
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
  },
});

export default theme;
