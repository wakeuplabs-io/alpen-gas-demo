import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { ApiTraceEntry } from '@/types/api-trace';
import {
  getOrCreateCurrentSession,
  saveTracesToSession,
  loadTracesFromSession,
  getAllSessions,
  createNewSession,
  setCurrentSession,
} from '@/lib/api-trace-storage';

interface ApiTraceContextValue {
  entries: ApiTraceEntry[];
  currentSessionId: string;
  previousSessions: Array<{ sessionId: string; createdAt: string; entryCount: number }>;
  addTrace: (entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void;
  clearTraces: () => void;
  exportTrace: () => void;
  startNewSession: () => void;
  loadSession: (sessionId: string) => void;
}

const ApiTraceContext = createContext<ApiTraceContextValue | undefined>(undefined);

export function ApiTraceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ApiTraceEntry[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [previousSessions, setPreviousSessions] = useState<Array<{ sessionId: string; createdAt: string; entryCount: number }>>([]);

  useEffect(() => {
    const sessionId = getOrCreateCurrentSession();
    setCurrentSessionId(sessionId);
    
    // Load traces from current session
    const loadedTraces = loadTracesFromSession(sessionId);
    setEntries(loadedTraces);
    
    // Load all sessions for history
    const sessions = getAllSessions();
    setPreviousSessions(sessions);
  }, []);

  // Save traces to localStorage whenever entries change
  useEffect(() => {
    if (currentSessionId) {
      saveTracesToSession(currentSessionId, entries);
      
      // Update sessions list
      const sessions = getAllSessions();
      setPreviousSessions(sessions);
    }
  }, [entries, currentSessionId]);

  const addTrace = useCallback((entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => {
    setEntries(prev => [
      {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
      ...prev,
    ]);
  }, []);

  const clearTraces = useCallback(() => {
    setEntries([]);
  }, []);

  const startNewSession = useCallback(() => {
    // Save current session traces before creating new session
    if (currentSessionId) {
      saveTracesToSession(currentSessionId, entries);
    }
    
    // Create new session
    const newSessionId = createNewSession();
    setCurrentSessionId(newSessionId);
    setEntries([]);
    
    // Update sessions list
    const sessions = getAllSessions();
    setPreviousSessions(sessions);
  }, [currentSessionId, entries]);

  const loadSession = useCallback((sessionId: string) => {
    // Save current session traces before switching
    if (currentSessionId && currentSessionId !== sessionId) {
      saveTracesToSession(currentSessionId, entries);
    }
    
    const loadedTraces = loadTracesFromSession(sessionId);
    setCurrentSessionId(sessionId);
    setEntries(loadedTraces);
    
    // Update current session in storage
    setCurrentSession(sessionId);
    
    // Update sessions list
    const sessions = getAllSessions();
    setPreviousSessions(sessions);
  }, [currentSessionId, entries]);

  const exportTrace = useCallback(() => {
    if (entries.length === 0) {
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      sessionId: currentSessionId,
      totalEntries: entries.length,
      entries: entries.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-trace-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [entries, currentSessionId]);

  return (
    <ApiTraceContext.Provider
      value={{
        entries,
        currentSessionId,
        previousSessions,
        addTrace,
        clearTraces,
        exportTrace,
        startNewSession,
        loadSession,
      }}
    >
      {children}
    </ApiTraceContext.Provider>
  );
}

export function useApiTrace() {
  const context = useContext(ApiTraceContext);
  if (context === undefined) {
    throw new Error('useApiTrace must be used within an ApiTraceProvider');
  }
  return context;
}
