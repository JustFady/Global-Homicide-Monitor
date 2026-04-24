import React from "react";

export default function LoadingScreen({ visible }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.08) 0%, #060a14 70%)",
      }}
    >
      {/* Animated globe icon */}
      <div className="relative mb-8 animate-float">
        <div className="w-20 h-20 rounded-full border-2 border-accent/30 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-accent/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-accent animate-spin-slow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full animate-pulse-glow" />
      </div>

      <h1 className="text-xl font-semibold text-white/90 mb-2 tracking-tight">
        Global Gun Violence & Law
      </h1>
      <p className="text-sm text-slate-400 mb-6">Interactive Dashboard</p>

      {/* Loading bar */}
      <div className="w-48 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full animate-shimmer"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-3">Loading globe data…</p>
    </div>
  );
}
