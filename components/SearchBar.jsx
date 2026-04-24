import React, { useMemo, useRef, useState } from "react";

function norm(s) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export default function SearchBar({ countries, cities, onSelectLocation }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = norm(query);
    if (!q) return [];

    const countryHits = countries
      .map((c) => ({ type: "country", label: c.name, flag: c.flagEmoji, countryId: c.id, region: c.region }))
      .filter((x) => norm(x.label).includes(q));

    const cityHits = cities
      .map((ct) => {
        const country = countries.find((c) => c.id === ct.countryId);
        return {
          type: "city",
          label: ct.name,
          sublabel: country?.name ?? ct.countryId,
          flag: country?.flagEmoji ?? "",
          countryId: ct.countryId,
          cityId: ct.id,
        };
      })
      .filter((x) => norm(x.label).includes(q) || norm(x.sublabel).includes(q));

    const merged = [...countryHits, ...cityHits];
    merged.sort((a, b) => {
      const aStart = norm(a.label).startsWith(q) ? 0 : 1;
      const bStart = norm(b.label).startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return a.label.length - b.label.length;
    });
    return merged.slice(0, 8);
  }, [query, countries, cities]);

  function select(s) {
    if (s.type === "country") onSelectLocation({ type: "country", countryId: s.countryId });
    else onSelectLocation({ type: "city", countryId: s.countryId, cityId: s.cityId });
    setOpen(false);
    setQuery("");
    setFocusIdx(-1);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      setFocusIdx(-1);
      return;
    }
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusIdx >= 0) {
      e.preventDefault();
      select(suggestions[focusIdx]);
    }
  }

  return (
    <div className="relative" id="search-bar">
      <div className="glass rounded-2xl shadow-glow px-4 py-3 transition-all duration-200 hover:shadow-glow-strong focus-within:shadow-glow-strong">
        <div className="flex items-center gap-3">
          {/* Search icon */}
          <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setFocusIdx(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-500 text-slate-100"
            placeholder="Search countries or cities…"
            id="search-input"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setOpen(false); setFocusIdx(-1); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl glass-strong shadow-glow overflow-hidden animate-scale-in z-50">
          {suggestions.map((s, idx) => (
            <button
              key={`${s.type}:${s.type === "country" ? s.countryId : s.cityId}`}
              onClick={() => select(s)}
              onMouseEnter={() => setFocusIdx(idx)}
              className={`w-full text-left px-4 py-3 transition-all duration-150 border-b border-white/5 last:border-b-0 flex items-center gap-3 ${
                idx === focusIdx ? "bg-accent/10" : "hover:bg-white/5"
              }`}
            >
              <span className="text-lg flex-shrink-0">{s.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-100 truncate">{s.label}</div>
                <div className="text-xs text-slate-500">
                  {s.type === "country" ? s.region : s.sublabel}
                  <span className="ml-2 text-accent/60">{s.type === "country" ? "Country" : "City"}</span>
                </div>
              </div>
              {s.type === "city" && (
                <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M9 21V6l-3 3M15 21V10l-3-3m0 0l-3 3m3-3v0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
