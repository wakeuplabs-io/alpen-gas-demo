import { useState } from 'react';
import { Code2, Activity, ChevronDown, ChevronRight, ArrowRight, Maximize2, Download, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MermaidDiagram } from '@/components/MermaidDiagram';

import { ApiTraceEntry } from '@/types/api-trace';

import { useApiTrace } from '@/contexts/api-trace-context';

export function DeveloperPanel() {
  const { entries, currentSessionId, previousSessions, startNewSession, loadSession } = useApiTrace();
  
  return (
    <Card className="border-border bg-card h-full">
      <Tabs defaultValue="notes" className="h-full flex flex-col">
        <CardHeader className="pb-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes" className="flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" />
              Developer Notes
            </TabsTrigger>
            <TabsTrigger value="trace" className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              API Trace
              {entries.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1">
                  {entries.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden pt-4">
          <TabsContent value="notes" className="h-full m-0 overflow-y-auto">
            <DeveloperNotes />
          </TabsContent>
          <TabsContent value="trace" className="h-full m-0 overflow-y-auto">
            <ApiTraceList 
              entries={entries} 
              currentSessionId={currentSessionId}
              previousSessions={previousSessions}
              onNewSession={startNewSession}
              onLoadSession={loadSession}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

const sequenceDiagram = `
sequenceDiagram
    participant Frontend
    participant Privy
    participant Backend
    participant AlpenChain as Alpen Chain
    participant Batch as BatchCall&Sponsor
    participant Whitelist as SponsorWhitelist
    participant Counter

    Frontend->>Privy: connect()
    Privy-->>Frontend: wallet

    Frontend->>AlpenChain: getBalance(user)
    AlpenChain-->>Frontend: 0 BTC

    Frontend->>Privy: checkEligibility()
    Privy->>Backend: checkEligibility(user)
    Backend->>Whitelist: check
    Whitelist-->>Backend: eligible
    Backend-->>Privy: eligible
    Privy-->>Frontend: eligible

    Frontend->>Privy: signAuthorization()
    Note over Privy: user signs
    Privy-->>Frontend: authorization

    Frontend->>Backend: setupDelegate(auth)
    Backend->>Batch: type4 tx (EIP-7702)
    Note over AlpenChain: user EOA code = 0xef0100+...
    Batch-->>Backend: txHash
    Backend-->>Frontend: txHash

    Frontend->>Privy: signMessage(digest)
    Note over Privy: user signs
    Privy-->>Frontend: signature

    Frontend->>Backend: transactDelegate(sig)
    Backend->>Batch: execute(calls, sig)

    Batch->>Whitelist: validateSponsorship()
    Whitelist-->>Batch: validated

    Batch->>Counter: increment()
    Counter-->>Batch: ok

    Batch-->>Backend: txHash
    Backend-->>Frontend: txHash
`;

function DeveloperNotes() {
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6 text-sm">
        {/* Overview */}
        <section>
          <h3 className="font-medium mb-2">Overview</h3>
          <p className="text-muted-foreground">
            This demo shows the minimal flow for a zero-balance SCA wallet to interact 
            with an EVM chain where gas is paid in BTC.
          </p>
        </section>

        {/* Flow Bullets */}
        <section>
          <h3 className="font-medium mb-2">Flow Summary</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Frontend connects wallet via Privy and detects 0 BTC balance</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Backend checks eligibility via SponsorWhitelist contract (daily limit, allowlist, global cap)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>User signs EIP-7702 authorization via Privy, Backend submits type-4 transaction to activate delegation</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>User signs transaction digest via Privy, Backend calls execute() on delegated contract</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span>BatchCallAndSponsor validates sponsorship and executes calls to Counter contract</span>
            </li>
          </ul>
        </section>

        {/* Sequence Diagram */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Sequence</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDiagramModalOpen(true)}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Expand</span>
            </Button>
          </div>
          <MermaidDiagram chart={sequenceDiagram} />
        </section>

        {/* Callout */}
        <section className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <p className="text-xs">
            <strong className="text-primary">Note:</strong> On this chain, native gas is BTC, 
            but the dapp interaction pattern is still EVM-style. Sponsorship covers BTC gas 
            so users with 0 balance can still transact.
          </p>
        </section>
      </div>

      {/* Diagram Modal */}
      <Dialog open={isDiagramModalOpen} onOpenChange={setIsDiagramModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-card border-border overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Sequence Diagram</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4">
            <MermaidDiagram chart={sequenceDiagram} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ApiTraceListProps {
  entries: ApiTraceEntry[];
  currentSessionId: string;
  previousSessions: Array<{ sessionId: string; createdAt: string; entryCount: number }>;
  onNewSession: () => void;
  onLoadSession: (sessionId: string) => void;
}

function ApiTraceList({ entries, currentSessionId, previousSessions, onNewSession, onLoadSession }: ApiTraceListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { exportTrace } = useApiTrace();

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Ensure current session is in the list
  const sessionsToShow = [...previousSessions];
  const currentSessionInList = sessionsToShow.find(s => s.sessionId === currentSessionId);
  if (!currentSessionInList && currentSessionId) {
    sessionsToShow.unshift({
      sessionId: currentSessionId,
      createdAt: new Date().toISOString(),
      entryCount: entries.length,
    });
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Only show empty message if no entries and no previous sessions
  if (entries.length === 0 && previousSessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No API calls yet. Connect your wallet to see the trace.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={currentSessionId} onValueChange={onLoadSession}>
            <SelectTrigger className="h-7 text-xs flex-1 max-w-[200px]">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessionsToShow.length === 0 ? (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  No sessions available
                </div>
              ) : (
                sessionsToShow.map(session => (
                  <SelectItem key={session.sessionId} value={session.sessionId}>
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-xs">{formatSessionDate(session.createdAt)}</span>
                      <Badge variant="secondary" className="h-4 text-[10px] px-1">
                        {session.entryCount}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            className="h-7 px-2 text-xs"
            title="Start new session"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportTrace}
          className="h-7 px-2 text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export Trace
        </Button>
      </div>
      {entries.map(entry => (
        <div key={entry.id} className="api-trace-row">
          <div
            className="api-trace-header"
            onClick={() => toggleExpand(entry.id)}
          >
            <div className="flex items-center gap-2">
              {expanded.has(entry.id) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Badge 
                variant="outline" 
                className={`text-[10px] font-mono ${
                  entry.source === 'backend' 
                    ? 'text-blue-500 border-blue-500/30' 
                    : 'text-purple-500 border-purple-500/30'
                }`}
              >
                {entry.source === 'backend' ? 'Backend' : 'Contract'}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-[10px] font-mono ${
                  entry.method === 'GET' ? 'text-info border-info/30' : 
                  entry.method === 'POST' ? 'text-success border-success/30' :
                  'text-warning border-warning/30'
                }`}
              >
                {entry.method}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px]">
                {entry.endpoint}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={entry.status === 200 ? 'text-success' : 'text-destructive'}>
                {entry.status}
              </span>
              <span className="text-muted-foreground">{entry.duration}ms</span>
            </div>
          </div>
          
          {expanded.has(entry.id) && (
            <div className="api-trace-body">
              {entry.request && (
                <div className="mb-2">
                  <div className="text-muted-foreground mb-1">Request:</div>
                  <pre className="text-foreground whitespace-pre-wrap">
                    {JSON.stringify(entry.request, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <div className="text-muted-foreground mb-1">Response:</div>
                <pre className="text-foreground whitespace-pre-wrap">
                  {JSON.stringify(entry.response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* New Session Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Start New Session?
            </DialogTitle>
            <DialogDescription>
              This will create a new API trace session. The current session will be saved and you can access it later from the session history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {entries.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Current Session</div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Entries:</span>{' '}
                  <span className="font-medium">{entries.length}</span>
                </div>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-primary">Note:</strong> Your current session will be automatically saved before starting a new one.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                onNewSession();
                setShowConfirmModal(false);
              }}
            >
              Start New Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
