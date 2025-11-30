import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';

type StringMap = {
  [key: string]: string;
};

const pathToComponent: StringMap = {
  '/': 'login',
  '/login': 'login',
  '/signup': 'signup',
  '/styleguide': 'styleguide',
  '/profile': 'profile',
};

type DynamicImport = {
  default: React.ComponentType<unknown>;
};

const App = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [PageComponent, setPageComponent] = useState<React.ComponentType<unknown> | null>(null);

  const onLocationChange = async (): Promise<void> => {
    const componentPath = pathToComponent[window.location.pathname];
    setCurrentPath(window.location.pathname);
    if (!componentPath) {
      setPageComponent(null);
      return;
    }
    const component = (await import(`./pages/${componentPath}/index.tsx`)) as DynamicImport;
    setPageComponent(() => component.default ?? null);
  };

  useEffect(() => {
    window.addEventListener('popstate', () => void onLocationChange());
    void onLocationChange();
    return () => window.removeEventListener('popstate', () => void onLocationChange());
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {PageComponent && <PageComponent />}
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
