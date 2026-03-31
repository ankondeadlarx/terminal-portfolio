"use client";

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { nanoid } from "nanoid";
import { storage } from "@/lib/storage";
import { executeCommand, ExecResult } from "@/lib/commands";
import { TerminalState, OutputLine, HistoryEntry } from "@/lib/types";
import { COMMANDS } from "@/lib/commands-meta";
import { OWNER } from "@/lib/profile";
import Header from "./Header";
import Banner from "./Banner";
import OutputLineComp from "./OutputLine";
import MatrixRain from "./MatrixRain";

/* ── helpers ─────────────────────────────────────────────────── */
const makePrompt = (username: string, domain: string) => `${username}@${domain}:~$`;

const longestCommonPrefix = (items: string[]): string => {
  if (!items.length) return "";
  let prefix = items[0];
  for (let i = 1; i < items.length; i++) {
    while (!items[i].startsWith(prefix) && prefix.length) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
};

/* ── PowerOff Overlay ────────────────────────────────────────── */
function PowerOffOverlay({ onRestore }: { onRestore: () => void }) {
  return (
    <div className="poweroff-overlay">
      <p>System is powered off.</p>
      <button className="poweroff-btn" onClick={onRestore} aria-label="Power on">⏻</button>
    </div>
  );
}

/* ── single output block (prompt + lines) ────────────────────── */
interface Block {
  id:      string;
  prompt:  string;
  command: string;
  output:  OutputLine[];
}

function getInitialTerminalPrefs() {
  if (typeof window === "undefined") {
    return {
      theme: "ash",
      username: "visitor",
      city: "",
      history: [] as HistoryEntry[],
    };
  }

  const history = storage.getHistory();

  return {
    theme: "ash",
    username: storage.getUsername(),
    city: storage.getCity(),
    history,
  };
}

/* ═══════════════════════════════════════════════════════════════
   TERMINAL
   ═══════════════════════════════════════════════════════════════ */
export default function Terminal() {
  const initialPrefs = getInitialTerminalPrefs();

  // Persist between re-renders but init from localStorage
  const [theme,    setTheme]    = useState<string>(initialPrefs.theme);
  const [username, setUsername] = useState<string>(initialPrefs.username);
  const [city,     setCity]     = useState<string>(initialPrefs.city);
  const [powered,  setPowered]  = useState(true);
  const [matrixColor, setMatrixColor] = useState<string | null>(null);

  // Rendered history blocks
  const [blocks,   setBlocks]   = useState<Block[]>([]);

  // Command history strings (for arrow-key recall)
  const [cmdHistory,    setCmdHistory]    = useState<string[]>(initialPrefs.history.map(e => e.command));
  const [histIndex,     setHistIndex]     = useState(-1);
  const [savedInput,    setSavedInput]    = useState("");
  const [currentInput,  setCurrentInput]  = useState("");

  // Misc
  const startTime = useRef<number>(0);
  const inputRef  = useRef<HTMLSpanElement>(null);
  const bodyRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  /* ── auto-scroll ───────────────────────────────────────────── */
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [blocks]);

  /* ── focus input on click anywhere in terminal body ─────────── */
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /* ── helpers to get / set editable span value ──────────────── */
  const getInput = () => inputRef.current?.textContent?.trim() ?? "";
  const setInput = (val: string) => {
    if (!inputRef.current) return;
    inputRef.current.textContent = val;
    setCurrentInput(val);
    // Move cursor to end
    const range = document.createRange();
    const sel   = window.getSelection();
    range.selectNodeContents(inputRef.current);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  };
  const clearInput = () => {
    if (inputRef.current) inputRef.current.textContent = "";
    setCurrentInput("");
  };

  const commandSuggestions = (() => {
    const val = currentInput.trim().toLowerCase();
    if (!val || val.includes(" ")) return [] as string[];
    return Object.keys(COMMANDS)
      .sort((a, b) => a.localeCompare(b))
      .filter((command) => command.startsWith(val))
      .slice(0, 8);
  })();

  /* ── Tab autocomplete ──────────────────────────────────────── */
  const autocomplete = () => {
    const val   = getInput();
    if (!val) return;
    const lower = val.toLowerCase();
    const keys  = Object.keys(COMMANDS);
    const match = keys.filter(k => k.startsWith(lower));
    if (match.length === 1) {
      setInput(match[0]);
    } else if (match.length > 1) {
      const prefix = longestCommonPrefix(match);
      if (prefix.length > lower.length) setInput(prefix);
    }
  };

  const handleInput = () => {
    setCurrentInput(inputRef.current?.textContent ?? "");
  };

  /* ── Apply side-effects from commands ─────────────────────── */
  const applySideEffect = (effect: string) => {
    if (effect === "clear_screen") {
      setBlocks([]);
      return;
    }
    if (effect === "clear_history") {
      storage.clearHistory();
      setCmdHistory([]);
      return;
    }
    if (effect === "clear_all") {
      setBlocks([]);
      storage.clearHistory();
      setCmdHistory([]);
      return;
    }
    if (effect === "shutdown") {
      setPowered(false);
      return;
    }
    if (effect === "reset") {
      const freshTheme = "ash";
      const freshUser  = "visitor";
      setTheme(freshTheme);
      setUsername(freshUser);
      storage.setTheme(freshTheme);
      storage.setUsername(freshUser);
      setBlocks([]);
      return;
    }
    if (effect.startsWith("theme:")) {
      const t = effect.slice(6);
      setTheme(t);
      storage.setTheme(t);
      return;
    }
    if (effect.startsWith("username:")) {
      const u = effect.slice(9);
      setUsername(u);
      storage.setUsername(u);
      return;
    }
    if (effect.startsWith("city:")) {
      const nextCity = effect.slice(5);
      setCity(nextCity);
      storage.setCity(nextCity);
      return;
    }
    if (effect.startsWith("matrix:")) {
      const color = effect.slice(7);
      setMatrixColor(color === "off" ? null : color);
      return;
    }
    if (effect.startsWith("open:")) {
      window.open(effect.slice(5), "_blank", "noopener noreferrer");
      return;
    }
    if (effect.startsWith("timer:")) {
      const secs = parseInt(effect.slice(6), 10);
      setTimeout(() => {
        setBlocks(prev => [...prev, {
          id: nanoid(6),
          prompt: "",
          command: "",
          output: [{ id: nanoid(6), kind: "success", text: `⏰ Timer finished! (${secs}s)` }],
        }]);
      }, secs * 1000);
      return;
    }
    if (effect.startsWith("remind:")) {
      const [, secsStr, ...msgParts] = effect.split(":");
      const secs = parseInt(secsStr, 10);
      const msg  = msgParts.join(":");
      setTimeout(() => {
        setBlocks(prev => [...prev, {
          id: nanoid(6),
          prompt: "",
          command: "",
          output: [{ id: nanoid(6), kind: "accent", text: `🔔 Reminder: ${msg}` }],
        }]);
      }, secs * 1000);
      return;
    }
    if (effect === "stopwatch:start") {
      return; // stopwatch is handled in commands.ts (module-level state)
    }
  };

  /* ── Run command ───────────────────────────────────────────── */
  const runCommand = async (raw: string) => {
    const trimmed = raw.trim();
    const prompt  = makePrompt(username, OWNER.domain);
    const id      = nanoid(6);

    if (!trimmed) {
      setBlocks(prev => [...prev, { id, prompt, command: "", output: [] }]);
      return;
    }

    const state: TerminalState = {
      username,
      domain:    OWNER.domain,
      theme,
      powered,
      history:   storage.getHistory(),
      startTime: startTime.current,
    };

    let result: ExecResult = { output: [] };
    try {
      result = await executeCommand(trimmed, state);
    } catch (e) {
      result = { output: [{ id: nanoid(6), kind: "error", text: String(e) }] };
    }

    const block: Block = { id, prompt, command: trimmed, output: result.output };
    setBlocks(prev => [...prev, block]);

    // Save to history
    const entry: HistoryEntry = { prompt, command: trimmed, output: result.output };
    storage.pushHistory(entry);
    setCmdHistory(prev => [...prev, trimmed]);
    setHistIndex(-1);
    setSavedInput("");

    // Apply side-effects after state updates
    if (result.sideEffect) applySideEffect(result.sideEffect);
  };

  /* ── Keyboard handler ──────────────────────────────────────── */
  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = getInput();
      clearInput();
      runCommand(val);
    }

    if (e.key === "Tab") {
      e.preventDefault();
      autocomplete();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = histIndex < 0
        ? cmdHistory.length - 1
        : Math.max(0, histIndex - 1);
      if (histIndex < 0) setSavedInput(getInput());
      setHistIndex(newIdx);
      setInput(cmdHistory[newIdx]);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex < 0) return;
      const newIdx = histIndex + 1;
      if (newIdx >= cmdHistory.length) {
        setHistIndex(-1);
        setInput(savedInput);
      } else {
        setHistIndex(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    }

    // Ctrl+L → clear screen
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setBlocks([]);
    }

    // Ctrl+C → cancel input
    if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      const val = getInput();
      clearInput();
      setBlocks(prev => [...prev, {
        id: nanoid(6),
        prompt: makePrompt(username, OWNER.domain),
        command: val + " ^C",
        output: [],
      }]);
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="terminal-wrap" data-theme={theme}>
      {/* Matrix rain overlay */}
      <MatrixRain
        active={matrixColor !== null}
        color={matrixColor || "green"}
        onEsc={() => setMatrixColor(null)}
      />

      {/* Power-off overlay */}
      {!powered && (
        <PowerOffOverlay onRestore={() => setPowered(true)} />
      )}

      {/* Main terminal */}
      <Header city={city} onPower={() => setPowered(p => !p)} />

      <div
        className="terminal-body"
        ref={bodyRef}
        onClick={focusInput}
        role="main"
        aria-label="Terminal output"
      >
        {/* Welcome banner */}
        <Banner />

        {/* History blocks */}
        {blocks.map(block => (
          <div key={block.id} className="history-block">
            {block.prompt && (
              <div className="prompt-line">
                <span className="prompt-text">{block.prompt}</span>
                {block.command && (
                  <span className="input-echo">&nbsp;{block.command}</span>
                )}
              </div>
            )}
            {block.output.map(ol => (
              <OutputLineComp key={ol.id} line={ol} />
            ))}
          </div>
        ))}

        {/* Active input row */}
        {powered && (
          <>
            <div className="input-row">
              <span className="prompt-text" aria-hidden="true">
                {makePrompt(username, OWNER.domain)}&nbsp;
              </span>
              <span
                ref={inputRef}
                className="input-editable"
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                role="textbox"
                aria-label="Terminal input"
                aria-multiline="false"
                onInput={handleInput}
                onKeyDown={handleKeyDown}
              />
            </div>

            {currentInput.trim() && commandSuggestions.length > 0 && (
              <div className="cmd-suggestions" aria-live="polite">
                {commandSuggestions.join("   ")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
