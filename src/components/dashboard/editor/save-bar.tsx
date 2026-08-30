"use client";

import { Check, Loader2, Redo2, Undo2 } from "lucide-react";
import { useEditor } from "./editor-provider";
import { Button } from "@/components/ui/button";

export function SaveBar() {
  const { dirty, saving, lastSavedAt, save, undo, redo, canUndo, canRedo } = useEditor();

  const status = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : lastSavedAt
        ? "All changes saved"
        : "Saved";

  return (
    <div className="vy-builder-savebar flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-[#fffaf4] hover:bg-white/[0.07] hover:text-white" onClick={undo} disabled={!canUndo} aria-label="Annuler" title="Annuler (Ctrl+Z)">
          <Undo2 className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#fffaf4] hover:bg-white/[0.07] hover:text-white" onClick={redo} disabled={!canRedo} aria-label="Rétablir" title="Rétablir (Ctrl+Shift+Z)">
          <Redo2 className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-xs text-[#a79f95] sm:flex">
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : dirty ? (
            <span className="size-2 rounded-full bg-[var(--warning)]" />
          ) : (
            <Check className="size-3.5 text-[var(--success)]" />
          )}
          {status}
        </span>
        <Button size="sm" className="vy-action-primary rounded-lg" onClick={() => void save()} disabled={saving || !dirty}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
