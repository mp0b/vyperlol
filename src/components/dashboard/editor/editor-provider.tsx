"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { EditorDraft, EditorStaticData } from "@/lib/editor/types";
import { saveProfileDraft } from "@/server/actions/profile-editor";

type Mutator = (draft: EditorDraft) => void;

interface EditorContextValue {
  draft: EditorDraft;
  data: EditorStaticData;
  dirty: boolean;
  saving: boolean;
  lastSavedAt: Date | null;
  mutate: (fn: Mutator) => void;
  save: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}

const HISTORY_LIMIT = 60;

export function EditorProvider({
  initialDraft,
  initialData,
  children,
}: {
  initialDraft: EditorDraft;
  initialData: EditorStaticData;
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<EditorDraft>(initialDraft);
  const [data, setData] = useState<EditorStaticData>(initialData);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [histIndex, setHistIndex] = useState(0);
  const [histLen, setHistLen] = useState(1);

  const historyRef = useRef<EditorDraft[]>([initialDraft]);
  const indexRef = useRef(0);
  const draftRef = useRef(initialDraft);
  const dataRef = useRef(initialData);
  const dirtyRef = useRef(false);
  const revisionRef = useRef(0);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef<() => Promise<void>>(async () => {});

  const sync = (d: EditorDraft) => {
    draftRef.current = d;
    setDraft(d);
  };

  const scheduleAutosave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void saveRef.current(), 1500);
  }, []);

  const save = useCallback(async () => {
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }
    if (!dirtyRef.current) return;
    savingRef.current = true;
    setSaving(true);
    const revAtStart = revisionRef.current;
    const snapshot = draftRef.current;
    try {
      const res = await saveProfileDraft(dataRef.current.profileId, snapshot);
      if (res.ok) {
        setLastSavedAt(new Date());
        if (revisionRef.current === revAtStart) {
          // No edits during the save — adopt canonical server state.
          draftRef.current = res.data.draft;
          setDraft(res.data.draft);
          dataRef.current = res.data.data;
          setData(res.data.data);
          historyRef.current = [res.data.draft];
          indexRef.current = 0;
          setHistIndex(0);
          setHistLen(1);
          dirtyRef.current = false;
          setDirty(false);
        }
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Couldn't save changes.");
    } finally {
      savingRef.current = false;
      setSaving(false);
      if (pendingRef.current) {
        pendingRef.current = false;
        scheduleAutosave();
      }
    }
  }, [scheduleAutosave]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const mutate = useCallback(
    (fn: Mutator) => {
      const next = structuredClone(draftRef.current);
      fn(next);
      const stack = historyRef.current.slice(0, indexRef.current + 1);
      stack.push(next);
      if (stack.length > HISTORY_LIMIT) stack.shift();
      historyRef.current = stack;
      indexRef.current = stack.length - 1;
      setHistIndex(indexRef.current);
      setHistLen(stack.length);
      revisionRef.current++;
      dirtyRef.current = true;
      setDirty(true);
      sync(next);
      scheduleAutosave();
    },
    [scheduleAutosave],
  );

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current--;
    setHistIndex(indexRef.current);
    revisionRef.current++;
    dirtyRef.current = true;
    setDirty(true);
    sync(historyRef.current[indexRef.current]);
    scheduleAutosave();
  }, [scheduleAutosave]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current++;
    setHistIndex(indexRef.current);
    revisionRef.current++;
    dirtyRef.current = true;
    setDirty(true);
    sync(historyRef.current[indexRef.current]);
    scheduleAutosave();
  }, [scheduleAutosave]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        void save();
      } else if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, undo, redo]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <EditorContext.Provider
      value={{
        draft,
        data,
        dirty,
        saving,
        lastSavedAt,
        mutate,
        save,
        undo,
        redo,
        canUndo: histIndex > 0,
        canRedo: histIndex < histLen - 1,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
