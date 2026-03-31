/* ────────────────────────────────────────────────────────────────
   Command handlers
   All synchronous commands return OutputLine[].
   Async commands return Promise<OutputLine[]>.
   ──────────────────────────────────────────────────────────────── */
"use client";

import { OutputLine, TerminalState } from "./types";
import { COMMANDS, CmdMeta } from "./commands-meta";
import { ABOUT_TEXT, CONTACT_TEXT, SOCIAL_TEXT, PROJECTS, PROJECTS_TEXT, THEMES, QUOTES, EMOJI_MAP, OWNER } from "./profile";
import { nanoid } from "nanoid";

/* ── helpers ────────────────────────────────────────────────── */
const line  = (text: string, kind: OutputLine["kind"] = "text"): OutputLine => ({ id: nanoid(8), kind, text });
const err   = (text: string): OutputLine => line(text, "error");
const ok    = (text: string): OutputLine => line(text, "success");
const muted = (text: string): OutputLine => line(text, "muted");
const acc   = (text: string): OutputLine => line(text, "accent");
const blank = ():              OutputLine => line("", "muted");

function fmtUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return ` Uptime: ${h}h ${m}m ${sec}s`;
}

function parseSeconds(val: string): number {
  // hh:mm:ss or plain seconds
  if (val.includes(":")) {
    const parts = val.split(":").map(Number);
    if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    if (parts.length === 2) return parts[0]*60 + parts[1];
  }
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function calendarMonth(month: number, year: number): string {
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days  = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const first = new Date(year, month - 1, 1).getDay();
  const total = new Date(year, month, 0).getDate();
  const today = new Date();

  let out = `📅 ${names[month-1]} ${year}\n\n${days.join(" ")}\n`;
  let row = " ".repeat(first * 3);
  for (let d = 1; d <= total; d++) {
    const cell = String(d).padStart(2, " ");
    row += (d === today.getDate() && month === today.getMonth()+1 && year === today.getFullYear())
        ? `[${String(d).padStart(2)}]`
        : `${cell} `;
    if ((first + d) % 7 === 0 || d === total) { out += row.trimEnd() + "\n"; row = ""; }
  }
  return out.trimEnd();
}

async function sha256(msg: string): Promise<string> {
  const buf = new TextEncoder().encode(msg);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function md5(msg: string): Promise<string> {
  // Lightweight pure-JS MD5 — not cryptographic use
  // Source: https://github.com/blueimp/JavaScript-MD5 (MIT)
  function safeAdd(x: number, y: number) { const lsw=(x&0xffff)+(y&0xffff); return (((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xffff); }
  function bitRotateLeft(num: number, cnt: number) { return (num<<cnt)|(num>>>(32-cnt)); }
  function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
  function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
  function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
  function md5blks(s:string){const p:number[]=[];for(let i=0;i<64*Math.ceil((s.length+9)/64);i+=4){p[i>>2]|=(s.charCodeAt(i)&0xff)<<((i%4)*8);}p[s.length>>2]|=0x80<<((s.length%4)*8);p[Math.ceil((s.length+9)/64)*16-2]=s.length*8;return p;}
  const blks=md5blks(msg);let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<blks.length;i+=16){const oA=a,oB=b,oC=c,oD=d;
    a=md5ff(a,b,c,d,blks[i],7,-680876936);d=md5ff(d,a,b,c,blks[i+1],12,-389564586);c=md5ff(c,d,a,b,blks[i+2],17,606105819);b=md5ff(b,c,d,a,blks[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,blks[i+4],7,-176418897);d=md5ff(d,a,b,c,blks[i+5],12,1200080426);c=md5ff(c,d,a,b,blks[i+6],17,-1473231341);b=md5ff(b,c,d,a,blks[i+7],22,-45705983);
    a=md5ff(a,b,c,d,blks[i+8],7,1770035416);d=md5ff(d,a,b,c,blks[i+9],12,-1958414417);c=md5ff(c,d,a,b,blks[i+10],17,-42063);b=md5ff(b,c,d,a,blks[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,blks[i+12],7,1804603682);d=md5ff(d,a,b,c,blks[i+13],12,-40341101);c=md5ff(c,d,a,b,blks[i+14],17,-1502002290);b=md5ff(b,c,d,a,blks[i+15],22,1236535329);
    a=md5gg(a,b,c,d,blks[i+1],5,-165796510);d=md5gg(d,a,b,c,blks[i+6],9,-1069501632);c=md5gg(c,d,a,b,blks[i+11],14,643717713);b=md5gg(b,c,d,a,blks[i],20,-373897302);
    a=md5gg(a,b,c,d,blks[i+5],5,-701558691);d=md5gg(d,a,b,c,blks[i+10],9,38016083);c=md5gg(c,d,a,b,blks[i+15],14,-660478335);b=md5gg(b,c,d,a,blks[i+4],20,-405537848);
    a=md5gg(a,b,c,d,blks[i+9],5,568446438);d=md5gg(d,a,b,c,blks[i+14],9,-1019803690);c=md5gg(c,d,a,b,blks[i+3],14,-187363961);b=md5gg(b,c,d,a,blks[i+8],20,1163531501);
    a=md5gg(a,b,c,d,blks[i+13],5,-1444681467);d=md5gg(d,a,b,c,blks[i+2],9,-51403784);c=md5gg(c,d,a,b,blks[i+7],14,1735328473);b=md5gg(b,c,d,a,blks[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,blks[i+5],4,-378558);d=md5hh(d,a,b,c,blks[i+8],11,-2022574463);c=md5hh(c,d,a,b,blks[i+11],16,1839030562);b=md5hh(b,c,d,a,blks[i+14],23,-35309556);
    a=md5hh(a,b,c,d,blks[i+1],4,-1530992060);d=md5hh(d,a,b,c,blks[i+4],11,1272893353);c=md5hh(c,d,a,b,blks[i+7],16,-155497632);b=md5hh(b,c,d,a,blks[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,blks[i+13],4,681279174);d=md5hh(d,a,b,c,blks[i],11,-358537222);c=md5hh(c,d,a,b,blks[i+3],16,-722521979);b=md5hh(b,c,d,a,blks[i+6],23,76029189);
    a=md5hh(a,b,c,d,blks[i+9],4,-640364487);d=md5hh(d,a,b,c,blks[i+12],11,-421815835);c=md5hh(c,d,a,b,blks[i+15],16,530742520);b=md5hh(b,c,d,a,blks[i+2],23,-995338651);
    a=md5ii(a,b,c,d,blks[i],6,-198630844);d=md5ii(d,a,b,c,blks[i+7],10,1126891415);c=md5ii(c,d,a,b,blks[i+14],15,-1416354905);b=md5ii(b,c,d,a,blks[i+5],21,-57434055);
    a=md5ii(a,b,c,d,blks[i+12],6,1700485571);d=md5ii(d,a,b,c,blks[i+3],10,-1894986606);c=md5ii(c,d,a,b,blks[i+10],15,-1051523);b=md5ii(b,c,d,a,blks[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,blks[i+8],6,1873313359);d=md5ii(d,a,b,c,blks[i+15],10,-30611744);c=md5ii(c,d,a,b,blks[i+6],15,-1560198380);b=md5ii(b,c,d,a,blks[i+13],21,1309151649);
    a=md5ii(a,b,c,d,blks[i+4],6,-145523070);d=md5ii(d,a,b,c,blks[i+11],10,-1120210379);c=md5ii(c,d,a,b,blks[i+2],15,718787259);b=md5ii(b,c,d,a,blks[i+9],21,-343485551);
    a=safeAdd(a,oA);b=safeAdd(b,oB);c=safeAdd(c,oC);d=safeAdd(d,oD);
  }
  function hexc(v:number){let s="";for(let i=0;i<4;i++){s+=("0"+((v>>>(i*8+4))&0xf).toString(16)).slice(-1)+("0"+((v>>>(i*8))&0xf).toString(16)).slice(-1);}return s;}
  return hexc(a)+hexc(b)+hexc(c)+hexc(d);
}

// ── Tic-Tac-Toe State (module-level) ─────────────────────────
let tttBoard: (string|null)[] = Array(9).fill(null);
function tttRender(board: (string|null)[]) {
  const s = board.map(c => c || " ");
  return [
    line(""),
    line(` ${s[0]} │ ${s[1]} │ ${s[2]}`),
    line("───┼───┼───"),
    line(` ${s[3]} │ ${s[4]} │ ${s[5]}`),
    line("───┼───┼───"),
    line(` ${s[6]} │ ${s[7]} │ ${s[8]}`),
    line(""),
    muted("Positions: 1─9  |  ttt reset to restart"),
  ];
}

function tttWinner(b: (string|null)[]): string|null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of lines) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a]!;
  return null;
}

function tttCpuMove(b: (string|null)[]): number {
  const empty = b.reduce<number[]>((a,v,i) => v===null ? [...a,i] : a, []);
  // win or block
  for (const mark of ["O","X"]) {
    for (const i of empty) {
      const test = [...b]; test[i]=mark;
      if (tttWinner(test)===mark) return i;
    }
  }
  if (b[4]===null) return 4;
  return empty[Math.floor(Math.random()*empty.length)];
}

// ── Stopwatch State (module-level) ─────────────────────────
let swStart: number|null = null;
let swElapsed = 0;
/* ═══════════════════════════════════════════════════════════════
   MAIN EXECUTOR
   Returns { output, sideEffect? }
   sideEffect can be: "clear_screen" | "clear_history" | "clear_all"
                    | "shutdown" | "reset" | "theme:<name>"
                    | "username:<name>" | "matrix:<color|off>"
                    | "open:<url>" | "reminder:<ms>:<msg>"
   ═══════════════════════════════════════════════════════════════ */
export interface ExecResult {
  output:     OutputLine[];
  sideEffect?: string;
}

export async function executeCommand(
  raw: string,
  state: TerminalState,
): Promise<ExecResult> {
  const trimmed = raw.trim();
  if (!trimmed) return { output: [] };

  const parts = trimmed.split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1);
  const rest  = args.join(" ");

  switch (cmd) {

    /* ── Navigation ─────────────────────────────────────────── */
    case "help":
    case "?": {
      if (args.length) {
        const target = args[0].toLowerCase();
        const meta: CmdMeta | undefined = COMMANDS[target];
        if (!meta) return { output: [err(`Command not found: ${target}`)] };
        const out: OutputLine[] = [
          acc(`📖 Command: ${target}`),
          line(`Description: ${meta.desc}`),
          line(`Usage: ${meta.usage}`),
        ];
        if (meta.example) out.push(line(`Example:\n  ${meta.example}`));
        if (meta.aliases?.length) out.push(muted(`Aliases: ${meta.aliases.join(", ")}`));
        return { output: out };
      }
      const sorted = Object.keys(COMMANDS).sort();
      const out: OutputLine[] = [
        acc("💡 Terminal Help Menu:"),
        blank(),
        line(sorted.join("   ")),
        blank(),
        acc("💡 Tip:"),
        line("  • Use help <command> (e.g. help weather) to see command details."),
        line("  • Use Tab for auto-completion and ↑/↓ to navigate history."),
      ];
      return { output: out };
    }

    case "commands": {
      const sorted = Object.entries(COMMANDS).sort(([a],[b]) => a.localeCompare(b));
      const out: OutputLine[] = [line("Commands with description:"), blank()];
      for (const [name, meta] of sorted) {
        out.push(line(`${name.padEnd(16)} - ${meta.desc}`));
      }
      return { output: out };
    }

    /* ── Profile ─────────────────────────────────────────────── */
    case "about":
    case "fatin":
    case "me":
    case "portfolio":
      return { output: [line(ABOUT_TEXT)] };

    case "contact":
      return { output: [line(CONTACT_TEXT)] };

    case "social":
      if (args.length) {
        const platform = args[0].toLowerCase();
        const links: Record<string, string | undefined> = {
          website: OWNER.website,
          linkedin: OWNER.linkedin,
          instagram: OWNER.instagram,
          facebook: OWNER.facebook,
          twitter: OWNER.twitter,
          github: OWNER.github,
        };
        const url = links[platform];
        if (!url) {
          return { output: [err(`Unknown social platform: ${platform}`)] };
        }
        return { output: [line(`Opening ${url}...`), ok("✅ Opened in new tab.")], sideEffect: `open:${url}` };
      }
      return { output: [line(`${SOCIAL_TEXT}\n\nType 'social <platform>' to go to the social media.`)] };

    case "projects": {
      const out: OutputLine[] = [];
      if (PROJECTS_TEXT) {
        out.push(line(PROJECTS_TEXT), blank());
      } else {
        out.push(line("Project highlights:"), blank());
        for (const p of PROJECTS) {
          out.push(acc(`• ${p.name}`));
        }
        out.push(blank());
      }
      out.push(muted("Hint: Run 'project 1', 'project 2', 'project 3' to view full details."));
      return { output: out };
    }

    case "project": {
      if (!args.length) {
        return {
          output: [
            err("Usage: project <number>"),
            muted(`Available: 1-${PROJECTS.length}`),
          ],
        };
      }

      const index = parseInt(args[0], 10);
      if (isNaN(index) || index < 1 || index > PROJECTS.length) {
        return {
          output: [
            err(`Invalid project number: ${args[0]}`),
            muted(`Try a number between 1 and ${PROJECTS.length}.`),
          ],
        };
      }

      const p = PROJECTS[index - 1];
      return {
        output: [
          acc(`📁 Project ${index}: ${p.name}`),
          blank(),
          line(`Description: ${p.desc}`),
          line(`Tech Stack:  ${p.stack || "N/A"}`),
          line(`URL:         ${p.url || "N/A"}`),
        ],
      };
    }

    case "github": {
      if (!args.length) return { output: [err(" Usage: github <username>")] };
      const user = args[0];
      const [uRes, rRes] = await Promise.all([
        fetch(`/api/github?user=${encodeURIComponent(user)}`),
        fetch(`/api/github?user=${encodeURIComponent(user)}&repos=1`),
      ]);
      if (!uRes.ok) return { output: [err(`GitHub user not found: ${user}`)] };
      const u = await uRes.json();
      const r = rRes.ok ? await rRes.json() : [];
      const out: OutputLine[] = [
        acc(`👤 ${u.name || user}`),
        muted(`@${u.login}`),
        blank(),
      ];
      if (u.bio)       out.push(line(`Bio:       ${u.bio}`));
      if (u.location)  out.push(line(`Location:  ${u.location}`));
      if (u.company)   out.push(line(`Company:   ${u.company}`));
      out.push(line(`Followers: ${u.followers}`), line(`Following: ${u.following}`), line(`Repos:     ${u.public_repos}`), blank());
      if (Array.isArray(r) && r.length) {
        out.push(acc("📦 Top repositories:"));
        for (const repo of r.slice(0,6)) {
          out.push(line(`  • ${repo.name.padEnd(28)} ⭐${repo.stargazers_count}  ${repo.description || ""}`));
        }
      }
      return { output: out };
    }

    /* ── Date / Time / System ────────────────────────────────── */
    case "date":
      return { output: [line(new Date().toDateString())] };

    case "time":
      return { output: [line(new Date().toLocaleTimeString())] };

    case "uptime":
      return { output: [line(fmtUptime(Date.now() - state.startTime))] };

    case "whoami": {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
      const os = (() => {
        if (ua.includes("Win")) return "Windows";
        if (ua.includes("Mac")) return "macOS";
        if (ua.includes("Linux")) return "Linux";
        if (ua.includes("Android")) return "Android";
        if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
        return "Unknown";
      })();
      const bname = (() => {
        if (ua.includes("Firefox")) return "Firefox";
        if (ua.includes("Chrome")) return "Google Chrome";
        if (ua.includes("Safari")) return "Safari";
        if (ua.includes("Edge")) return "Edge";
        return "Unknown";
      })();
      return { output: [
        line(` Username: ${state.username}`),
        line(` OS:       ${os}`),
        line(` Browser:  ${bname}`),
        muted(` UA:       ${ua.slice(0,80)}...`),
      ]};
    }

    case "sysinfo": {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
      return { output: [
        acc("💻 System Info:"),
        blank(),
        line(` Platform:   ${typeof navigator !== "undefined" ? navigator.platform : "unknown"}`),
        line(` Language:   ${typeof navigator !== "undefined" ? navigator.language : "unknown"}`),
        line(` Cores:      ${typeof navigator !== "undefined" ? navigator.hardwareConcurrency : "unknown"}`),
        line(` Screen:     ${typeof window !== "undefined" ? `${window.screen.width}×${window.screen.height}` : "unknown"}`),
        line(` Viewport:   ${typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : "unknown"}`),
        muted(` UA:         ${ua.slice(0,90)}...`),
      ]};
    }

    case "history": {
      if (!state.history.length) return { output: [muted("No command history available.")] };
      return { output: state.history.map((h,i) => line(`${i+1}: ${h.command}`)) };
    }

    /* ── Terminal control ────────────────────────────────────── */
    case "clear": {
      const sub = args[0]?.toLowerCase() || "screen";
      if (sub === "history") return { output: [ok("Command history cleared.")], sideEffect: "clear_history" };
      if (sub === "all")     return { output: [],                               sideEffect: "clear_all" };
      return { output: [], sideEffect: "clear_screen" };
    }

    case "reset":
      return { output: [ok("Terminal reset to default.")], sideEffect: "reset" };

    case "shutdown":
      return { output: [err("System shutdown initiated")], sideEffect: "shutdown" };

    /* ── Personalisation ─────────────────────────────────────── */
    case "username": {
      if (!args.length) return { output: [line(`Current username: ${state.username}`)] };
      const newName = args[0].replace(/[^a-zA-Z0-9_-]/g,"").slice(0,30) || state.username;
      return { output: [ok(`Username updated to '${newName}'`)], sideEffect: `username:${newName}` };
    }

    case "set": {
      if (!args.length) return { output: [line("Usage: set <theme|username|city> <value>")] };
      const sub = args[0].toLowerCase();
      const val = args.slice(1).join(" ").trim();
      if (sub === "username") {
        const newName = val.replace(/[^a-zA-Z0-9_-]/g,"").slice(0,30) || state.username;
        return { output: [ok(`Username updated to '${newName}'`)], sideEffect: `username:${newName}` };
      }
      if (sub === "theme") {
        if (!val) return { output: [err("Usage: set theme <name>"),muted("Try: theme list")] };
        if (!THEMES.includes(val.toLowerCase() as typeof THEMES[number])) {
          return { output: [err(`Unknown theme '${val}'`), muted(`Available: ${THEMES.join(", ")}`)] };
        }
        return { output: [ok(`Theme changed to '${val}'`)], sideEffect: `theme:${val}` };
      }
      if (sub === "city") {
        if (!val) return { output: [err("Usage: set city <name>")] };
        return { output: [ok(`City updated to '${val}'`)], sideEffect: `city:${val}` };
      }
      return { output: [err(`Unknown set target: ${sub}`)] };
    }

    case "theme": {
      if (!args.length || args[0] === "list") return { output: [line(THEMES.join("   "))] };
      const t = args[0].toLowerCase();
      if (!THEMES.includes(t as typeof THEMES[number])) return { output: [err(`Unknown theme '${t}'`), muted(`Available: ${THEMES.join(", ")}`)] };
      return { output: [ok(`Theme changed to '${t}'`)], sideEffect: `theme:${t}` };
    }

    /* ── Utilities — text transforms ─────────────────────────── */
    case "uppercase":
      if (!rest) return { output: [err("Usage: uppercase <text>")] };
      return { output: [line(rest.toUpperCase())] };

    case "lowercase":
      if (!rest) return { output: [err("Usage: lowercase <text>")] };
      return { output: [line(rest.toLowerCase())] };

    case "capitalize":
      if (!rest) return { output: [err("Usage: capitalize <text>")] };
      return { output: [line(rest.replace(/\b\w/g, c => c.toUpperCase()))] };

    case "reverse":
      if (!rest) return { output: [err("Usage: reverse <text>")] };
      return { output: [line(rest.split("").reverse().join(""))] };

    case "base64": {
      const mode = args[0]?.toLowerCase();
      const data = args.slice(1).join(" ");
      if (!mode || !data) return { output: [err("Usage: base64 encode <text> | base64 decode <string>")] };
      try {
        if (mode === "encode") return { output: [line(btoa(unescape(encodeURIComponent(data))))] };
        if (mode === "decode") return { output: [line(decodeURIComponent(escape(atob(data))))] };
      } catch { return { output: [err("Invalid base64 string.")] }; }
      return { output: [err("Usage: base64 encode|decode <value>")] };
    }

    case "hash": {
      if (!rest) return { output: [err("Usage: hash <text>")] };
      const [s256, m5] = await Promise.all([sha256(rest), md5(rest)]);
      return { output: [
        acc(`🔒 Hash for '${rest}':`),
        blank(),
        line(`SHA256: ${s256}`),
        line(`MD5:    ${m5}`),
      ]};
    }

    /* ── Utilities — random / fun ────────────────────────────── */
    case "coin":
      return { output: [line(Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails")] };

    case "dice": {
      const count = Math.min(Math.max(parseInt(args[0] || "1", 10), 1), 10);
      const faces = ["⚀","⚁","⚂","⚃","⚄","⚅"];
      const rolls = Array.from({ length: count }, () => Math.floor(Math.random()*6));
      return { output: [line(rolls.map(r => faces[r]).join("  "))] };
    }

    case "rps": {
      const choices = ["rock","paper","scissors"];
      const player = args[0]?.toLowerCase();
      if (!choices.includes(player)) return { output: [err("Usage: rps <rock|paper|scissors>")] };
      const cpu = choices[Math.floor(Math.random()*3)];
      const win = (player==="rock"&&cpu==="scissors")||(player==="paper"&&cpu==="rock")||(player==="scissors"&&cpu==="paper");
      const tie = player===cpu;
      return { output: [
        line(`You chose ${player}, computer chose ${cpu}. `),
        win ? ok(" You win! 🎉") : tie ? muted(" It's a tie! 🤝") : err(" You lose! 😢"),
      ]};
    }

    case "ttt": {
      if (!args.length) {
        return { output: [err("Usage: ttt <1-9> | ttt reset"), ...tttRender(tttBoard)] };
      }
      if (args[0].toLowerCase() === "reset") {
        tttBoard = Array(9).fill(null);
        return { output: [ok("Board reset!"), ...tttRender(tttBoard)] };
      }
      const pos = parseInt(args[0], 10);
      if (isNaN(pos) || pos < 1 || pos > 9) return { output: [err("Invalid move. Use: ttt <1-9> or ttt reset")] };
      const idx = pos - 1;
      if (tttBoard[idx]) return { output: [err(`Cell ${pos} is already taken.`), ...tttRender(tttBoard)] };
      const w1 = tttWinner(tttBoard);
      if (w1 || !tttBoard.includes(null)) return { output: [muted("Game is over. Type ttt reset to play again.")] };

      tttBoard[idx] = "X";
      const w2 = tttWinner(tttBoard);
      if (w2) return { output: [ok("🎉 You win!"), ...tttRender(tttBoard)] };
      if (!tttBoard.includes(null)) return { output: [muted("🤝 Draw!"), ...tttRender(tttBoard)] };

      const cpuIdx = tttCpuMove(tttBoard);
      tttBoard[cpuIdx] = "O";
      const w3 = tttWinner(tttBoard);
      if (w3) return { output: [err("🤖 Computer wins!"), ...tttRender(tttBoard)] };
      if (!tttBoard.includes(null)) return { output: [muted("🤝 Draw!"), ...tttRender(tttBoard)] };
      return { output: [...tttRender(tttBoard), muted(`Computer played at ${cpuIdx+1}`)] };
    }

    case "quote":
      return { output: [
        acc("💬 Quote of the Moment:"),
        line("   " + QUOTES[Math.floor(Math.random()*QUOTES.length)]),
      ]};

    case "emoji": {
      if (!rest) return { output: [err("Usage: emoji <keyword>"), muted("Available: " + Object.keys(EMOJI_MAP).join(", "))] };
      const e = EMOJI_MAP[rest.toLowerCase()];
      return { output: e ? [line(`Emoji for '${rest}': ${e}`)] : [err(`No emoji for '${rest}'`), muted("Try: " + Object.keys(EMOJI_MAP).slice(0,6).join(", "))] };
    }

    case "ascii": {
      if (!rest) return { output: [err("Usage: ascii <text>")] };
      // Simple big-char ASCII art using block chars
      const chars: Record<string,string[]> = {
        A:["█████","█   █","█████","█   █","█   █"],
        B:["████ ","█   █","████ ","█   █","████ "],
        C:["█████","█    ","█    ","█    ","█████"],
        D:["████ ","█   █","█   █","█   █","████ "],
        E:["█████","█    ","████ ","█    ","█████"],
        F:["█████","█    ","████ ","█    ","█    "],
        G:["█████","█    ","█  ██","█   █","█████"],
        H:["█   █","█   █","█████","█   █","█   █"],
        I:["█████","  █  ","  █  ","  █  ","█████"],
        J:["█████","  █  ","  █  ","█ █  ","████ "],
        K:["█   █","█  █ ","███  ","█  █ ","█   █"],
        L:["█    ","█    ","█    ","█    ","█████"],
        M:["█   █","██ ██","█ █ █","█   █","█   █"],
        N:["█   █","██  █","█ █ █","█  ██","█   █"],
        O:["█████","█   █","█   █","█   █","█████"],
        P:["████ ","█   █","████ ","█    ","█    "],
        Q:["█████","█   █","█ █ █","█  █ ","████▄"],
        R:["████ ","█   █","████ ","█  █ ","█   █"],
        S:["█████","█    ","█████","    █","█████"],
        T:["█████","  █  ","  █  ","  █  ","  █  "],
        U:["█   █","█   █","█   █","█   █","█████"],
        V:["█   █","█   █","█   █"," █ █ ","  █  "],
        W:["█   █","█   █","█ █ █","██ ██","█   █"],
        X:["█   █"," █ █ ","  █  "," █ █ ","█   █"],
        Y:["█   █"," █ █ ","  █  ","  █  ","  █  "],
        Z:["█████","   █ ","  █  "," █   ","█████"],
        "0":["█████","█   █","█   █","█   █","█████"],
        "1":["  █  ","  █  ","  █  ","  █  ","  █  "],
        " ":["     ","     ","     ","     ","     "],
        "!":["  █  ","  █  ","  █  ","     ","  █  "],
      };
      const upper = rest.toUpperCase().slice(0,12);
      const rows = ["","","","",""];
      for (const ch of upper) {
        const g = chars[ch] || chars[" "];
        for (let r=0;r<5;r++) rows[r] += (g?.[r] || "     ") + " ";
      }
      return { output: rows.map(r => line(r)) };
    }

    case "calendar": {
      const now = new Date();
      const month = args[0] ? parseInt(args[0],10) : now.getMonth()+1;
      const year  = args[1] ? parseInt(args[1],10) : now.getFullYear();
      if (month<1||month>12) return { output: [err("Month must be 1-12.")] };
      return { output: [line(calendarMonth(month,year))] };
    }

    case "countdays": {
      if (!rest) return { output: [err("Usage: countdays <YYYY-MM-DD>")] };
      const d = new Date(rest);
      if (isNaN(d.getTime())) return { output: [err("Invalid date format.")] };
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
      return { output: [ line(
        diff >= 0
          ? `📅 ${diff} day(s) have passed since ${d.toDateString()}`
          : `📅 ${Math.abs(diff)} day(s) until ${d.toDateString()}`
      )]};
    }

    case "age": {
      if (!rest) return { output: [err("Usage: age [YYYY-MM-DD | DD-MM-YYYY | DD/MM/YYYY]")] };
      let d: Date | null = null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(rest)) d = new Date(rest);
      else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(rest)) {
        const [day,mon,yr] = rest.split(/[-/]/);
        d = new Date(`${yr}-${mon}-${day}`);
      }
      if (!d || isNaN(d.getTime())) return { output: [err("Invalid date format.")] };
      const now = new Date();
      let years = now.getFullYear() - d.getFullYear();
      let months = now.getMonth() - d.getMonth();
      let days = now.getDate() - d.getDate();
      if (days < 0)   { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (months < 0) { years--; months += 12; }
      return { output: [line(`🎂 Age: ${years} years, ${months} months, ${days} days`)] };
    }

    /* ── Interactive ─────────────────────────────────────────── */
    case "matrix":
      return { output: [
        line("🌌 Starting Matrix..."),
        muted("Press Esc to stop once started."),
      ], sideEffect: `matrix:${args[0] || "green"}` };

    case "stopwatch": {
      const sub = args[0]?.toLowerCase() || "start";
      if (sub === "start") {
        if (swStart !== null) return { output: [muted("Stopwatch already running.")] };
        swStart = Date.now() - swElapsed;
        return { output: [acc(`⏱️ 0h 0m 0s`)], sideEffect: "stopwatch:start" };
      }
      if (sub === "stop") {
        if (swStart === null) return { output: [muted("Stopwatch is not running.")] };
        swElapsed = Date.now() - swStart;
        swStart = null;
        return { output: [ok(`⏸️ Stopwatch stopped! ${fmtUptime(swElapsed).trim()}`)] };
      }
      if (sub === "reset") {
        swStart = null;
        swElapsed = 0;
        return { output: [ok("🔄 Stopwatch reset.")] };
      }
      return { output: [err("Usage: stopwatch [start|stop|reset]")] };
    }

    case "timer": {
      if (!args.length) return { output: [err("Usage: timer <seconds|hh:mm:ss>")] };
      const secs = parseSeconds(args[0]);
      if (!secs || secs < 1) return { output: [err("Invalid duration.")] };
      return {
        output: [acc(`⏳ Timer set for ${secs}s...`)],
        sideEffect: `timer:${secs}`,
      };
    }

    case "remind": {
      if (args.length < 2) return { output: [err("Usage: remind <seconds|hh:mm:ss> <message>")] };
      const secs = parseSeconds(args[0]);
      if (!secs || secs < 1) return { output: [err("Invalid duration.")] };
      const msg = args.slice(1).join(" ");
      return {
        output: [acc(`⏳ Reminder set for ${secs} second(s): "${msg}"`)],
        sideEffect: `remind:${secs}:${msg}`,
      };
    }

    /* ── Network / Async ─────────────────────────────────────── */
    case "weather": {
      const city = rest || "";
      const r = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      if (!r.ok) return { output: [err("Error fetching weather.")] };
      const d = await r.json();
      if (d.error) return { output: [err(d.error)] };
      return { output: [
        acc(`🌤️ Weather for ${d.city}:`),
        line(`Temperature: ${d.temp}°C`),
        line(`Wind:        ${d.wind} km/h`),
        line(`Condition:   ${d.condition}`),
        muted(`Time:        ${d.time}`),
      ]};
    }

    case "ip": {
      const addr = args[0] || "";
      const r = await fetch(`/api/ip?addr=${encodeURIComponent(addr)}`);
      if (!r.ok) return { output: [err("Error fetching IP info.")] };
      const d = await r.json();
      if (d.error) return { output: [err(d.error)] };
      return { output: [
        line(` IP Address: ${d.ip}`),
        line(` City:       ${d.city}`),
        line(` Region:     ${d.region}`),
        line(` Country:    ${d.country}`),
        line(` ISP/Org:    ${d.org}`),
      ]};
    }

    case "geo": {
      if (args.length < 2) return { output: [err("Usage: geo <lat> <lon>")] };
      const [lat,lon] = [args[0], args[1]];
      const r = await fetch(`/api/geo?lat=${lat}&lon=${lon}`);
      if (!r.ok) return { output: [err("Error fetching geo info.")] };
      const d = await r.json();
      if (d.error) return { output: [err(d.error)] };
      return { output: [line(`📍 Location: ${d.display_name}`)] };
    }

    case "define": {
      if (!rest) return { output: [err("Usage: define <word>")] };
      const r = await fetch(`/api/define?word=${encodeURIComponent(rest)}`);
      if (!r.ok) return { output: [err("Definition lookup failed.")] };
      const d = await r.json();
      if (d.error) return { output: [err(d.error)] };
      const out: OutputLine[] = [acc(`📖 Definitions for '${rest}':`), blank()];
      for (const entry of (d.definitions as {partOfSpeech:string,definition:string}[]).slice(0,5)) {
        out.push(line(`${entry.partOfSpeech}: ${entry.definition}`));
      }
      return { output: out };
    }

    case "synonym": {
      if (!rest) return { output: [err("Usage: synonym <word>")] };
      const r = await fetch(`/api/define?word=${encodeURIComponent(rest)}&synonyms=1`);
      if (!r.ok) return { output: [err("Synonym lookup failed.")] };
      const d = await r.json();
      if (d.error || !d.synonyms?.length) return { output: [muted(`No synonyms found for '${rest}'.`)] };
      return { output: [line(`Synonyms for '${rest}': ${(d.synonyms as string[]).slice(0,12).join(", ")}`)] };
    }

    case "antonym": {
      if (!rest) return { output: [err("Usage: antonym <word>")] };
      const r = await fetch(`/api/define?word=${encodeURIComponent(rest)}&antonyms=1`);
      if (!r.ok) return { output: [err("Antonym lookup failed.")] };
      const d = await r.json();
      if (d.error || !d.antonyms?.length) return { output: [muted(`No antonyms found for '${rest}'.`)] };
      return { output: [line(`Antonyms for '${rest}': ${(d.antonyms as string[]).slice(0,12).join(", ")}`)] };
    }

    case "translate": {
      if (args.length < 2) return { output: [err("Usage: translate <text> <lang_code>"), muted("e.g. translate hello es")] };
      const lang = args[args.length-1];
      const text = args.slice(0,-1).join(" ");
      const r = await fetch(`/api/translate?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`);
      if (!r.ok) return { output: [err("Translation failed.")] };
      const d = await r.json();
      if (d.error) return { output: [err(d.error)] };
      return { output: [acc(`🌐 Translated to [${lang}]:`), line(` ${d.translated}`)] };
    }

    case "country": {
      if (!rest) return { output: [err("Usage: country <name>")] };
      try {
        const r = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(rest)}?fields=name,capital,population,region,subregion,flags,languages,currencies`);
        if (!r.ok) return { output: [err(`Country not found: ${rest}`)] };
        const [c]: [{
          name: { common: string };
          capital?: string[];
          population: number;
          region: string;
          subregion?: string;
          languages?: Record<string, string>;
          currencies?: Record<string, { name: string; symbol?: string }>;
        }] = await r.json();
        const currencies = Object.values(c.currencies || {}).map(v => `${v.name}${v.symbol ? ` (${v.symbol})` : ""}`).join(", ");
        const languages  = Object.values(c.languages || {}).join(", ");
        return { output: [
          acc(`🌍 ${c.name.common}`),
          blank(),
          line(`Capital:    ${c.capital?.[0] || "N/A"}`),
          line(`Region:     ${c.region} / ${c.subregion}`),
          line(`Population: ${c.population.toLocaleString()}`),
          line(`Currencies: ${currencies}`),
          line(`Languages:  ${languages}`),
        ]};
      } catch { return { output: [err("Country lookup failed.")] }; }
    }

    case "qr":
      if (!rest) return { output: [err("Usage: qr <text>")] };
      return { output: [
        { id: nanoid(8), kind: "img", text: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(rest)}` }
      ]};

    case "asciiqr": {
      if (!rest) return { output: [err("Usage: asciiqr <text>")] };
      const r = await fetch(`/api/curl?url=${encodeURIComponent(`https://qrcode.show/${encodeURIComponent(rest)}`)}`);
      if (!r.ok) return { output: [err("asciiqr failed.")] };
      const d = await r.json();
      return { output: [line(d.body?.slice(0,2000) || "Could not generate ASCII QR.")] };
    }

    default:
      return { output: [err(`Command not found: ${cmd}`), muted("Type 'help' to see available commands.")] };
  }
}
