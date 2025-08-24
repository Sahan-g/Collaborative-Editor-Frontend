// src/hooks/useDocSocket.ts
import { useEffect, useRef, useState } from "react";

export type ClientInsert = { type: "insert"; pos: number; text: string; version: number };
export type ClientDelete = { type: "delete"; pos: number; len: number; version: number };
export type ClientUndo   = { type: "undo" };
export type ClientMsg = ClientInsert | ClientDelete | ClientUndo;

export type ServerOp = {
  type: "operation";
  op: { type: "insert" | "delete" | "undo"; pos: number; text?: string; len?: number; version: number };
};

export type InitialStateMsg = { type: "initial_state" };
export type ErrorMsg = { type: "error"; message: string; code: "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT"; current_version?: number };
export type ServerMsg = ServerOp | InitialStateMsg | ErrorMsg;

const BACKEND_URL = "https://cautious-dollop-rwwq5vgpxx6369g-8080.app.github.dev";
const BACKEND_WS_URL = BACKEND_URL.replace('https://', 'wss://');
const CONNECTION_TIMEOUT = 5000;
const MAX_RETRIES = 3;

export function makeWsUrl(_: string, docId: string, token: string) {
  const wsUrl = `${BACKEND_WS_URL}/ws/doc/${docId}?token=${encodeURIComponent(token)}`;
  return wsUrl;
}

type UseDocSocketOpts = {
  wsUrl: string;
  onServerOperation: (op: ServerOp["op"]) => void;
  onError?: (err: ErrorMsg) => void;
  onReady?: () => void;
};

export function useDocSocket({ wsUrl, onServerOperation, onError, onReady }: UseDocSocketOpts) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const timeoutsRef = useRef<number[]>([]);
  const retryCountRef = useRef(0);
  const isConnectingRef = useRef(false);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  const cleanup = () => {
    clearTimeouts();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    isConnectingRef.current = false;
  };

  const setupWebSocket = () => {
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    cleanup();
    isConnectingRef.current = true;
    setStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Set connection timeout
      const connectionTimeout = window.setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      }, CONNECTION_TIMEOUT);
      timeoutsRef.current.push(connectionTimeout);

      ws.onopen = () => {
        clearTimeouts();
        isConnectingRef.current = false;
        retryCountRef.current = 0;
        setStatus("open");
        onReady?.();
      };

      ws.onclose = (event) => {
        clearTimeouts();
        isConnectingRef.current = false;
        wsRef.current = null;

        if (event.wasClean) {
          setStatus("closed");
          return;
        }

        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          retryCountRef.current++;

          const retryTimeout = window.setTimeout(() => {
            setupWebSocket();
          }, delay);
          timeoutsRef.current.push(retryTimeout);
        } else {
          setStatus("closed");
          onError?.({
            type: "error",
            code: "FORBIDDEN",
            message: `Connection failed after ${MAX_RETRIES} attempts`
          });
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onmessage = (evt) => {
        try {
          const msg: ServerMsg = JSON.parse(evt.data);
          switch (msg.type) {
            case "initial_state":
              onReady?.();
              break;
            case "operation":
              onServerOperation(msg.op);
              break;
            case "error":
              onError?.(msg);
              break;
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      isConnectingRef.current = false;
      setStatus("closed");
      onError?.({
        type: "error",
        code: "FORBIDDEN",
        message: "Failed to create WebSocket connection"
      });
    }
  };

  useEffect(() => {
    setupWebSocket();
    return cleanup;
  }, [wsUrl]);

  const send = (msg: ClientMsg): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      ws.send(JSON.stringify(msg));
      return true;
    } catch (e) {
      console.error("Error sending message:", e);
      return false;
    }
  };

  return { status, send };
}
