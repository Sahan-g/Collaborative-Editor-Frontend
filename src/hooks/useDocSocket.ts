// ============================
// File: hooks/useDocSocket.ts (exposes the live socket; receive-only)
// ============================
import { useEffect, useRef, useState } from "react";

export type ClientInsert = { type: "insert"; pos: number; text: string; version: number };
export type ClientDelete = { type: "delete"; pos: number; len: number; version: number };
export type ClientUndo = { type: "undo" };
export type ClientMsg = ClientInsert | ClientDelete | ClientUndo;

export type ServerOp = {
  type: "operation";
  op: { type: "insert" | "delete" | "undo"; pos: number; text?: string; len?: number; version: number };
};

export type InitialStateMsg = { type: "initial_state" };

export type ErrorMsg = {
  type: "error";
  message: string;
  code: "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT";
  current_version?: number;
};

export type ServerMsg = ServerOp | InitialStateMsg | ErrorMsg;

const BACKEND_URL = "https://organic-meme-xjrggqq9vj539v6p-8080.app.github.dev";
const BACKEND_WS_URL = BACKEND_URL.replace("https://", "wss://");
const CONNECTION_TIMEOUT = 5000;
const MAX_RETRIES = 3;

export function makeWsUrl(_: string, docId: string, token: string) {
  return `${BACKEND_WS_URL}/ws/doc/${encodeURIComponent(docId)}?token=${encodeURIComponent(token)}`;
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
  const [isReady, setIsReady] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  const retryCountRef = useRef(0);
  const isConnectingRef = useRef(false);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const cleanup = () => {
    clearTimeouts();
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
    isConnectingRef.current = false;
    setIsReady(false);
  };

  const setupWebSocket = () => {
    if (!wsUrl || isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) return;

    cleanup();
    isConnectingRef.current = true;
    setStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const t = window.setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) ws.close();
      }, CONNECTION_TIMEOUT);
      timeoutsRef.current.push(t);

      ws.onopen = () => {
        clearTimeouts();
        isConnectingRef.current = false;
        retryCountRef.current = 0;
        setStatus("open");
      };

      ws.onclose = (event) => {
        clearTimeouts();
        isConnectingRef.current = false;
        wsRef.current = null;
        setIsReady(false);

        if (event.wasClean) {
          setStatus("closed");
          return;
        }

        if (retryCountRef.current < MAX_RETRIES) {
          const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          retryCountRef.current++;
          const rt = window.setTimeout(setupWebSocket, delay);
          timeoutsRef.current.push(rt);
        } else {
          setStatus("closed");
          onError?.({ type: "error", code: "FORBIDDEN", message: `Connection failed after ${MAX_RETRIES} attempts` });
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.onmessage = (evt) => {
        try {
          const msg: ServerMsg = JSON.parse(evt.data);
          switch (msg.type) {
            case "initial_state": {
              setIsReady(true);
              onReady?.();
              break;
            }
            case "operation": {
              onServerOperation(msg.op);
              break;
            }
            case "error": {
              onError?.(msg);
              break;
            }
            default: {
              console.warn("Unknown WS message:", msg);
              break;
            }
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      isConnectingRef.current = false;
      setStatus("closed");
      onError?.({ type: "error", code: "FORBIDDEN", message: "Failed to create WebSocket connection" });
    }
  };

  useEffect(() => {
    setupWebSocket();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  return { status, socket: wsRef.current, isReady };
}
