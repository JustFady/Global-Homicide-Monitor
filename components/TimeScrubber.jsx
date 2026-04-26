import React from "react";

export default function TimeScrubber({ activeYear, onSetYear }) {
  const minYear = 2000;
  const maxYear = 2026;
  
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Timeline</span>
        <span className="text-sm font-bold text-accent tabular-nums">{activeYear}</span>
      </div>
      <input 
        type="range"
        min={minYear}
        max={maxYear}
        value={activeYear}
        onChange={(e) => onSetYear(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent"
      />
      <div className="flex justify-between text-[9px] font-medium text-slate-600 font-mono mt-1">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}
