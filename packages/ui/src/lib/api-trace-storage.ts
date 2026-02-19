import { ApiTraceEntry } from '@/types/api-trace';

const STORAGE_KEYS = {
  SESSIONS: 'api-traces-sessions',
  CURRENT_SESSION: 'api-traces-current-session',
} as const;

interface SessionInfo {
  sessionId: string;
  createdAt: string;
  entryCount: number;
  walletAddress?: string;
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

function getSessionStorageKey(sessionId: string, walletAddress?: string): string {
  if (walletAddress) {
    return `api-traces-${walletAddress.toLowerCase()}-${sessionId}`;
  }
  return `api-traces-${sessionId}`;
}

function getCurrentSessionKey(walletAddress?: string): string {
  if (walletAddress) {
    return `${STORAGE_KEYS.CURRENT_SESSION}-${walletAddress.toLowerCase()}`;
  }
  return STORAGE_KEYS.CURRENT_SESSION;
}

export function createNewSession(walletAddress?: string): string {
  const sessionId = crypto.randomUUID();
  const sessionInfo: SessionInfo = {
    sessionId,
    createdAt: new Date().toISOString(),
    entryCount: 0,
    walletAddress: walletAddress?.toLowerCase(),
  };

  // Get existing sessions for this wallet (or all if no wallet)
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const allSessions: SessionInfo[] = sessionsJson ? JSON.parse(sessionsJson) : [];
  
  // Filter sessions by wallet if provided
  const walletSessions = walletAddress 
    ? allSessions.filter(s => s.walletAddress?.toLowerCase() === walletAddress.toLowerCase())
    : allSessions.filter(s => !s.walletAddress);
  
  // Add new session at the beginning
  walletSessions.unshift(sessionInfo);
  
  // Keep only last 50 sessions per wallet to avoid storage bloat
  const limitedWalletSessions = walletSessions.slice(0, 50);
  
  // Merge back with other wallet sessions
  const otherSessions = walletAddress
    ? allSessions.filter(s => s.walletAddress?.toLowerCase() !== walletAddress.toLowerCase())
    : allSessions.filter(s => s.walletAddress);
  
  const updatedSessions = [...limitedWalletSessions, ...otherSessions];
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
  localStorage.setItem(getCurrentSessionKey(walletAddress), sessionId);
  
  return sessionId;
}

export function getCurrentSessionId(walletAddress?: string): string | null {
  return localStorage.getItem(getCurrentSessionKey(walletAddress));
}

export function getOrCreateCurrentSession(walletAddress?: string): string {
  const currentSessionId = getCurrentSessionId(walletAddress);
  if (currentSessionId) {
    return currentSessionId;
  }
  return createNewSession(walletAddress);
}

export function saveTracesToSession(sessionId: string, entries: ApiTraceEntry[], walletAddress?: string): void {
  const serialized: SerializedApiTraceEntry[] = entries.map(entry => ({
    ...entry,
    timestamp: entry.timestamp.toISOString(),
  }));
  
  localStorage.setItem(getSessionStorageKey(sessionId, walletAddress), JSON.stringify(serialized));
  
  // Update or add session info
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  const allSessions: SessionInfo[] = sessionsJson ? JSON.parse(sessionsJson) : [];
  
  const sessionIndex = allSessions.findIndex(s => s.sessionId === sessionId);
  if (sessionIndex !== -1) {
    // Update existing session
    allSessions[sessionIndex].entryCount = entries.length;
    if (walletAddress && !allSessions[sessionIndex].walletAddress) {
      allSessions[sessionIndex].walletAddress = walletAddress.toLowerCase();
    }
  } else {
    // Add new session (e.g., when loading an old session that was removed from list)
    // Try to get creation date from the first trace, or use current time
    const firstTrace = entries.length > 0 ? entries[entries.length - 1] : null;
    const createdAt = firstTrace 
      ? firstTrace.timestamp.toISOString() 
      : new Date().toISOString();
    
    const newSession: SessionInfo = {
      sessionId,
      createdAt,
      entryCount: entries.length,
      walletAddress: walletAddress?.toLowerCase(),
    };
    
    // Filter sessions by wallet if provided
    const walletSessions = walletAddress 
      ? allSessions.filter(s => s.walletAddress?.toLowerCase() === walletAddress.toLowerCase())
      : allSessions.filter(s => !s.walletAddress);
    
    walletSessions.unshift(newSession);
    
    // Keep only last 50 sessions per wallet
    const limitedWalletSessions = walletSessions.slice(0, 50);
    
    // Merge back with other wallet sessions
    const otherSessions = walletAddress
      ? allSessions.filter(s => s.walletAddress?.toLowerCase() !== walletAddress.toLowerCase())
      : allSessions.filter(s => s.walletAddress);
    
    const updatedSessions = [...limitedWalletSessions, ...otherSessions];
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
    return;
  }
  
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions));
}

export function loadTracesFromSession(sessionId: string, walletAddress?: string): ApiTraceEntry[] {
  // Try to load with wallet address first, then fallback to old format
  let tracesJson = localStorage.getItem(getSessionStorageKey(sessionId, walletAddress));
  if (!tracesJson && walletAddress) {
    // Fallback: try to find session by ID in all storage keys
    const sessionInfo = getSessionInfo(sessionId);
    if (sessionInfo?.walletAddress) {
      tracesJson = localStorage.getItem(getSessionStorageKey(sessionId, sessionInfo.walletAddress));
    }
  }
  if (!tracesJson) {
    // Final fallback: try old format without wallet
    tracesJson = localStorage.getItem(getSessionStorageKey(sessionId));
  }
  
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

function getSessionInfo(sessionId: string): SessionInfo | null {
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!sessionsJson) {
    return null;
  }
  
  try {
    const sessions: SessionInfo[] = JSON.parse(sessionsJson);
    return sessions.find(s => s.sessionId === sessionId) || null;
  } catch (error) {
    console.error('Error loading session info:', error);
    return null;
  }
}

export function getAllSessions(walletAddress?: string): SessionInfo[] {
  const sessionsJson = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!sessionsJson) {
    return [];
  }
  
  try {
    const allSessions: SessionInfo[] = JSON.parse(sessionsJson);
    if (walletAddress) {
      // Filter sessions by wallet address
      return allSessions.filter(s => s.walletAddress?.toLowerCase() === walletAddress.toLowerCase());
    }
    // If no wallet address, return sessions without wallet (for backward compatibility)
    return allSessions.filter(s => !s.walletAddress);
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
}

export function setCurrentSession(sessionId: string, walletAddress?: string): void {
  localStorage.setItem(getCurrentSessionKey(walletAddress), sessionId);
}
