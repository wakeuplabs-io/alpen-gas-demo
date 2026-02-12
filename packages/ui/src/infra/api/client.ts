import { env } from '@/config/env';
import { ApiTraceEntry } from '@/types/api-trace';

let addTraceCallback: ((entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void) | null = null;

export function setApiTraceCallback(
  callback: (entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void
) {
  addTraceCallback = callback;
}

export async function apiFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const startTime = performance.now();
  const method = (options?.method || 'GET') as 'GET' | 'POST';
  
  const fullUrl = url.startsWith('http') ? url : `${env.apiUrl}${url}`;
  const endpoint = url.startsWith('http') ? new URL(url).pathname : url;
  
  let requestBody: object | undefined;
  if (options?.body) {
    try {
      requestBody = JSON.parse(options.body as string);
    } catch {
      requestBody = undefined;
    }
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const duration = Math.round(performance.now() - startTime);
    
    const clonedResponse = response.clone();
    let responseBody: object;
    try {
      responseBody = await clonedResponse.json();
    } catch {
      responseBody = { error: 'Failed to parse response' };
    }

    if (addTraceCallback) {
      addTraceCallback({
        source: 'backend',
        method,
        endpoint,
        request: requestBody,
        response: responseBody,
        status: response.status,
        duration,
      });
    }

    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    
    if (addTraceCallback) {
      addTraceCallback({
        source: 'backend',
        method,
        endpoint,
        request: requestBody,
        response: { error: error instanceof Error ? error.message : 'Unknown error' },
        status: 0,
        duration,
      });
    }

    throw error;
  }
}
