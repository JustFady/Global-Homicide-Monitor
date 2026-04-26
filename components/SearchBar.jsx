import React, { useMemo, useRef, useState } from "react";

function norm(s) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Highlight matching parts of text */
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const q = norm(query);
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-accent font-semibold">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function SearchBar({ countries, cities, onSelectLocation }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = norm(query);
    if (!q || q.length < 1) return { countries: [], cities: [], states: [] };

    const countryHits = countries
      .filter((c) => norm(c.name).includes(q) || norm(c.id).includes(q))
      .slice(0, 5)
      .map((c) => ({ type: "country", label: c.name, flag: c.flagEmoji, countryId: c.id, region: c.region, rate: c.homicideRatePer100k }));

    const cityHits = cities
      .filter((ct) => ct.countryId !== "USA" && (norm(ct.name).includes(q)))
      .slice(0, 5)
      .map((ct) => {
        const country = countries.find((c) => c.id === ct.countryId);
        return {
          type: "city",
          label: ct.name,
          sublabel: country?.name ?? ct.countryId,
          flag: country?.flagEmoji ?? "",
          countryId: ct.countryId,
          cityId: ct.id,
          rate: ct.homicideRatePer100k,
        };
      });

    // US cities
    const usCityHits = cities
      .filter((ct) => ct.countryId === "USA" && norm(ct.name).includes(q))
      .slice(0, 3)
      .map((ct) => ({
        type: "city",
        label: ct.name,
        sublabel: `USA · ${ct.stateId || ""}`,
        flag: "🇺🇸",
        countryId: "USA",
        cityId: ct.id,
        rate: ct.homicideRatePer100k,
      }));

    // Sort each by starts-with priority
    const sortFn = (a, b) => {
      const aStart = norm(a.label).startsWith(q) ? 0 : 1;
      const bStart = norm(b.label).startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return a.label.length - b.label.length;
    };

    countryHits.sort(sortFn);
    const allCities = [...cityHits, ...usCityHits].sort(sortFn).slice(0, 6);

    return { countries: countryHits, cities: allCities, states: [] };
  }, [query, countries, cities]);

  const allResults = useMemo(() => [...suggestions.countries, ...suggestions.cities], [suggestions]);
  const hasResults = allResults.length > 0;

  function select(s) {
    if (s.type === "country") onSelectLocation({ type: "country", countryId: s.countryId });
    else if (s.type === "state") onSelectLocation({ type: "state", stateId: s.stateId, countryId: "USA" });
    else onSelectLocation({ type: "city", countryId: s.countryId, cityId: s.cityId });
    setOpen(false);
    setQuery("");
    setFocusIdx(-1);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      setFocusIdx(-1);
      inputRef.current?.blur();
      return;
    }
    if (!open || !hasResults) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusIdx >= 0) {
      e.preventDefault();
      select(allResults[focusIdx]);
    }
  }

  function getRateColor(rate) {
    if (!rate) return "text-slate-500";
    if (rate > 10) return "text-rose-400";
    if (rate > 5) return "text-amber-400";
    return "text-emerald-400";
  }

  let globalIdx = -1;

  return (
    <div className="relative" id="search-bar">
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-2 transition-all duration-200 focus-within:border-accent/30 focus-within:bg-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
            className="flex-1 bg-transparent outline-none text-xs placeholder:text-slate-500 text-slate-100"
            placeholder="Search countries or cities…"
            id="search-input"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setOpen(false); setFocusIdx(-1); }}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {open && hasResults && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-[rgba(10,15,30,0.98)] border border-white/[0.08] shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto backdrop-blur-xl">
          {/* Countries section */}
          {suggestions.countries.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Countries</span>
                <span className="text-[9px] text-slate-600">{suggestions.countries.length}</span>
              </div>
              {suggestions.countries.map((s) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <button
                    key={`country:${s.countryId}`}
                    onClick={() => select(s)}
                    onMouseEnter={() => setFocusIdx(idx)}
                    className={`w-full text-left px-3 py-2 transition-all duration-100 flex items-center gap-2.5 ${
                      idx === focusIdx ? "bg-accent/10" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{s.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-100 truncate">
                        <Highlight text={s.label} query={query} />
                      </div>
                      <div className="text-[10px] text-slate-500">{s.region}</div>
                    </div>
                    <span className={`text-[10px] font-semibold tabular-nums ${getRateColor(s.rate)}`}>
                      {s.rate?.toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {/* Cities section */}
          {suggestions.cities.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 border-t border-white/[0.04]">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cities</span>
                <span className="text-[9px] text-slate-600">{suggestions.cities.length}</span>
              </div>
              {suggestions.cities.map((s) => {
                globalIdx++;
                const idx = globalIdx;
                return (
                  <button
                    key={`city:${s.cityId}`}
                    onClick={() => select(s)}
                    onMouseEnter={() => setFocusIdx(idx)}
                    className={`w-full text-left px-3 py-2 transition-all duration-100 flex items-center gap-2.5 ${
                      idx === focusIdx ? "bg-accent/10" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{s.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-100 truncate">
                        <Highlight text={s.label} query={query} />
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{s.sublabel}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-semibold tabular-nums ${getRateColor(s.rate)}`}>
                        {s.rate?.toFixed(1)}
                      </span>
                      <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-white/[0.04] flex items-center justify-between">
            <span className="text-[9px] text-slate-600">
              {allResults.length} result{allResults.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[9px] text-slate-600">
              ↑↓ navigate · ↵ select · esc close
            </span>
          </div>
        </div>
      )}

      {/* Click-outside handler */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
