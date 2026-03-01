'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Circle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface WsMessage {
  id: string;
  direction: 'sent' | 'received';
  data: string;
  timestamp: Date;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function WebSocketPanel() {
  const [url, setUrl] = useState('wss://');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMessage = useCallback((msg: WsMessage) => {
    setMessages((prev) => [...prev, msg]);
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
    } catch (err) {
      setStatus('disconnected');
      toast.error(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [url, cleanup, addMessage]);

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
  }, [message, addMessage]);

  const clearLog = useCallback(() => setMessages([]), []);

  // Auto-reconnect
  useEffect(() => {
    if (autoReconnect && status === 'disconnected' && url.trim()) {
      reconnectTimerRef.current = setTimeout(connect, 3000);
    }
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [autoReconnect, status, url, connect]);

  // Auto-scroll
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const statusDot =
    status === 'connected'
      ? 'text-green-500'
      : status === 'connecting'
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Circle className={`absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 fill-current ${statusDot}`} />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="wss://echo.websocket.org"
            className="pl-8 font-mono text-sm"
          />
        </div>
        {status === 'disconnected' ? (
          <Button onClick={connect}>Connect</Button>
        ) : (
          <Button variant="destructive" onClick={disconnect}>
            Disconnect
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="auto-reconnect"
            checked={autoReconnect}
            onCheckedChange={(c) => setAutoReconnect(!!c)}
          />
          <label htmlFor="auto-reconnect" className="cursor-pointer text-xs text-muted-foreground">
            Auto-reconnect
          </label>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{status}</span>
      </div>

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message to send..."
          rows={2}
          className="flex-1 font-mono text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="flex flex-col gap-1">
          <Button onClick={sendMessage} disabled={status !== 'connected'} className="h-full">
            Send
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Message log ({messages.length})
          </p>
          <Button variant="ghost" size="sm" onClick={clearLog} className="h-7 text-xs">
            <Trash2 className="mr-1 h-3 w-3" />
            Clear
          </Button>
        </div>

        <div
          ref={logRef}
          className="h-80 overflow-y-auto rounded-md border border-border bg-muted/30 p-3"
        >
          {messages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">
              No messages yet. Connect and start sending.
            </p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 py-1 font-mono text-xs ${msg.direction === 'sent'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-green-600 dark:text-green-400'
                }`}
            >
              {msg.direction === 'sent' ? (
                <ArrowUp className="mt-0.5 h-3 w-3 shrink-0" />
              ) : (
                <ArrowDown className="mt-0.5 h-3 w-3 shrink-0" />
              )}
              <span className="shrink-0 text-muted-foreground">
                {msg.timestamp.toLocaleTimeString()}
              </span>
              <span className="break-all">{msg.data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
