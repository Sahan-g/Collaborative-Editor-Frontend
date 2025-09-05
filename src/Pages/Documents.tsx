import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import type { Variants } from "framer-motion";


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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && (
          <div className="mt-6 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
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

  // Add these animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
  };

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex flex-col items-center space-y-4 w-full">
      <motion.div
        className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-slate-600 font-medium"
      >
        Loading your documents...
      </motion.p>
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-purple-50 to-cyan-50 py-16"
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <motion.div variants={itemVariants} className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500">
            Your Documents
          </h1>
          <p className="mt-2 text-slate-600">
            Continue where you left off or start something new
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
        >
          <ActionCard
            title="New Document"
            subtitle="Start writing together"
            icon={AddOutlinedIcon}
            variant="default"
            onClick={() => setModal("new")}
            className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300"
          />

          <ActionCard
            title="Join Session"
            subtitle="Collaborate in real-time"
            icon={PeopleAltOutlinedIcon}
            variant="default"
            onClick={() => setModal("join")}
            className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300"
          />

          <ActionCard
            title="Browse Templates"
            subtitle="Get started quickly"
            icon={ArticleOutlinedIcon}
            variant="default"
            onClick={() => setModal("templates")}
            className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow duration-300"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-8">
            Recent documents
          </h2>

          {loadingDocs ? (
            <div className="py-12 flex justify-center">
              <LoadingAnimation />
            </div>
          ) : docsError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-lg"
            >
              {docsError}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  variants={itemVariants}
                  className="transform hover:-translate-y-1 transition-all duration-300"
                >
                  <DocumentCard
                    {...card}
                    onClick={() =>
                      navigate(`/documents/${card.id}`, {
                        state: { title: card.title },
                      })
                    }
                    onShare={(id) => openShare(id, card.title)}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
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
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => setModal(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={handleCreateDocument}
              disabled={!newTitle.trim() || creating}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-slate-200 px-4 py-2.5 focus:border-purple-500 focus:ring-purple-500"
              placeholder="Untitled document"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
            />
          </div>
          {newError && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {newError}
            </p>
          )}
        </div>
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
    </motion.div>
  );
};

export default Documents;
