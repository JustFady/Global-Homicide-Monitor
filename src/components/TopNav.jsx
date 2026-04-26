import React from "react";

export default function TopNav({ 
  children, 
  chartsOpen, onToggleCharts, 
  scenarioOpen, onToggleScenarios,
  dataLens, onSetDataLens,
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="glass-strong border-b border-white/[0.06] pointer-events-auto">
        <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          
          {/* Branding */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">Global Gun Violence</h1>
              <p className="text-[9px] text-accent/80 font-medium uppercase tracking-widest mt-0.5">Interactive Dashboard</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-7 bg-white/[0.08]" />

          {/* Data Lenses */}
          <div className="hidden md:flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.05]">
            {[
              { id: 'none', label: 'Standard', activeCls: 'bg-white/10 text-white' },
              { id: 'homicide', label: 'Homicides', activeCls: 'bg-red-500/20 text-red-400' },
              { id: 'crime', label: 'Crime', activeCls: 'bg-amber-500/20 text-amber-400' },
              { id: 'law', label: 'Laws', activeCls: 'bg-green-500/20 text-green-400' },
            ].map(lens => (
              <button
                key={lens.id}
                onClick={() => onSetDataLens(lens.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  dataLens === lens.id ? lens.activeCls : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lens.label}
              </button>
            ))}
          </div>

          {/* Search (grows to fill) */}
          <div className="flex-1 max-w-lg mx-2">
            {children}
          </div>

          {/* Right tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleCharts}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                chartsOpen
                  ? "bg-accent/15 text-accent border-accent/30"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:border-white/10"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Charts</span>
            </button>
            <button
              onClick={onToggleScenarios}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                scenarioOpen
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white hover:border-white/10"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Scenarios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
