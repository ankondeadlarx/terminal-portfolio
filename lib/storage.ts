/* localStorage helpers for terminal persistence */
import type { HistoryEntry } from "./types";

const KEYS = {
  theme:    "tp_theme",
  username: "tp_username",
  history:  "tp_history",
  city:     "tp_city",
} as const;

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export const storage = {
  getTheme:    () => safe(() => localStorage.getItem(KEYS.theme) || "ash", "ash"),
  setTheme:    (t: string) => safe(() => localStorage.setItem(KEYS.theme, t), undefined),

  getUsername: () => safe(() => localStorage.getItem(KEYS.username) || "visitor", "visitor"),
  setUsername: (u: string) => safe(() => localStorage.setItem(KEYS.username, u), undefined),

  getCity:     () => safe(() => localStorage.getItem(KEYS.city) || "", ""),
  setCity:     (c: string) => safe(() => localStorage.setItem(KEYS.city, c), undefined),

  getHistory:  (): HistoryEntry[] =>
    safe(() => JSON.parse(localStorage.getItem(KEYS.history) || "[]"), []),

  pushHistory: (entry: HistoryEntry) =>
    safe(() => {
      const h: HistoryEntry[] = JSON.parse(localStorage.getItem(KEYS.history) || "[]");
      h.push(entry);
      if (h.length > 200) h.splice(0, h.length - 200);
      localStorage.setItem(KEYS.history, JSON.stringify(h));
    }, undefined),

  clearHistory: () => safe(() => localStorage.removeItem(KEYS.history), undefined),
};
