// src/pages/EditDoc.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import api from "../api/api"; // must expose getDocument(id)
import type { DocumentCreateResponse } from "../types/document";
import { makeWsUrl, useDocSocket } from "../hooks/useDocSocket";
import { diffStrings, applyServerInsert, applyServerDelete, transformCaret } from "../utils/textOpts";



const EditDoc: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { title?: string } };
  const token = localStorage.getItem("token") || "";

  const [title, setTitle] = useState(state?.title || "Untitled");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string>("");

  // Track caret for better UX on remote ops
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const caretRef = useRef<number>(0);

  // Pending ops we originated (to ignore our own echo)
  const pendingRef = useRef<Array<{ type: "insert" | "delete"; pos: number; text?: string; len?: number }>>([]);

  // 1) Load initial doc via HTTP
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        const { data } = await api.getDocumentById(id);
        if (!mounted) return;
        setTitle(data.Title || "Untitled");
        setContent(data.Content || "");
        setVersion(data.Version || 0);
      } catch (err) {
        const msg = isAxiosError(err) ? (err.response?.data as any)?.message || err.message : "Failed to load document";
        setError(msg);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  // 2) WebSocket connection
  console.log(id)
  console.log(token)
  const wsUrl = id && token ? makeWsUrl (id, token) : "";
  console.log(wsUrl)
  const { status, send } = useDocSocket({
    wsUrl,
    onReady: () => {
      // connected; nothing else to do since we loaded content via HTTP
    },
    onError: (err) => {
      if (err.code === "CONFLICT" && err.current_version !== undefined && id) {
        // re-sync on conflict
        api.getDocumentById(id).then(({ data }) => {
          setContent(data.Content || "");
          setVersion(data.Version || 0);
          pendingRef.current = [];
        });
      } else {
        setError(err.message);
      }
    },
    onServerOperation: (op) => {
      // If it matches our own pending op, drop it (we already applied)
      const head = pendingRef.current[0];
      const same =
        head &&
        head.type === op.type &&
        head.pos === op.pos &&
        ((op.type === "insert" && head.text === op.text) ||
          (op.type === "delete" && head.len === op.len));

      if (same) {
        pendingRef.current.shift();
        setVersion(op.version);
        return;
      }

      // Apply remote op
      setContent((prev) => {
        let next = prev;
        let newCaret = textareaRef.current ? textareaRef.current.selectionStart : 0;

        if (op.type === "insert" && typeof op.text === "string") {
          next = applyServerInsert(next, op.pos, op.text);
          newCaret = transformCaret(newCaret, { type: "insert", pos: op.pos, text: op.text });
        } else if (op.type === "delete" && typeof op.len === "number") {
          next = applyServerDelete(next, op.pos, op.len);
          newCaret = transformCaret(newCaret, { type: "delete", pos: op.pos, len: op.len });
        }

        // restore caret
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCaret;
          }
        });

        return next;
      });

      setVersion(op.version);
    },
  });

  // 3) Local edits -> compute diff -> send op (and optimistically apply)
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const oldVal = content;
    const diff = diffStrings(oldVal, newVal);

    if (diff.kind === "noop") {
      setContent(newVal);
      return;
    }

    if (diff.kind === "insert") {
      // Optimistically accept local input; enqueue pending op
      setContent(newVal);
      pendingRef.current.push({ type: "insert", pos: diff.pos, text: diff.text });

      send({ type: "insert", pos: diff.pos, text: diff.text, version });
      // Do not bump version locally; wait for server op
      return;
    }

    if (diff.kind === "delete") {
      setContent(newVal);
      pendingRef.current.push({ type: "delete", pos: diff.pos, len: diff.len });

      send({ type: "delete", pos: diff.pos, len: diff.len, version });
      return;
    }

  
    setContent(newVal);
  };

  const onSelect = () => {
    const el = textareaRef.current;
    if (el) caretRef.current = el.selectionStart;
  };

  const sendUndo = () => {
    send({ type: "undo" });
  };

  if (!id) return <div className="p-6">Invalid document ID.</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <div className="text-xs text-gray-500">
            Doc ID: <span className="font-mono">{id}</span> • Version {version} • WS {status}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
            onClick={sendUndo}
            disabled={status !== "open"}
          >
            Undo
          </button>
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <textarea
        ref={textareaRef}
        id="editor"
        className="mt-2 w-full min-h-[320px] rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={content}
        onChange={onChange}
        onSelect={onSelect}
        placeholder="Start typing…"
        disabled={status === "closed"}
      />
    </div>
  );
};

export default EditDoc;
