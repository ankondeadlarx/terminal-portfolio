/* ────────────────────────────────────────────────────────────────
   PROFILE DATA — edit everything here to personalise your terminal
   ──────────────────────────────────────────────────────────────── */

export const OWNER = {
  name:     "Fatin Abrar Ankon",
  tagline:  "Cybersecurity Enthusiast | CS Student @ University of Calgary",
  username: "visitor",             // default prompt username
  domain:   "fatin.dev",        // used in prompt:  username@domain:~$
  location: "Calgary, Alberta, Canada",
  role:     "CS Student & Cybersecurity Enthusiast",
  company:  "University of Calgary",
  email:    "fatinxabrar@gmail.com",
  phone:    "",
  website:  "",
  github:   "https://github.com/ankondeadlarx",
  linkedin: "https://linkedin.com/in/fatinabrarankon",
  instagram:"",
  facebook: "",
  twitter:  "",
  birthdate:"",
};

export const ABOUT_TEXT = `
  Name      : ${OWNER.name}
  Role      : ${OWNER.role}
  Location  : ${OWNER.location}
  Company   : ${OWNER.company}

  Hey! I'm Fatin — a CS student at the University of Calgary with a deep
  interest in cybersecurity. I spend my time exploring offensive & defensive
  security, diving into CTF challenges, and building tools that sit at the
  intersection of code and security.

  Whether it's reverse engineering a binary, scripting an exploit, or just
  tinkering with a Linux box at 2am — I'm probably doing one of those.

  Type 'projects' to see what I've been building.
  Type 'contact'  to reach out.
`;

export const PROJECTS = [
  {
    name:  "Terminal Portfolio",
    desc:  "Interactive terminal-style personal portfolio built with Next.js, TypeScript, and Tailwind CSS.",
    url:   "",
    stack: "Next.js, TypeScript, Tailwind CSS",
  },
  {
    name:  "FamChat",
    desc:  "A family-focused chat application built for easy communication, sharing updates, and staying connected in one place.",
    url:   "",
    stack: "React, Vite, Socket.IO, Node.js, SQLite, JWT, Express",
  },
  {
    name:  "Online Multiplayer Board Game Platform",
    desc:  "Course project built with a team of 16 using Java/JavaFX. Includes Connect 4, Tic-Tac-Toe, Checkers, and Whist in an online multiplayer experience.",
    url:   "",
    stack: "Java, JavaFX",
  },
];

export const PROJECTS_TEXT = `Project highlights:
• Terminal Portfolio – This interactive portfolio shell.
• FamChat – A family-focused chat app for streamlined communication.
• Online Multiplayer Board Game Platform – Java/JavaFX team project with Connect 4, Tic-Tac-Toe, Checkers, and Whist.`;

export const CONTACT_TEXT = `Contact Details:
  Email    - ${OWNER.email}
  GitHub   - ${OWNER.github || "N/A"}
  LinkedIn - ${OWNER.linkedin || "N/A"}
  Website  - ${OWNER.website || "N/A"}
  Mobile   - ${OWNER.phone || "N/A"}
`;

export const SOCIAL_TEXT = `Social Links:
  GitHub   - ${OWNER.github || "N/A"}
  LinkedIn - ${OWNER.linkedin || "N/A"}
  Instagram- ${OWNER.instagram || "N/A"}
  Twitter  - ${OWNER.twitter || "N/A"}
  Facebook - ${OWNER.facebook || "N/A"}
`;

export const THEMES = [
  "ash",
  "dracula",
  "gruvbox",
  "light",
  "matrix",
  "monokai",
  "nord",
  "solarized",
  "tokyo",
  "ubuntu",
] as const;

export type Theme = typeof THEMES[number];

export const QUOTES = [
  "The best code is no code at all.",
  "First, solve the problem. Then, write the code. — John Johnson",
  "Simplicity is the soul of efficiency. — Austin Freeman",
  "Make it work, make it right, make it fast. — Kent Beck",
  "Programs must be written for people to read. — Harold Abelson",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "The most disastrous thing that you can ever learn is your first programming language. — Alan Kay",
  "Measuring programming progress by lines of code is like measuring aircraft building progress by weight. — Bill Gates",
  "Your biggest asset isn't your technical skill; it's your ability to learn, adapt, and teach others.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
];

export const EMOJI_MAP: Record<string, string> = {
  smile: "😊", laugh: "😂", love: "❤️", star: "⭐", fire: "🔥",
  check: "✅", cross: "❌", warn: "⚠️", info: "ℹ️", clap: "👏",
  rocket: "🚀", eyes: "👀", think: "🤔", cool: "😎", sad: "😢",
  party: "🎉", skull: "💀", wave: "👋", heart: "💙", code: "💻",
  bug: "🐛", coffee: "☕", moon: "🌙", sun: "☀️", rain: "🌧️",
  globe: "🌍", lock: "🔒", key: "🔑", folder: "📁", note: "📝",
};
