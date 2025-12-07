import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';

type PathToMeta = {
  [key: string]: Record<string, any>;
};

const pathToMeta: PathToMeta = {
  '/': { component: 'home', requireAuth: true },
  '/login': { component: 'login', requireAuth: false },
  '/signup': { component: 'signup', requireAuth: false },
  '/styleguide': { component: 'styleguide', requireAuth: false },
  '/profile': { component: 'profile', requireAuth: true },
};

type PageComponentProps = {
  currentUser: Record<string, any> | null;
  [key: string]: any;
};
type DynamicImport = {
  default: React.ComponentType<PageComponentProps>;
};

const App = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [PageComponent, setPageComponent] = useState<React.ComponentType<PageComponentProps> | null>(null);
  const [currentUser, setCurrentUser] = useState<Record<string, any> | null>(null);

  const onLocationChange = async (initialCurrentUser?: Record<string, any> | null): Promise<void> => {
    const { component, requireAuth } = pathToMeta[window.location.pathname] || {};
    let newPath = window.location.pathname;
    const _currentUser = initialCurrentUser ?? currentUser;
    // Login redirect
    if (!component || (requireAuth && !_currentUser)) {
      newPath = '/login';
      window.history.replaceState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    setCurrentPath(newPath);
    const pageComponent = (await import(`./pages/${component}/index.tsx`)) as DynamicImport;
    setPageComponent(() => pageComponent.default ?? null);
  };

  async function loadCookieSession() {
    const sessionResponse = await fetch('/api/auth/session');
    console.log('sessionResponse', sessionResponse);
    const { user, session } = await sessionResponse.json();
    if (user && session) {
      setCurrentUser(user);
      return user;
    }
  }

  async function onInitialPageLoad() {
    const initialCurrentUser = await loadCookieSession();
    void onLocationChange(initialCurrentUser);
  }

  useEffect(() => {
    window.addEventListener('popstate', () => void onLocationChange());
    void onInitialPageLoad();
    return () => window.removeEventListener('popstate', () => void onLocationChange());
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {PageComponent && <PageComponent currentUser={currentUser ?? null} />}
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
