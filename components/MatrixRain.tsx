"use client";

import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
  color?: string;
  onEsc: () => void;
}

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%^&*";

export default function MatrixRain({ active, color = "green", onEsc }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const colsRef   = useRef<number[]>([]);

  // Map color name to actual CSS color
  const colorMap: Record<string, string> = {
    green:  "#00ff41",
    red:    "#ff2a2a",
    blue:   "#0af",
    purple: "#b44fff",
    yellow: "#ffe600",
    white:  "#fff",
    cyan:   "#00f7ff",
    pink:   "#ff69b4",
  };
  const fg = colorMap[color] || colorMap.green;

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / 16);
      colsRef.current = Array(cols).fill(1);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = fg;
      ctx.font = "15px monospace";

      colsRef.current.forEach((y, i) => {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillText(ch, i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) {
          colsRef.current[i] = 0;
        } else {
          colsRef.current[i]++;
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { cancelAnimationFrame(rafRef.current); onEsc(); }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", handleKey);
    };
  }, [active, fg, onEsc]);

  if (!active) return null;

  return (
    <div className="matrix-overlay active" onClick={onEsc} title="Click or press Esc to stop">
      <canvas ref={canvasRef} />
    </div>
  );
}
