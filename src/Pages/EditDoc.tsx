import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOperations } from '../utils/textOpts';
import './EditDoc.css';
import api from '../api/api';
import  type { DocumentCreateResponse } from '../types/document';

const EditDoc: React.FC = () => {
    const { id: documentId } = useParams<{ id: string }>();
    const { token } = useAuth();
    const [doc, setDoc] = useState<DocumentCreateResponse | null>(null);
    const [content, setContent] = useState('');
    const [version, setVersion] = useState(0);
    const ws = useRef<WebSocket | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const cursorRef = useRef<{ start: number, end: number } | null>(null);
    const applyingRemoteOp = useRef(false);
    const socketProvidedContent = useRef(false);

    useEffect(() => {
        if (!documentId) return;

        const fetchDoc = async () => {
            try {
                const document  = await api.getDocumentById(documentId);
                setDoc(document.data);
                console.log('Fetched document:', document.data);
                if (!socketProvidedContent.current) {
                    setContent(document.data.Content);
                    setVersion(document.data.Version);
                }
            } catch (error) {
                console.error('Failed to fetch document', error);
            }
        };

        fetchDoc();
    }, [documentId]);

    useEffect(() => {
        if (!token || !documentId) return;

        const socketUrl = `wss://organic-meme-xjrggqq9vj539v6p-8080.app.github.dev/ws/doc/${documentId}?token=${token}`;
        const socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'initial_state':
                    console.log('Received initial state.' , message);
                    if (message.content != null) {
                        setContent(message.content);
                        setVersion(message.version);  
                        socketProvidedContent.current = true;
                    }
                    break;
                case 'operation':
                    console.log('Received operation:', message.op);
                    applyingRemoteOp.current = true;
                    applyOperation(message.op);
                    break;
                case 'error':
                    console.error('WebSocket error message:', message);
                    if (message.code === 'CONFLICT') {
                        setVersion(message.current_version);
                    }
                    break;
                case 'out_of_sync':
                    console.warn('Client out of sync. Server version:', message.current_version);
                    setVersion(message.version);
                    setContent(message.content);
                    break;
                default:
                    console.warn('Unknown message type:', message.type);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
        };
    }, [token, documentId]);

    const applyOperation = (op: any) => {
        if (textareaRef.current) {
            const { selectionStart, selectionEnd } = textareaRef.current;
            let newCursorPos = selectionStart;

            if (op.type === 'insert') {
                if (op.pos < selectionStart) {
                    newCursorPos += op.text.length;
                }
            } else if (op.type === 'delete') {
                if (op.pos < selectionStart) {
                    newCursorPos -= Math.min(op.len, selectionStart - op.pos);
                }
            }
            cursorRef.current = { start: newCursorPos, end: newCursorPos };
        }
        
        setContent(currentContent => {
            if (op.type === 'insert') {
                return currentContent.slice(0, op.pos) + op.text + currentContent.slice(op.pos);
            } else if (op.type === 'delete') {
                return currentContent.slice(0, op.pos) + currentContent.slice(op.pos + op.len);
            }
            return currentContent;
        });
        setVersion(op.version);
    };

    useLayoutEffect(() => {
        if (textareaRef.current && cursorRef.current) {
            textareaRef.current.selectionStart = cursorRef.current.start;
            textareaRef.current.selectionEnd = cursorRef.current.end;
            cursorRef.current = null;
        }
        if(applyingRemoteOp.current){
            applyingRemoteOp.current = false;
        }
    }, [content]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(applyingRemoteOp.current) return;

        const newContent = e.target.value;
        const oldContent = content;

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const ops = getOperations(oldContent, newContent, version);
            ops.forEach(op => {
                console.log('Sending op:', op);
                ws.current?.send(JSON.stringify(op));
                setVersion(v => v + 1);
            });
        }
        
        setContent(newContent);
    };

    if (!doc) {
        return <div className="loading-container">Loading document...</div>;
    }

    return (
        <div className="edit-doc-container">
            <h1 className="doc-title">{doc.Title}</h1>
            <div className="editor-wrapper">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    className="editor-textarea"
                />
            </div>
            <div className="doc-info">
                <p>Version: {version}</p>
            </div>
        </div>
    );
};

export default EditDoc;
