import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ShareModal from "../Components/ShareModal";

type ShareTarget = { id: string; title?: string };

type Ctx = {
  openShare: (t: ShareTarget) => void;
  closeShare: () => void;
};

const ShareModalCtx = createContext<Ctx | null>(null);

export function ShareModalProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<ShareTarget | null>(null);

  const openShare = useCallback((t: ShareTarget) => setTarget(t), []);
  const closeShare = useCallback(() => setTarget(null), []);

  const value = useMemo(() => ({ openShare, closeShare }), [openShare, closeShare]);

  return (
    <ShareModalCtx.Provider value={value}>
      {children}
      {/* Render the modal at app root so Header can open it */}
      <ShareModal open={!!target} onClose={closeShare} docId={target?.id ?? ""} initialTitle={target?.title} />
    </ShareModalCtx.Provider>
  );
}

export function useShareModal() {
  const ctx = useContext(ShareModalCtx);
  if (!ctx) throw new Error("useShareModal must be used within ShareModalProvider");
  return ctx;
}
