import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, Slide, SlideProps } from '@mui/material';

// Color palette
const green = '#2E7D32';
const greenLight = '#E8F5E9';
const red = '#D32F2F';
const redLight = '#FFEBEE';
const blue = '#1976D2';
const blueLight = '#E3F2FD';

type NotificationSeverity = 'success' | 'error' | 'info';

type Notification = {
  id: number;
  message: string;
  severity: NotificationSeverity;
};

type NotificationContextType = {
  showNotification: (message: string, severity?: NotificationSeverity) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const notificationColors = {
  success: {
    background: greenLight,
    color: green,
    border: green,
  },
  error: {
    background: redLight,
    color: red,
    border: red,
  },
  info: {
    background: blueLight,
    color: blue,
    border: blue,
  },
};

const NotificationContext = createContext<NotificationContextType | null>(null);

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (message: string, severity: NotificationSeverity = 'success') => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, severity }]);
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string) => showNotification(message, 'success'),
    [showNotification],
  );

  const showError = useCallback(
    (message: string) => showNotification(message, 'error'),
    [showNotification],
  );

  const showInfo = useCallback(
    (message: string) => showNotification(message, 'info'),
    [showNotification],
  );

  const handleClose = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showInfo }}>
      {children}
      {notifications.map((notification, index) => {
        const colors = notificationColors[notification.severity];
        return (
          <Snackbar
            key={notification.id}
            open={true}
            autoHideDuration={4000}
            onClose={() => handleClose(notification.id)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={SlideTransition}
            sx={{
              top: `${24 + index * 60}px !important`,
            }}
          >
            <Alert
              onClose={() => handleClose(notification.id)}
              severity={notification.severity}
              variant="outlined"
              sx={{
                width: '100%',
                minWidth: 280,
                backgroundColor: colors.background,
                color: colors.color,
                borderColor: colors.border,
                borderWidth: 2,
                '& .MuiAlert-icon': {
                  color: colors.color,
                },
                '& .MuiAlert-action .MuiIconButton-root': {
                  color: colors.color,
                },
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        );
      })}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
