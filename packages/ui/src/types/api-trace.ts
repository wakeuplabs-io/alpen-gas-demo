export interface ApiTraceEntry {
  id: string;
  timestamp: Date;
  source: 'backend' | 'contract';
  method: 'GET' | 'POST' | 'CALL';
  endpoint: string;
  request?: object;
  response: object;
  status: number;
  duration: number;
}
