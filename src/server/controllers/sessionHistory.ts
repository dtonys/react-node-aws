import express, { Request, Response } from 'express';
import { getRedisClient } from 'server/helpers/redis';
import AuthController from 'server/controllers/auth';

// Event types
type SessionEvent = {
  type: 'click' | 'api_notification';
  timestamp: string;
  data: ClickEventData | ApiNotificationData;
};

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

// Key prefix for session history
const SESSION_HISTORY_PREFIX = 'session-history:';
// TTL for session history (24 hours)
const SESSION_HISTORY_TTL = 60 * 60 * 24;

class SessionHistoryController {
  static init() {
    const router = express.Router();
    router.use('/session-history', AuthController.authMiddleware);
    router.post('/session-history/events', this.recordEvent);
    router.get('/session-history/events', this.getEvents);
    router.delete('/session-history/events', this.clearEvents);
    return router;
  }

  static getSessionKey(sessionToken: string): string {
    return `${SESSION_HISTORY_PREFIX}${sessionToken}`;
  }

  static recordEvent = async (req: Request, res: Response) => {
    const sessionToken = req.cookies['web.session'];
    const { events } = req.body as { events: SessionEvent[] };

    if (!events || !Array.isArray(events) || events.length === 0) {
      res.status(400).json({ error: 'events array is required' });
      return;
    }

    const redis = getRedisClient();
    const key = this.getSessionKey(sessionToken);

    // Add all events to the list
    const serializedEvents = events.map((event) => JSON.stringify(event));
    await redis.rpush(key, ...serializedEvents);
    // Set/refresh TTL
    await redis.expire(key, SESSION_HISTORY_TTL);

    res.json({ success: true, count: events.length });
  };

  static getEvents = async (req: Request, res: Response) => {
    const sessionToken = req.cookies['web.session'];

    const redis = getRedisClient();
    const key = this.getSessionKey(sessionToken);

    // Get all events and reverse to show most recent first
    const events = await redis.lrange(key, 0, -1);
    const parsedEvents = events.map((e) => JSON.parse(e) as SessionEvent).reverse();

    res.json({ events: parsedEvents });
  };

  static clearEvents = async (req: Request, res: Response) => {
    const sessionToken = req.cookies['web.session'];

    const redis = getRedisClient();
    const key = this.getSessionKey(sessionToken);

    await redis.del(key);

    res.json({ success: true });
  };

  // Called from logout to clear session history
  static clearSessionHistory = async (sessionToken: string) => {
    const redis = getRedisClient();
    const key = this.getSessionKey(sessionToken);
    await redis.del(key);
  };
}

export default SessionHistoryController;
