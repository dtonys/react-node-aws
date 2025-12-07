import { useState, useEffect, useRef, RefObject } from 'react';
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
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
  [key: string]: any;
};
type DynamicImport = {
  default: React.ComponentType<PageComponentProps>;
};

const App = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [PageComponent, setPageComponent] = useState<React.ComponentType<PageComponentProps> | null>(null);
  const currentUserRef = useRef<Record<string, any> | null>(null);

  const onLocationChange = async () => {
    const { component, requireAuth } = pathToMeta[window.location.pathname] || {};
    let newPath = window.location.pathname;
    // Login redirect
    if (!component || (requireAuth && !currentUserRef.current)) {
      newPath = '/login';
      window.history.replaceState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    const pageComponent = (await import(`./pages/${component}/index.tsx`)) as DynamicImport;
    setCurrentPath(newPath);
    setPageComponent(() => pageComponent.default ?? null);
  };

  async function loadCookieSession() {
    const sessionResponse = await fetch('/api/auth/session');
    console.log('sessionResponse', sessionResponse);
    const { user, session } = await sessionResponse.json();
    if (user && session) currentUserRef.current = user;
  }

  async function onInitialPageLoad() {
    await loadCookieSession();
    void onLocationChange();
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
        {PageComponent && <PageComponent currentUserRef={currentUserRef} loadCookieSession={loadCookieSession} />}
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
