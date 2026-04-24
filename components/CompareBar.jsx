import React from "react";

export default function CompareBar({ pinned, onRemove, onCompare }) {
  // Don't render if nothing is pinned
  if (pinned.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4 animate-slide-up">
      <div className="glass-strong rounded-2xl shadow-glow-strong px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {pinned.map((p, idx) => (
              <div
                key={`${p.type}:${p.id}`}
                className="flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/20 px-2.5 py-1.5 flex-shrink-0"
              >
                <span className="text-xs font-medium text-accent-light truncate max-w-[120px]">{p.label}</span>
                <button
                  onClick={() => onRemove(idx)}
                  className="w-4 h-4 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition flex-shrink-0"
                >
                  <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onCompare}
            disabled={pinned.length < 2}
            className="rounded-xl bg-accent/20 border border-accent/30 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            Compare ({pinned.length})
          </button>
        </div>
      </div>
    </div>
  );
}
