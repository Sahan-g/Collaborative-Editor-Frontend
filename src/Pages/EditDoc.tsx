import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOperations } from '../utils/textOpts';
import './EditDoc.css';
import api from '../api/api';
import type { DocumentCreateResponse } from '../types/document';

import SimpleMDEReact from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

// Type of a server op (mirror your server's contract)
type WSOp =
  | { type: 'insert'; pos: number; text: string; version: number }
  | { type: 'delete'; pos: number; len: number; version: number };

const EditDoc: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>();
  const { token } = useAuth();

  // Minimal UI state (avoid storing the big content in React state)
  const [doc, setDoc] = useState<DocumentCreateResponse | null>(null);
  const [versionDisplay, setVersionDisplay] = useState<number>(0);

  // Refs: perf-critical / imperative
  const ws = useRef<WebSocket | null>(null);
  const mdeRef = useRef<any>(null); // EasyMDE instance; has .codemirror
  const cmRef = useRef<any>(null);  // CodeMirror editor instance

  const contentRef = useRef<string>(''); // authoritative text buffer
  const versionRef = useRef<number>(0);  // authoritative version
  const socketProvidedContent = useRef(false);

  // guards & listener tracking
  const applyingRemoteOp = useRef(false);   // we're applying a remote op (suppress local echo)
  const suppressChangeRef = useRef(false);  // programmatic set (suppress local diff)
  const changeHandlerRef = useRef<((...args: any[]) => void) | null>(null);

  // --- helpers ---
  const getEditor = () => cmRef.current as import('codemirror').Editor | undefined;

  const setEditorValue = (text: string) => {
    const editor = getEditor();
    if (!editor) return;
    suppressChangeRef.current = true;
    editor.operation(() => {
      editor.setValue(text);
    });
    suppressChangeRef.current = false;
  };

  const replaceRange = (text: string, fromIdx: number, toIdx?: number) => {
    const editor = getEditor();
    if (!editor) return;
    const from = editor.posFromIndex(fromIdx);
    const to = typeof toIdx === 'number' ? editor.posFromIndex(toIdx) : from;
    suppressChangeRef.current = true;
    editor.operation(() => {
      editor.replaceRange(text, from, to);
    });
    suppressChangeRef.current = false;
  };

  // -------- 1) Initial fetch via HTTP --------
  useEffect(() => {
    if (!documentId) return;

    (async () => {
      try {
        const document = await api.getDocumentById(documentId);
        setDoc(document.data);

        const initialContent = document?.data?.Content ?? '';
        const initialVersion = document?.data?.Version ?? 0;

        if (!socketProvidedContent.current) {
          contentRef.current = initialContent;
          versionRef.current = initialVersion;
          setVersionDisplay(initialVersion);
          if (cmRef.current) setEditorValue(initialContent);
        }
      } catch (error) {
        console.error('Failed to fetch document', error);
      }
    })();
  }, [documentId]);

  // -------- 2) WebSocket lifecycle --------
  useEffect(() => {
    if (!token || !documentId) return;

    // Adjust to your actual WS endpoint
    const socketUrl = `${import.meta.env.VITE_WS_BASE_URL ?? 'wss://organic-meme-xjrggqq9vj539v6p-8080.app.github.dev'
      }/ws/doc/${documentId}?token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(socketUrl);
    ws.current = socket;

    socket.onopen = () => console.log('WebSocket connected');

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'initial_state': {
          socketProvidedContent.current = true;
          const serverContent: string = message.content ?? '';
          const serverVersion: number = message.version ?? 0;

          contentRef.current = serverContent;
          versionRef.current = serverVersion;
          setVersionDisplay(serverVersion);

          if (cmRef.current) setEditorValue(serverContent);
          break;
        }

        case 'operation': {
          applyingRemoteOp.current = true;
          applyRemoteOperation(message.op as WSOp);
          applyingRemoteOp.current = false;
          break;
        }

        case 'out_of_sync': {
          console.warn('Client out of sync. Server version:', message.version);
          const serverVersion: number = message.version ?? versionRef.current;
          const serverContent: string = message.content ?? '';

          versionRef.current = serverVersion;
          contentRef.current = serverContent;
          setVersionDisplay(serverVersion);

          if (cmRef.current) setEditorValue(serverContent);
          break;
        }

        case 'error': {
          console.error('WebSocket error message:', message);
          if (message.code === 'CONFLICT' && typeof message.version === 'number') {
            versionRef.current = message.version;
            setVersionDisplay(message.version);
          }
          break;
        }

        default:
          console.warn('Unknown message type:', message.type);
      }
    };

    socket.onerror = (err) => console.error('WebSocket error:', err);
    socket.onclose = () => console.log('WebSocket disconnected');

    return () => {
      socket.close();
      if (ws.current === socket) ws.current = null;
    };
  }, [token, documentId]);

  // -------- 3) Remote op application (surgical; no React state writes) --------
  const applyRemoteOperation = (op: WSOp) => {
    if (!cmRef.current) {
      // If editor not ready yet, mutate content buffer
      if (op.type === 'insert') {
        contentRef.current =
          contentRef.current.slice(0, op.pos) + op.text + contentRef.current.slice(op.pos);
      } else if (op.type === 'delete') {
        contentRef.current =
          contentRef.current.slice(0, op.pos) + contentRef.current.slice(op.pos + op.len);
      }
      versionRef.current = op.version;
      setVersionDisplay(op.version);
      return;
    }

    const editor = cmRef.current as import('codemirror').Editor;
    // Save selections so caret doesn’t jump on concurrent edits
    const selections = editor.listSelections();

    if (op.type === 'insert') {
      replaceRange(op.text, op.pos);
      contentRef.current =
        contentRef.current.slice(0, op.pos) + op.text + contentRef.current.slice(op.pos);
    } else if (op.type === 'delete') {
      replaceRange('', op.pos, op.pos + op.len);
      contentRef.current =
        contentRef.current.slice(0, op.pos) + contentRef.current.slice(op.pos + op.len);
    }

    // CodeMirror usually adjusts selections; restore if your UX needs it:
    // editor.setSelections(selections);

    versionRef.current = op.version;
    setVersionDisplay((v) => (v !== versionRef.current ? versionRef.current : v));
  };

  type ToolbarItem =
    | '|'
    | EasyMDE.ToolbarIcon
    | EasyMDE.ToolbarButton
    | EasyMDE.ToolbarDropdownIcon;
  // -------- 4) Memoized toolbar & options (prevents remount/jump) --------
  const toolbar = useMemo<ToolbarItem[]>(
    () => [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'table',
      'code',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide',
    ] as const,
    []
  );

  const mdeOptions = useMemo(
    () => ({
      spellChecker: false,
      autosave: {
        enabled: false,
        uniqueId: `doc-${documentId ?? 'unknown'}`,
      },
      status: false,
      autofocus: true,
      toolbar,
      // Do NOT pass initialValue here repeatedly — we set it imperatively.
    }),
    [toolbar]
  );

  // -------- 5) Attach editor & set single change handler --------
  const handleMDEInstance = useCallback((inst: any) => {
    if (!inst) return;
    mdeRef.current = inst;
    cmRef.current = inst.codemirror as import('codemirror').Editor;
    const editor = cmRef.current;

    // Clean any old listener (safety if component remounts)
    if (changeHandlerRef.current) {
      editor.off('change', changeHandlerRef.current);
      changeHandlerRef.current = null;
    }

    // Initialize editor value to our buffer (in case HTTP/WS already populated it)
    if (editor.getValue() !== contentRef.current) {
      suppressChangeRef.current = true;
      editor.setValue(contentRef.current);
      suppressChangeRef.current = false;
    }

    // Authoritative change handler for local edits
    const onChange = () => {
      if (suppressChangeRef.current || applyingRemoteOp.current) return;
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

      const oldContent = contentRef.current;
      const newContent = editor.getValue();
      if (oldContent === newContent) return;

      const ops = getOperations(oldContent, newContent, versionRef.current);
      if (ops.length === 0) {
        contentRef.current = newContent;
        return;
      }

      for (const op of ops) {
        ws.current!.send(JSON.stringify(op));
        versionRef.current += 1;
      }

      contentRef.current = newContent;
      setVersionDisplay((v) => (v !== versionRef.current ? versionRef.current : v));
    };

    editor.on('change', onChange);
    changeHandlerRef.current = onChange;
  }, []);

  // Cleanup editor listener on unmount
  useEffect(() => {
    return () => {
      const editor = getEditor();
      if (editor && changeHandlerRef.current) {
        editor.off('change', changeHandlerRef.current);
        changeHandlerRef.current = null;
      }
    };
  }, []);

  if (!doc) {
    return <div className="loading-container">Loading document...</div>;
  }

  return (
    <div className="edit-doc-container">
      <h1 className="doc-title">{doc.Title}</h1>

      <div className="editor-wrapper">
        <SimpleMDEReact
          getMdeInstance={handleMDEInstance}
          options={mdeOptions}
        />
      </div>

      <div className="doc-info">
        <p>Version: {versionDisplay}</p>
      </div>
    </div>
  );
};

export default EditDoc;
