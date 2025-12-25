import { useState, useEffect, useRef, RefObject, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { replaceState } from 'client/helpers/routing';
import { NotificationProvider, useNotification } from 'client/components/NotificationContext';
import theme from './theme';

type PathToMeta = {
  [key: string]: Record<string, any>;
};

const pathToMeta: PathToMeta = {
  '/': { component: 'home', requireAuth: true },
  '/login': { component: 'login', requireAuth: false, loggedInRedirect: '/' },
  '/signup': { component: 'signup', requireAuth: false, loggedInRedirect: '/' },
  '/forgot-password': { component: 'forgot-password', requireAuth: false },
  '/reset-password': { component: 'reset-password', requireAuth: false },
  '/not-found': { component: 'not-found', requireAuth: false },
  '/error': { component: 'error', requireAuth: false },
  '/styleguide': { component: 'styleguide', requireAuth: false },
  '/profile': { component: 'profile', requireAuth: true },
  '/uploads': { component: 'uploads', requireAuth: true },
  '/search': { component: 'search', requireAuth: true },
};

type PageComponentProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
  [key: string]: any;
};
type DynamicImport = {
  default: React.ComponentType<PageComponentProps>;
};

type AppContentProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  sessionLoaded: boolean;
  children: ReactNode;
};

function AppContent({ currentUserRef, sessionLoaded, children }: AppContentProps) {
  const { showPersistent, hidePersistent } = useNotification();

  useEffect(() => {
    const user = currentUserRef.current;
    if (user && !user.emailVerified) {
      showPersistent(
        'Please verify your email to get access to search, uploads, and more.',
        'info',
      );
    } else {
      hidePersistent();
    }
  }, [sessionLoaded]);

  return <>{children}</>;
}

const App = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [PageComponent, setPageComponent] =
    useState<React.ComponentType<PageComponentProps> | null>(null);
  const currentUserRef = useRef<Record<string, any> | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const onLocationChange = async () => {
    // Not found redirect
    let newPath = window.location.pathname;
    if (!pathToMeta[newPath]) {
      replaceState('/not-found');
      return;
    }
    const { component, requireAuth, loggedInRedirect } = pathToMeta[newPath] || {};
    // Login redirect
    if (requireAuth && !currentUserRef.current) {
      replaceState('/login');
      return;
    }
    if (loggedInRedirect && currentUserRef.current) {
      replaceState(loggedInRedirect);
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
    if (user && session) {
      currentUserRef.current = user;
    } else {
      currentUserRef.current = null;
    }
    setSessionLoaded((prev) => !prev); // Toggle to trigger re-render
  }

  async function onInitialPageLoad() {
    await loadCookieSession();
    void onLocationChange();
  }

  useEffect(() => {
    const handlePopState = () => void onLocationChange();
    window.addEventListener('popstate', handlePopState);
    void onInitialPageLoad();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AppContent currentUserRef={currentUserRef} sessionLoaded={sessionLoaded}>
            {PageComponent && (
              <PageComponent
                currentUserRef={currentUserRef}
                loadCookieSession={loadCookieSession}
              />
            )}
          </AppContent>
        </NotificationProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
