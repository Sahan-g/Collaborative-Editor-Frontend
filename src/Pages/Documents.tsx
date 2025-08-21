import React, { useEffect, useMemo, useState } from "react";
import ActionCard from "../Components/ActionCard";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DocumentCard, {
  type DocumentCardProps,
} from "../Components/DocumentCard";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { isAxiosError } from "axios";
import type { DocumentCreateResponse } from "../types/document";

// Lightweight inline modal for this page only
function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

type ModalType = "new" | "join" | "templates" | null;

const Documents = () => {
  const [modal, setModal] = useState<ModalType>(null);
  const navigate = useNavigate();

  // Create modal state
  const [newTitle, setNewTitle] = useState("");
  const [newError, setNewError] = useState("");
  const [creating, setCreating] = useState(false);

  // Join Session
  const [sessionCode, setSessionCode] = useState("");
  const [joinError, setJoinError] = useState("");

  // API-loaded documents
  const [docs, setDocs] = useState<DocumentCreateResponse[]>([]);
  const [cards, setCards] = useState<DocumentCardProps[]>([]);
  const [docsError, setDocsError] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareDoc, setShareDoc] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharing, setSharing] = useState(false);

  const openShare = (id: string, title: string) => {
    setShareDoc({ id, title });
    setShareEmail("");
    setShareError("");
    setShareOpen(true);
  };

  const closeShare = () => {
    setShareOpen(false);
    setShareDoc(null);
    setShareEmail("");
    setShareError("");
  };

  const handleShareSubmit = async () => {
    const email = shareEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setShareError("Please enter a valid email address");
      return;
    }
    if (!shareDoc) return;

    setSharing(true);
    setShareError("");

    try {
      const { data: message } = await api.shareDocument(shareDoc.id, email);
      console.log(message);
      closeShare();
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as any)?.message ||
          (err.response?.data as any)?.error ||
          "Failed to share document"
        : "Network error";
      setShareError(msg);
    } finally {
      setSharing(false);
    }
  };

  // Templates (example list)
  const templates = useMemo(
    () => [
      { id: "blank", name: "Blank" },
      { id: "meeting-notes", name: "Meeting Notes" },
      { id: "project-doc", name: "Project Doc" },
    ],
    []
  );

  // --- Helpers to generate stable, suitable values from an ID ---
  const hashStr = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  };

  const relativeTimeFromMinutesAgo = (minsAgo: number) => {
    if (minsAgo <= 1) return "Just now";
    if (minsAgo < 60) return `${minsAgo} min ago`;
    const hours = Math.floor(minsAgo / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
    // (Change to any format your UI expects)
  };

  const toCardProps = (d: DocumentCreateResponse): DocumentCardProps => {
    const h = hashStr(d.ID);
    const minutesAgo = h % (60 * 24 * 14);
    const collaborators = (h % 6) + 1;
    const isFavorite = (h >> 1) % 5 === 0;
    const isActive = (h >> 2) % 7 === 0;

    return {
      id: d.ID, 
      title: d.Title || "Untitled document",
      time: relativeTimeFromMinutesAgo(minutesAgo),
      collaborators,
      isFavorite,
      isActive,
      onClick: () =>
        navigate(`/documents/${d.ID}`, { state: { title: d.Title } }), 
    };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingDocs(true);
        setDocsError("");
        const res = await api.getDocuments();
        if (!mounted) return;
        setDocs(res.data);
        setCards(res.data.map(toCardProps));
      } catch (err) {
        if (!mounted) return;
        const msg = isAxiosError(err)
          ? (err.response?.data as any)?.message || err.message
          : "Failed to load documents";
        setDocsError(msg);
      } finally {
        if (mounted) setLoadingDocs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateDocument = async () => {
    if (!newTitle.trim()) {
      setNewError("Please enter a title");
      return;
    }
    setNewError("");
    setCreating(true);
    try {
      const payload = { title: newTitle.trim() }; 
      const response = await api.addDocument(payload);
      const doc = response.data as DocumentCreateResponse;
      setDocs((prev) => [doc, ...prev]);
      setCards((prev) => [toCardProps(doc), ...prev]);
      navigate(`/documents/${doc.ID}`, { state: { title: doc.Title } });
    } catch (error) {
      const msg = isAxiosError(error)
        ? (error.response?.data as any)?.message ||
          (error.response?.data as any)?.error ||
          "Failed to create document. Please try again."
        : "Network error";
      setNewError(msg);
      return;
    } finally {
      setCreating(false);
      setNewTitle("");
      setModal(null);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      setJoinError("Please enter a session code");
      return;
    }
    setJoinError("");
    // TODO: join logic or navigation
    setSessionCode("");
    setModal(null);
  };

  const handleChooseTemplate = async (id: string) => {
    // TODO: create from template or navigate to editor with template id
    setModal(null);
  };

  return (
    <>
      <div className="flex justify-center pt-16 px-4">
        <div className="w-full max-w-screen-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, John
          </h1>
          <p className="text-sm text-gray-500">
            Continue where you left off or start something new
          </p>
        </div>
      </div>

      <div className="flex justify-center pt-16 px-4">
        <div className="w-full max-w-screen-lg">
          <div className="flex flex-wrap gap-y-6 md:justify-start lg:justify-between">
            <ActionCard
              title="New Document"
              subtitle="Start writing together"
              icon={AddOutlinedIcon}
              borderColor="gray-300"
              onClick={() => setModal("new")}
            />
            <ActionCard
              title="Join Session"
              subtitle="Collaborate in real-time"
              icon={PeopleAltOutlinedIcon}
              borderColor="gray-300"
              onClick={() => setModal("join")}
            />
            <ActionCard
              title="Browse Templates"
              subtitle="Get started quickly"
              icon={ArticleOutlinedIcon}
              borderColor="gray-300"
              onClick={() => setModal("templates")}
            />
          </div>

          <h2 className="text-xl font-semibold mt-12 mb-6 text-gray-800">
            Recent documents
          </h2>

          {/* Loading / error / grid */}
          {loadingDocs ? (
            <div className="text-gray-500">Loading documents…</div>
          ) : docsError ? (
            <div className="text-red-600">{docsError}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <DocumentCard
                  key={card.id}
                  {...card}
                  onClick={() =>
                    navigate(`/documents/${card.id}`, {
                      state: { title: card.title },
                    })
                  }
                  onShare={(id) => openShare(id, card.title)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Document Modal (title only) */}
      <Modal
        open={modal === "new"}
        title="Create a new document"
        onClose={() => setModal(null)}
        footer={
          <>
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleCreateDocument}
              disabled={!newTitle.trim() || creating}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Untitled document"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          autoFocus
        />
        {newError && <p className="text-sm text-red-600">{newError}</p>}
      </Modal>

      {/* Join Session Modal */}
      <Modal
        open={modal === "join"}
        title="Join a session"
        onClose={() => setModal(null)}
        footer={
          <>
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleJoinSession}
              disabled={!sessionCode.trim()}
            >
              Join
            </button>
          </>
        }
      >
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session code
        </label>
        <input
          type="text"
          className="w-full rounded-md border px-3 py-2 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g. ABCD-1234"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
        />
        {joinError && <p className="text-sm text-red-600">{joinError}</p>}
      </Modal>

      {/* Templates Modal */}
      <Modal
        open={modal === "templates"}
        title="Choose a template"
        onClose={() => setModal(null)}
      >
        <ul className="grid grid-cols-1 gap-3">
          {templates.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => handleChooseTemplate(t.id)}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">{t.name}</span>
                <span className="text-sm text-gray-500">Use</span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
      <Modal
        open={shareOpen}
        title={shareDoc ? `Share “${shareDoc.title}”` : "Share"}
        onClose={closeShare}
        footer={
          <>
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={closeShare}
              disabled={sharing}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              onClick={handleShareSubmit}
              disabled={sharing || !shareEmail.trim()}
            >
              {sharing ? "Sharing…" : "Share"}
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
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          autoFocus
        />
        {shareError && <p className="text-sm text-red-600">{shareError}</p>}
      </Modal>
    </>
  );
};

export default Documents;
