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
import { useWallet } from '@/hooks/use-wallet';

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
  const wallet = useWallet();
  const walletAddress = wallet.address?.toLowerCase();

  useEffect(() => {
    const sessionId = getOrCreateCurrentSession(walletAddress);
    setCurrentSessionId(sessionId);
    
    const loadedTraces = loadTracesFromSession(sessionId, walletAddress);
    setEntries(loadedTraces);
    
    const sessions = getAllSessions(walletAddress);
    setPreviousSessions(sessions);
  }, [walletAddress]);

  useEffect(() => {
    if (currentSessionId) {
      saveTracesToSession(currentSessionId, entries, walletAddress);
      
      // Update sessions list (filtered by wallet)
      const sessions = getAllSessions(walletAddress);
      setPreviousSessions(sessions);
    }
  }, [entries, currentSessionId, walletAddress]);

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
    if (currentSessionId) {
      saveTracesToSession(currentSessionId, entries, walletAddress);
    }
    
    const newSessionId = createNewSession(walletAddress);
    setCurrentSessionId(newSessionId);
    setEntries([]);
    
    const sessions = getAllSessions(walletAddress);
    setPreviousSessions(sessions);
  }, [currentSessionId, entries, walletAddress]);

  const loadSession = useCallback((sessionId: string) => {
    if (currentSessionId && currentSessionId !== sessionId) {
      saveTracesToSession(currentSessionId, entries, walletAddress);
    }
    
    const loadedTraces = loadTracesFromSession(sessionId, walletAddress);
    setCurrentSessionId(sessionId);
    setEntries(loadedTraces);
    
    setCurrentSession(sessionId, walletAddress);
    
    const sessions = getAllSessions(walletAddress);
    setPreviousSessions(sessions);
  }, [currentSessionId, entries, walletAddress]);

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
