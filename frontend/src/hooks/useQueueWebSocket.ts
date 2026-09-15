import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../utils/constants';

export interface WebSocketQueueEvent {
  event: string;
  queue_id: number;
  now_serving?: string;
  waiting_count?: number;
  estimated_wait_minutes?: number;
  data?: Record<string, unknown>;
}

export const useQueueWebSocket = (queueId?: number) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<WebSocketQueueEvent | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);

  const connect = useCallback(() => {
    if (!queueId || queueId <= 0) return;

    const wsUrl = `${WS_BASE_URL}/ws/queue/${queueId}`;
    console.log(`[WebSocket] Connecting to ${wsUrl}...`);

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log(`[WebSocket] Connected to queue #${queueId}`);
        setIsConnected(true);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsedData: WebSocketQueueEvent = JSON.parse(event.data);
          console.log('[WebSocket Event Received]:', parsedData);
          setLastEvent(parsedData);
        } catch {
          // Plain text message
          console.log('[WebSocket Message]:', event.data);
        }
      };

      ws.onerror = (err) => {
        console.error('[WebSocket Error]:', err);
      };

      ws.onclose = () => {
        console.log(`[WebSocket] Connection closed for queue #${queueId}`);
        setIsConnected(false);
        socketRef.current = null;

        // Auto reconnect logic
        if (shouldReconnectRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting automatic reconnection...');
            connect();
          }, 3000);
        }
      };
    } catch (err) {
      console.error('[WebSocket Exception]:', err);
      setIsConnected(false);
    }
  }, [queueId]);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastEvent };
};
