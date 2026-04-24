import React from "react";

export default function TimeScrubber({ activeYear, onSetYear }) {
  const minYear = 2010;
  const maxYear = 2024;
  
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="pointer-events-auto glass-strong rounded-2xl px-6 py-4 flex flex-col items-center gap-4 border-accent/20 w-[400px]">
        <div className="w-full flex justify-between items-end mb-1">
          <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Historical Playback</span>
          <span className="text-2xl font-black text-accent bg-accent/10 px-3 py-0.5 rounded-lg border border-accent/20 shadow-glow">{activeYear}</span>
        </div>
        
        <div className="w-full flex items-center gap-4">
          <input 
            type="range"
            min={minYear}
            max={maxYear}
            value={activeYear}
            onChange={(e) => onSetYear(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
        <div className="w-full flex justify-between text-[10px] font-medium text-slate-500 font-mono">
          <span>{minYear}</span>
          <span>{maxYear}</span>
        </div>
      </div>
    </div>
  );
}
