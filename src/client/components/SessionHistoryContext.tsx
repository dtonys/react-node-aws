import { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
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

const BATCH_SIZE = 5;
const FLUSH_INTERVAL_MS = 5000; // Flush after 5 seconds even if batch not full

type SessionHistoryProviderProps = {
  children: ReactNode;
  enabled: boolean;
};

export function SessionHistoryProvider({ children, enabled }: SessionHistoryProviderProps) {
  const eventQueueRef = useRef<SessionEvent[]>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushEvents = useCallback(async () => {
    if (!enabled || eventQueueRef.current.length === 0) return;

    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    // Clear any pending flush timeout
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    await fetchClient.post('/api/session-history/events', { events: eventsToSend });
  }, [enabled]);

  const queueEvent = useCallback(
    (event: SessionEvent) => {
      if (!enabled) return;

      eventQueueRef.current.push(event);

      // Flush immediately if batch size reached
      if (eventQueueRef.current.length >= BATCH_SIZE) {
        void flushEvents();
      } else if (!flushTimeoutRef.current) {
        // Set a timeout to flush after interval if batch not full
        flushTimeoutRef.current = setTimeout(() => {
          flushTimeoutRef.current = null;
          void flushEvents();
        }, FLUSH_INTERVAL_MS);
      }
    },
    [enabled, flushEvents],
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
      queueEvent(event);
    },
    [queueEvent],
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
      queueEvent(event);
    },
    [queueEvent],
  );

  const clearHistory = useCallback(async () => {
    if (!enabled) return;
    // Flush any pending events before clearing
    await flushEvents();
    await fetchClient.delete('/api/session-history/events');
  }, [enabled, flushEvents]);

  // Flush events on unmount or when disabled
  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      // Flush remaining events synchronously isn't possible,
      // but we clear the timeout to prevent memory leaks
    };
  }, []);

  // Flush events before page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (eventQueueRef.current.length > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({ events: eventQueueRef.current });
        navigator.sendBeacon('/api/session-history/events', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
