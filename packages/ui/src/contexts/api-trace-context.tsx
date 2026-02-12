import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ApiTraceEntry } from '@/types/api-trace';

interface ApiTraceContextValue {
  entries: ApiTraceEntry[];
  addTrace: (entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void;
  clearTraces: () => void;
  exportTrace: () => void;
}

const ApiTraceContext = createContext<ApiTraceContextValue | undefined>(undefined);

export function ApiTraceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ApiTraceEntry[]>([]);

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

  const exportTrace = useCallback(() => {
    if (entries.length === 0) {
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
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
  }, [entries]);

  return (
    <ApiTraceContext.Provider value={{ entries, addTrace, clearTraces, exportTrace }}>
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
