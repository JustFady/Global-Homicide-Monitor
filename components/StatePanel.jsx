import React, { useState } from "react";
import LawCard from "./LawCard.jsx";

export default function StatePanel({ stateData, citiesForState, onPin, onViewCity, onClosePanel }) {
  const [showCities, setShowCities] = useState(false);

  if (!stateData) return null;

  const homRate = stateData.homicideRatePer100k;
  const faRate = stateData.firearmHomicideRate;

  const getSeverityColor = (rate) => {
    if (rate < 2.5) return "text-safe";
    if (rate < 5) return "text-warn";
    return "text-danger";
  };

  return (
    <div className="glass-strong h-full rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-in-right relative">
      {/* Header */}
      <div className="p-5 border-b border-white/5 relative shrink-0">
        <button onClick={onClosePanel} className="absolute top-4 left-4 p-1 rounded-full hover:bg-white/10 text-slate-400 transition-colors">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="flex justify-between items-start pl-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              🇺🇸 {stateData.name}
            </h2>
            <p className="text-xs text-accent mt-1 flex items-center gap-2 font-medium">
              UNITED STATES OF AMERICA
            </p>
          </div>
          <button onClick={onPin} className="p-2 glass rounded-xl hover:bg-white/10 transition-colors group cursor-pointer" title="Pin to Compare">
            <svg className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Constraints wrapper */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!showCities ? (
          <div className="p-5 space-y-6 animate-fade-in">
            <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-accent/40 pl-3 italic">"{stateData.context}"</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Homicides</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold tracking-tight ${getSeverityColor(homRate)}`}>{homRate}</span>
                  <span className="text-[10px] text-slate-500 font-medium">/ 100k</span>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Firearm Related</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white tracking-tight">{faRate}</span>
                  <span className="text-[10px] text-slate-500 font-medium">/ 100k</span>
                </div>
              </div>
            </div>

            <LawCard severity={stateData.lawStrictness} details={`${stateData.name} falls under the jurisdiction of federal laws but enforces its own state-level firearm statutes.`}/>

            {citiesForState.length > 0 && (
              <button
                onClick={() => setShowCities(true)}
                className="w-full relative group overflow-hidden rounded-xl border border-accent/20 bg-accent/5 p-3 flex items-center justify-between transition-all hover:bg-accent/10 hover:border-accent/40"
              >
                <span className="text-sm font-semibold text-accent group-hover:text-white transition-colors z-10">View Cities Data ({citiesForState.length})</span>
                <svg className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="p-5 animate-slide-in-right">
            <button onClick={() => setShowCities(false)} className="mb-4 text-xs font-semibold text-accent flex items-center gap-1 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
              Back to State Overview
            </button>
            <div className="space-y-2">
              {citiesForState.map((ct) => {
                const ctH = ct.homicideRatePer100k;
                return (
                  <button key={ct.id} onClick={() => onViewCity(ct.id)} className="w-full text-left p-3 rounded-xl bg-slate-900/40 border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all flex items-center justify-between group">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{ct.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ct.homicideRatePer100k} avg / 100k</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
