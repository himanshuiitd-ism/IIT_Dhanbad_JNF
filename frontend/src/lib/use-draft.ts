/**
 * useDraft — persists form state to localStorage (debounced) and loads it back.
 * Supports both JNF and INF. Works completely offline.
 */
import { useEffect, useRef, useCallback } from "react";

export type FormType = "jnf" | "inf";

export interface DraftMeta {
  formType: FormType;
  /** User-visible title (company name or profile name) */
  title: string;
  /** Current step index the user is on */
  step: number;
  /** ISO string of last save */
  savedAt: string;
  /** % completion 0-100 */
  completion: number;
  /** Backend ID once created */
  id?: number | null;
}

// Helper to get current user identifier from localStorage
const getUserEmail = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("local_user_email") || "anonymous";
};

const KEY = (type: FormType) => `cdc_draft_${getUserEmail()}_${type}`;
const META_KEY = (type: FormType) => `cdc_draft_meta_${getUserEmail()}_${type}`;

// ─── Save ────────────────────────────────────────────────────────
export function saveDraft(type: FormType, data: object, meta: Omit<DraftMeta, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(type), JSON.stringify(data));
    localStorage.setItem(META_KEY(type), JSON.stringify({ ...meta, formType: type, savedAt: new Date().toISOString() }));
  } catch {
    // storage full — ignore
  }
}

// ─── Load ────────────────────────────────────────────────────────
export function loadDraft(type: FormType): { data: any; meta: DraftMeta } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw  = localStorage.getItem(KEY(type));
    const meta = localStorage.getItem(META_KEY(type));
    if (!raw || !meta) return null;
    return { data: JSON.parse(raw), meta: JSON.parse(meta) };
  } catch {
    return null;
  }
}

// ─── Clear ───────────────────────────────────────────────────────
export function clearDraft(type: FormType) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY(type));
  localStorage.removeItem(META_KEY(type));
}

// ─── List all draft metas ─────────────────────────────────────────
export function listDraftMetas(): DraftMeta[] {
  const types: FormType[] = ["jnf", "inf"];
  return types
    .map(t => {
      try {
        const raw = localStorage.getItem(META_KEY(t));
        return raw ? (JSON.parse(raw) as DraftMeta) : null;
      } catch { return null; }
    })
    .filter(Boolean) as DraftMeta[];
}

// ─── Hook: debounced auto-save ────────────────────────────────────
export function useDraft(
  type: FormType,
  data: object,
  meta: Omit<DraftMeta, "savedAt">,
  debounceMs = 800,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userEmail = getUserEmail(); // Track user email to detect login changes

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveDraft(type, data, meta);
    }, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), meta.step, meta.title, meta.completion, userEmail]);
}
