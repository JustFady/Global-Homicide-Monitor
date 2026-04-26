import React, { useEffect, useState } from "react";

const STEPS = [
  { label: "Loading countries", icon: "🌍" },
  { label: "Mapping cities", icon: "🏙️" },
  { label: "Preparing globe", icon: "🌐" },
  { label: "Rendering data", icon: "📊" },
];

export default function LoadingScreen({ visible }) {
  const [step, setStep] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFadeOut(true);
      return;
    }
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 600);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible && fadeOut) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none animate-fade-out"
        style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.08) 0%, #060a14 70%)" }}
      />
    );
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.1) 0%, #060a14 70%)",
      }}
    >
      {/* Animated globe icon */}
      <div className="relative mb-10">
        {/* Outer ring */}
        <div className="w-28 h-28 rounded-full border border-accent/10 flex items-center justify-center animate-pulse">
          {/* Middle ring */}
          <div className="w-22 h-22 rounded-full border border-accent/20 flex items-center justify-center" style={{width: '88px', height: '88px'}}>
            {/* Inner ring with globe */}
            <div className="w-16 h-16 rounded-full bg-accent/5 border border-accent/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.15)]">
              <svg
                className="w-9 h-9 text-accent animate-spin-slow"
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
        </div>
        {/* Orbiting dot */}
        <div className="absolute inset-0 animate-spin-slow" style={{animationDuration: '3s'}}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white/90 mb-1 tracking-tight">
        Global Homicide Monitor
      </h1>
      <p className="text-xs text-accent/70 font-medium uppercase tracking-[0.2em] mb-10">
        Interactive Dashboard
      </p>

      {/* Progress steps */}
      <div className="w-64 space-y-2.5 mb-8">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                done ? "opacity-50" : active ? "opacity-100" : "opacity-20"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${
                done ? "bg-emerald-500/20 border border-emerald-500/30" : 
                active ? "bg-accent/20 border border-accent/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]" : 
                "bg-white/5 border border-white/10"
              }`}>
                {done ? (
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span>{s.icon}</span>
                )}
              </div>
              <span className={`text-xs font-medium ${
                active ? "text-white" : done ? "text-slate-500" : "text-slate-600"
              }`}>
                {s.label}{active ? "…" : ""}
              </span>
              {active && (
                <div className="ml-auto flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{animationDelay: '150ms'}} />
                  <div className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading bar */}
      <div className="w-48 h-0.5 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((step + 1) / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          }}
        />
      </div>

      {/* Stats teaser */}
      <div className="mt-8 flex items-center gap-4 text-[10px] text-slate-600 font-medium uppercase tracking-wider">
        <span>176 Countries</span>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span>966 Cities</span>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span>2000–2026</span>
      </div>
    </div>
  );
}
