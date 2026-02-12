import { ApiTraceEntry } from '@/types/api-trace';

const STORAGE_KEYS = {
  SESSIONS: 'api-traces-sessions',
  CURRENT_SESSION: 'api-traces-current-session',
} as const;

interface SessionInfo {
  sessionId: string;
  createdAt: string;
  entryCount: number;
}

interface SerializedApiTraceEntry {
  id: string;
  timestamp: string;
  source: 'backend' | 'contract';
  method: 'GET' | 'POST' | 'CALL';
  endpoint: string;
  request?: object;
  response: object;
  status: number;
  duration: number;
}

function getSessionStorageKey(sessionId: string): string {
  return `api-traces-${sessionId}`;
}

export function createNewSession(): string {
  const sessionId = crypto.randomUUID();
  const sessionInfo: SessionInfo = {
    sessionId,
    createdAt: new Date().toISOString(),
    entryCount: 0,
  };

  // Get existing sessions
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const sessions: SessionInfo[] = sessionsJson ? JSON.parse(sessionsJson) : [];
  
  // Add new session at the beginning
  sessions.unshift(sessionInfo);
  
  // Keep only last 50 sessions to avoid storage bloat
  const limitedSessions = sessions.slice(0, 50);
  
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(limitedSessions));
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
  
  return sessionId;
}

export function getCurrentSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
}

export function getOrCreateCurrentSession(): string {
  const currentSessionId = getCurrentSessionId();
  if (currentSessionId) {
    return currentSessionId;
  }
  return createNewSession();
}

export function saveTracesToSession(sessionId: string, entries: ApiTraceEntry[]): void {
  const serialized: SerializedApiTraceEntry[] = entries.map(entry => ({
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }));
  
  localStorage.setItem(getSessionStorageKey(sessionId), JSON.stringify(serialized));
  
  // Update or add session info
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const sessions: SessionInfo[] = sessionsJson ? JSON.parse(sessionsJson) : [];
  
  const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);
  if (sessionIndex !== -1) {
    // Update existing session
    sessions[sessionIndex].entryCount = entries.length;
  } else {
    // Add new session (e.g., when loading an old session that was removed from list)
    // Try to get creation date from the first trace, or use current time
    const firstTrace = entries.length > 0 ? entries[entries.length - 1] : null;
    const createdAt = firstTrace 
      ? firstTrace.timestamp.toISOString() 
      : new Date().toISOString();
    
    sessions.unshift({
      sessionId,
      createdAt,
      entryCount: entries.length,
    });
    
    // Keep only last 50 sessions
    const limitedSessions = sessions.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(limitedSessions));
    return;
  }
  
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function loadTracesFromSession(sessionId: string): ApiTraceEntry[] {
  const tracesJson = localStorage.getItem(getSessionStorageKey(sessionId));
  if (!tracesJson) {
    return [];
  }
  
  try {
    const serialized: SerializedApiTraceEntry[] = JSON.parse(tracesJson);
    return serialized.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error('Error loading traces from session:', error);
    return [];
  }
}

export function getAllSessions(): SessionInfo[] {
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!sessionsJson) {
    return [];
  }
  
  try {
    return JSON.parse(sessionsJson);
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export function setCurrentSession(sessionId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
}
