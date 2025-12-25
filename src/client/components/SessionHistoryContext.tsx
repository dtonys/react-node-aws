import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import fetchClient from 'client/helpers/fetchClient';

// Event types matching backend
type ClickEventData = {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  path: string;
};

type ApiNotificationData = {
  message: string;
  severity: 'success' | 'error' | 'info';
};

type SessionEvent = {
  type: 'click' | 'api_notification';
  timestamp: string;
  data: ClickEventData | ApiNotificationData;
};

type SessionHistoryContextType = {
  trackClick: (element: HTMLElement) => void;
  trackApiNotification: (message: string, severity: 'success' | 'error' | 'info') => void;
  clearHistory: () => Promise<void>;
};

const SessionHistoryContext = createContext<SessionHistoryContextType | null>(null);

type SessionHistoryProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

export function SessionHistoryProvider({ children, enabled }: SessionHistoryProviderProps) {
  const sendEvent = useCallback(
    async (event: SessionEvent) => {
      if (!enabled) return;
      await fetchClient.post('/api/session-history/events', event);
    },
    [enabled],
  );

  const trackClick = useCallback(
    (element: HTMLElement) => {
      const event: SessionEvent = {
        type: 'click',
        timestamp: new Date().toISOString(),
        data: {
          tagName: element.tagName.toLowerCase(),
          id: element.id || undefined,
          className: element.className || undefined,
          textContent: element.textContent?.slice(0, 50) || undefined,
          path: window.location.pathname,
        },
      };
      void sendEvent(event);
    },
    [sendEvent],
  );

  const trackApiNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info') => {
      const event: SessionEvent = {
        type: 'api_notification',
        timestamp: new Date().toISOString(),
        data: {
          message,
          severity,
        },
      };
      void sendEvent(event);
    },
    [sendEvent],
  );

  const clearHistory = useCallback(async () => {
    if (!enabled) return;
    await fetchClient.delete('/api/session-history/events');
  }, [enabled]);

  // Global click listener
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        trackClick(target);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [enabled, trackClick]);

  return (
    <SessionHistoryContext.Provider value={{ trackClick, trackApiNotification, clearHistory }}>
      {children}
    </SessionHistoryContext.Provider>
  );
}

export function useSessionHistory() {
  const context = useContext(SessionHistoryContext);
  if (!context) {
    throw new Error('useSessionHistory must be used within a SessionHistoryProvider');
  }
  return context;
}
