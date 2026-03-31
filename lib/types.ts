/* ────────────────────────────────────────────────────────────────
   Terminal output types
   ──────────────────────────────────────────────────────────────── */
export type OutputKind =
  | "text"
  | "error"
  | "success"
  | "accent"
  | "muted"
  | "prompt"
  | "html"       // raw HTML string rendered via dangerouslySetInnerHTML
  | "img";       // <img> src string

export interface OutputLine {
  id:    string;
  kind:  OutputKind;
  text:  string;       // content (plain text, HTML, or img src)
}

export interface HistoryEntry {
  prompt:  string;    // rendered prompt at time of command
  command: string;    // the raw text typed
  output:  OutputLine[];
}

export interface TerminalState {
  username:  string;
  domain:    string;
  theme:     string;
  powered:   boolean;  // false = shutdown state
  history:   HistoryEntry[];
  startTime: number;   // ms, for uptime
}
