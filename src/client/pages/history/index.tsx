import { RefObject, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import MouseIcon from '@mui/icons-material/Mouse';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Nav from 'client/components/Nav';
import fetchClient from 'client/helpers/fetchClient';

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

type HistoryProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getSeverityColor(severity: string): 'success' | 'error' | 'info' {
  switch (severity) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
}

const History = ({ currentUserRef, loadCookieSession }: HistoryProps) => {
  const currentUser = currentUserRef.current;
  const userEmail = currentUser?.email || '';
  const isEmailVerified = Boolean(currentUser?.emailVerified);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      const response = await fetchClient.get<{ events: SessionEvent[] }>(
        '/api/session-history/events',
      );
      setEvents(response.events || []);
      setIsLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <Box className="app">
      <Nav
        userEmail={userEmail}
        isEmailVerified={isEmailVerified}
        loadCookieSession={loadCookieSession}
      />
      <Box className="content">
        <Container maxWidth="md">
          <Box sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Session History
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : events.length === 0 ? (
              <Typography color="text.secondary">
                No events recorded yet. Click around or trigger some notifications!
              </Typography>
            ) : (
              <Stack spacing={2}>
                {events.map((event, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {event.type === 'click' ? (
                          <MouseIcon color="action" />
                        ) : (
                          <NotificationsIcon color="primary" />
                        )}
                        <Box sx={{ flexGrow: 1 }}>
                          {event.type === 'click' ? (
                            <ClickEventDisplay data={event.data as ClickEventData} />
                          ) : (
                            <NotificationEventDisplay data={event.data as ApiNotificationData} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(event.timestamp)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

function ClickEventDisplay({ data }: { data: ClickEventData }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="Click" size="small" variant="outlined" />
        <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>
          &lt;{data.tagName}&gt;
        </Typography>
        {data.id && (
          <Typography variant="body2" component="span" color="text.secondary">
            #{data.id}
          </Typography>
        )}
      </Box>
      {data.textContent && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
          "{data.textContent}"
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary">
        on {data.path}
      </Typography>
    </Box>
  );
}

function NotificationEventDisplay({ data }: { data: ApiNotificationData }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label="Notification"
          size="small"
          color={getSeverityColor(data.severity)}
          variant="outlined"
        />
        <Chip label={data.severity} size="small" color={getSeverityColor(data.severity)} />
      </Box>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {data.message}
      </Typography>
    </Box>
  );
}

export default History;
