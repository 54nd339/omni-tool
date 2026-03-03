'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface WsMessage {
  id: string;
  direction: 'sent' | 'received';
  data: string;
  timestamp: Date;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function useWebsocketClient() {
  const [url, setUrl] = useState('wss://');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMessage = useCallback((nextMessage: WsMessage) => {
    setMessages((prev) => [...prev, nextMessage]);
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('Enter a WebSocket URL');
      return;
    }

    cleanup();
    setStatus('connecting');

    try {
      const ws = new WebSocket(trimmed);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        toast.success('Connected');
      };

      ws.onmessage = (event) => {
        addMessage({
          id: crypto.randomUUID(),
          direction: 'received',
          data: typeof event.data === 'string' ? event.data : '[Binary data]',
          timestamp: new Date(),
        });
      };

      ws.onerror = () => {
        toast.error('WebSocket error');
      };

      ws.onclose = (event) => {
        setStatus('disconnected');
        if (event.wasClean) {
          addMessage({
            id: crypto.randomUUID(),
            direction: 'received',
            data: `[Connection closed: code=${event.code} reason=${event.reason || 'none'}]`,
            timestamp: new Date(),
          });
        }
      };
    } catch (error) {
      setStatus('disconnected');
      toast.error(error instanceof Error ? error.message : 'Failed to connect');
    }
  }, [addMessage, cleanup, url]);

  const disconnect = useCallback(() => {
    cleanup();
    setStatus('disconnected');
  }, [cleanup]);

  const sendMessage = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected');
      return;
    }
    if (!message.trim()) return;

    wsRef.current.send(message);
    addMessage({
      id: crypto.randomUUID(),
      direction: 'sent',
      data: message,
      timestamp: new Date(),
    });
    setMessage('');
  }, [addMessage, message]);

  const clearLog = useCallback(() => setMessages([]), []);

  useEffect(() => {
    if (autoReconnect && status === 'disconnected' && url.trim()) {
      reconnectTimerRef.current = setTimeout(connect, 3000);
    }
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [autoReconnect, connect, status, url]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => cleanup, [cleanup]);

  return {
    autoReconnect,
    clearLog,
    connect,
    disconnect,
    logRef,
    message,
    messages,
    sendMessage,
    setAutoReconnect,
    setMessage,
    setUrl,
    status,
    url,
  };
}