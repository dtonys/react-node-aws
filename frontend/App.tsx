import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const theme = createTheme();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>App 2026</div>
    </ThemeProvider>
  );
};

export default App;
