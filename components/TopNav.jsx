import React from "react";

export default function TopNav({ 
  children, 
  chartsOpen, onToggleCharts, 
  scenarioOpen, onToggleScenarios,
  dataLens, onSetDataLens,
  isTouring, onToggleTour
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 pointer-events-none">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Left: Branding & Lenses */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl glass-strong flex items-center justify-center shadow-glow border transition-colors ${isTouring ? 'border-purple-500' : 'border-accent/20'}`}>
              <svg className={`w-5 h-5 ${isTouring ? 'text-purple-400' : 'text-accent'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hidden xl:block">
              <h1 className="text-sm font-bold text-white tracking-tight">Global Gun Violence</h1>
              <p className="text-[10px] text-accent font-medium uppercase tracking-widest mt-0.5">Interactive Dashboard</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center bg-slate-900/60 p-1 rounded-xl glass border border-white/5">
             <button onClick={() => onSetDataLens('none')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dataLens === 'none' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>Standard</button>
             <button onClick={() => onSetDataLens('homicide')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dataLens === 'homicide' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'}`}>Homicides</button>
             <button onClick={() => onSetDataLens('crime')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dataLens === 'crime' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'}`}>Crime Index</button>
             <button onClick={() => onSetDataLens('law')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dataLens === 'law' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'}`}>Laws</button>
          </div>
        </div>

        {/* Center: SearchBar (injected as children) */}
        <div className="flex-1 max-w-xl mx-4">
          {children}
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTour}
            className={`glass rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-glow ${
              isTouring ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "text-slate-300 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden md:inline">{isTouring ? "Stop Tour" : "Auto Tour"}</span>
          </button>
          <button
            onClick={onToggleCharts}
            className={`glass rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-glow ${
              chartsOpen ? "bg-accent/15 text-accent border-accent/30" : "text-slate-300 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden md:inline">Charts</span>
          </button>
          <button
            onClick={onToggleScenarios}
            className={`glass rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-glow ${
              scenarioOpen ? "bg-amber-500/15 text-amber-500 border-amber-500/30" : "text-slate-300 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden md:inline">Scenarios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
