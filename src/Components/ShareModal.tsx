import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import api from "../api/api";
import { isAxiosError } from "axios";

export default function ShareModal({
  open,
  onClose,
  docId,
  initialTitle,
}: {
  open: boolean;
  onClose: () => void;
  docId: string;
  initialTitle?: string;
}) {
  const [title, setTitle] = useState<string>(initialTitle ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // If title wasn't provided (e.g., opened from Header), fetch it
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!open || !docId || initialTitle) return;
      try {
        const res = await api.getDocumentById(docId);
        if (!alive) return;
        const t = (res.data?.Title as string) || "Untitled document";
        setTitle(t);
      } catch {
        if (!alive) return;
        setTitle("Untitled document");
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [open, docId, initialTitle]);

  useEffect(() => {
    if (open) {
      setEmail("");
      setError("");
      if (initialTitle) setTitle(initialTitle);
    }
  }, [open, initialTitle]);

  const handleShare = async () => {
    const e = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(e)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!docId) {
      setError("Missing document id");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.shareDocument(docId, e);
      onClose();
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as any)?.message ||
          (err.response?.data as any)?.error ||
          "Failed to share document"
        : "Network error";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span>
          Share <span className="text-gray-500">“{title || "Untitled document"}”</span>
        </span>
      }
      footer={
        <>
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleShare}
            disabled={busy || !email.trim()}
          >
            {busy ? "Sharing…" : "Share"}
          </button>
        </>
      }
    >
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Collaborator’s email
      </label>
      <input
        type="email"
        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Modal>
  );
}
