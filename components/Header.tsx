"use client";

import { useEffect, useState } from "react";
import { OWNER } from "@/lib/profile";

interface Props {
  onPower: () => void;
  city?: string;
}

export default function Header({ onPower, city = "" }: Props) {
  const [time,    setTime]    = useState("");
  const [weather, setWeather] = useState<string | null>(null);

  // Clock — update every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Weather — fetch once on mount
  useEffect(() => {
    const query = city ? `?city=${encodeURIComponent(city)}` : "";
    fetch(`/api/weather${query}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.temp !== undefined && d?.condition) setWeather(`${d.city} ${d.temp}°C`);
      })
      .catch(() => {/* silently ignore */});
  }, [city]);

  return (
    <header className="terminal-header">
      <div className="header-left">
        <span className="header-title">
          {OWNER.name}
        </span>
      </div>
      <div className="header-center">
        {time && <span className="header-clock">{time}</span>}
      </div>
      <div className="header-right">
        {weather && <span className="header-weather">{weather}</span>}
        {OWNER.website && (
          <a
            href={OWNER.website}
            target="_blank"
            rel="noopener noreferrer"
            className="header-link"
            title="Portfolio website"
          >
            🌐
          </a>
        )}
        <button
          className="header-btn header-power"
          onClick={onPower}
          title="Shutdown / Power"
          aria-label="Power button"
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
