/* ────────────────────────────────────────────────────────────────
   Command metadata registry
   ──────────────────────────────────────────────────────────────── */

export interface CmdMeta {
  desc:    string;
  usage:   string;
  example?: string;
  aliases?: string[];
}

export const COMMANDS: Record<string, CmdMeta> = {
  "?":         { desc: "Show available commands or details for a specific command.", usage: "? [command]", aliases: ["help"] },
  fatin:       { desc: "Display the portfolio owner's profile details.", usage: "fatin", aliases: ["me", "portfolio"] },
  about:       { desc: "Display details about background, education, and skills.", usage: "about" },
  age:         { desc: "Calculate exact age from a date.", usage: "age [YYYY-MM-DD | DD-MM-YYYY | DD/MM/YYYY]", example: "age 1995-06-15" },
  antonym:     { desc: "Find antonyms for a word.", usage: "antonym <word>", example: "antonym happy" },
  ascii:       { desc: "Convert text to ASCII art.", usage: "ascii <text>", example: "ascii hello" },
  asciiqr:     { desc: "Generate ASCII QR code for text or URL.", usage: "asciiqr <text>", example: "asciiqr https://example.com" },
  base64:      { desc: "Encode or decode base64 string.", usage: "base64 encode <text> | base64 decode <string>", example: "base64 encode hello" },
  calendar:    { desc: "Display a calendar for the current month.", usage: "calendar [month] [year]", example: "calendar 3 2026" },
  capitalize:  { desc: "Capitalise the first letter of each word.", usage: "capitalize <text>", example: "capitalize hello world" },
  clear:       { desc: "Clear the terminal screen, history, or both.", usage: "clear [screen|history|all]", example: "clear all" },
  coin:        { desc: "Flip a coin — heads or tails.", usage: "coin" },
  commands:    { desc: "Show all commands with descriptions.", usage: "commands" },
  contact:     { desc: "Show contact details.", usage: "contact" },
  countdays:   { desc: "Count days since or until a date.", usage: "countdays <YYYY-MM-DD>", example: "countdays 2026-01-01" },
  country:     { desc: "Get info about a country.", usage: "country <name>", example: "country Canada" },
  date:        { desc: "Display the current date.", usage: "date" },
  define:      { desc: "Look up the definition of a word.", usage: "define <word>", example: "define cloud" },
  dice:        { desc: "Roll a dice (1-6) or multiple dice.", usage: "dice [count]", example: "dice 2" },
  emoji:       { desc: "Show emoji for a keyword.", usage: "emoji <keyword>", example: "emoji fire" },
  geo:         { desc: "Get location details from lat/lon coordinates.", usage: "geo <lat> <lon>", example: "geo 37.7749 -122.4194" },
  github:      { desc: "Fetch GitHub user profile and repos.", usage: "github <username>", example: "github torvalds" },
  hash:        { desc: "SHA-256 and MD5 hash of a string.", usage: "hash <text>", example: "hash hello world" },
  help:        { desc: "Show available commands or details for a specific command.", usage: "help [command]", example: "help weather", aliases: ["?"] },
  history:     { desc: "View or clear command history.", usage: "history", example: "history" },
  ip:          { desc: "Get public IP or info for an IP address.", usage: "ip [address]", example: "ip 8.8.8.8" },
  lowercase:   { desc: "Convert text to lower case.", usage: "lowercase <text>", example: "lowercase HELLO WORLD" },
  matrix:      { desc: "Toggle Matrix rain animation.", usage: "matrix [on|off|color]", example: "matrix green" },
  project:     { desc: "Show full details for a single project by number.", usage: "project <number>", example: "project 1" },
  projects:    { desc: "Show my project highlights.", usage: "projects" },
  qr:          { desc: "Generate a scannable QR code for text/URL.", usage: "qr <text>", example: "qr https://example.com" },
  quote:       { desc: "Show a random programming quote.", usage: "quote" },
  remind:      { desc: "Set a reminder after N seconds.", usage: "remind <seconds|hh:mm:ss> <message>", example: "remind 30 Take a break" },
  reset:       { desc: "Reset terminal to default state.", usage: "reset [all]", example: "reset all" },
  reverse:     { desc: "Reverse a string.", usage: "reverse <text>", example: "reverse hello" },
  rps:         { desc: "Play rock-paper-scissors.", usage: "rps <rock|paper|scissors>", example: "rps rock" },
  set:         { desc: "Set username, theme, or city.", usage: "set <username|theme|city> <value>", example: "set city Tokyo" },
  shutdown:    { desc: "Simulate terminal shutdown.", usage: "shutdown" },
  social:      { desc: "Show social media profiles.", usage: "social" },
  stopwatch:   { desc: "Start, stop, or reset a stopwatch.", usage: "stopwatch [start|stop|reset]", example: "stopwatch start" },
  synonym:     { desc: "Find synonyms for a word.", usage: "synonym <word>", example: "synonym fast" },
  sysinfo:     { desc: "Show browser and system info.", usage: "sysinfo" },
  theme:       { desc: "List themes or change the current theme.", usage: "theme [name]", example: "theme dracula" },
  time:        { desc: "Display the current time.", usage: "time" },
  timer:       { desc: "Countdown timer in seconds or hh:mm:ss.", usage: "timer <seconds|hh:mm:ss>", example: "timer 60" },
  translate:   { desc: "Translate text to another language.", usage: "translate <text> <lang_code>", example: "translate hello es" },
  ttt:         { desc: "Play Tic-Tac-Toe against the computer.", usage: "ttt <1-9> | ttt reset", example: "ttt 5" },
  uppercase:   { desc: "Convert text to upper case.", usage: "uppercase <text>", example: "uppercase hello world" },
  uptime:      { desc: "Show time since terminal was opened.", usage: "uptime" },
  username:    { desc: "Show or change your prompt username.", usage: "username [new name]", example: "username cyber" },
  weather:     { desc: "Show current weather for your location or a city.", usage: "weather [city]", example: "weather London" },
  whoami:      { desc: "Show current user and system info.", usage: "whoami" },
};
