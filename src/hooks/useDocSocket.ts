import { useEffect, useRef, useState } from "react";
const API_BASE = 'ominous-barnacle-5wv77pp4765f76xw-8080.app.github.dev'

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


const WS_BASE = "wss://ominous-barnacle-5wv77pp4765f76xw-8080.app.github.dev/ws/doc";

export function makeWsUrl(docId: string, token: string) {
  return `${WS_BASE}/${encodeURIComponent(docId)}?token=${encodeURIComponent(token)}`;
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

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => {
      setStatus("closed");
      onError?.({ type: "error", code: "FORBIDDEN", message: "WebSocket error" });
    };
    ws.onmessage = (evt) => {
      try {
        const msg: ServerMsg = JSON.parse(evt.data);
        if (msg.type === "initial_state") {
          onReady?.();
          return;
        }
        if (msg.type === "operation") {
          onServerOperation(msg.op);
          return;
        }
        if (msg.type === "error") {
          onError?.(msg);
          return;
        }
      } catch (e) {
        // ignore malformed
      }
    };

    return () => {
      console.log(wsUrl.toString(), "hehe")
      try { ws.close(1000, "leave"); } catch {}
      wsRef.current = null;
      setStatus("closed");
    };
  }, [wsUrl]);

  const send = (msg: ClientMsg) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(msg));
    return true;
  };

  return { status, send };
}


