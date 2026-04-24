import React from "react";

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`toggle-track ${checked ? "active" : ""}`}
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      >
        <div className="toggle-thumb" />
      </div>
      <span className="text-sm leading-snug text-slate-300 group-hover:text-slate-100 transition-colors select-none">
        {label}
      </span>
    </label>
  );
}

export default function ScenarioExplorer({
  open,
  onOpen,
  onClose,
  filters,
  onChange,
  countries,
  scenarioCountryIds,
  onPin,
  onSelectCountry,
}) {
  const activeCount = Object.values(filters).filter(Boolean).length;
  const matches = scenarioCountryIds
    ? countries.filter((c) => scenarioCountryIds.includes(c.id)).slice(0, 12)
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass-strong rounded-2xl shadow-glow-strong overflow-hidden animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Scenario Explorer</h2>
            <p className="text-xs text-slate-500">
              {activeCount === 0 ? "Toggle filters to find matching countries" : `${activeCount} active filter${activeCount > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto flex-1">
          {/* Filters */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Filters (AND logic)</div>

            <Toggle
              label="Gang-related violence > 60% of gun deaths"
              checked={filters.gangRelatedOver60}
              onChange={(v) => onChange({ ...filters, gangRelatedOver60: v })}
            />
            <Toggle
              label="Victims predominantly under 25"
              checked={filters.under25Predominant}
              onChange={(v) => onChange({ ...filters, under25Predominant: v })}
            />
            <Toggle
              label="Death likelihood if owner > 5%"
              checked={filters.deathIfOwnerOver5}
              onChange={(v) => onChange({ ...filters, deathIfOwnerOver5: v })}
            />
            <Toggle
              label="Permissive gun laws only"
              checked={filters.permissiveOnly}
              onChange={(v) => onChange({ ...filters, permissiveOnly: v })}
            />
            <Toggle
              label="Organized crime index > 6"
              checked={filters.organizedCrimeOver6}
              onChange={(v) => onChange({ ...filters, organizedCrimeOver6: v })}
            />

            <p className="text-[11px] text-slate-600 pt-1">
              Active filters highlight matching countries on the globe.
            </p>
          </div>

          {/* Results */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Results</div>
              {scenarioCountryIds && (
                <span className="text-xs text-accent font-medium">{scenarioCountryIds.length} match{scenarioCountryIds.length !== 1 ? "es" : ""}</span>
              )}
            </div>

            {!scenarioCountryIds ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-500 text-center">Toggle filters to see results</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-slate-500 text-center">No countries matched all filters</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto flex-1 max-h-[320px] pr-1">
                {matches.map((c) => (
                  <div key={c.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-accent/5 hover:border-accent/15 transition-all duration-200 group">
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => { onSelectCountry(c.id); onClose(); }} className="text-left flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                          {c.flagEmoji} {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Homicide {c.homicideRatePer100k.toFixed(1)}/100k · Crime {c.organizedCrimeIndex.toFixed(1)} · {c.lawStrictness}
                        </div>
                      </button>
                      <button
                        onClick={() => onPin(c.id)}
                        className="text-[11px] px-2 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition flex-shrink-0"
                      >
                        Pin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
