import React, { useCallback, useEffect, useMemo, useState } from "react";
import Globe from "./components/Globe.jsx";
import SearchBar from "./components/SearchBar.jsx";
import CountryPanel from "./components/CountryPanel.jsx";
import CityPanel from "./components/CityPanel.jsx";
import CompareTable from "./components/CompareTable.jsx";
import ScenarioExplorer from "./components/ScenarioExplorer.jsx";
import ChartPanel from "./components/ChartPanel.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import StatePanel from "./components/StatePanel.jsx";
import TimeScrubber from "./components/TimeScrubber.jsx";
import Breadcrumb from "./components/Breadcrumb.jsx";

import countries from "./data/countries.json";
import cities from "./data/cities.json";
import usStatesData from "./data/us_states.json";

/* ── helpers ──────────────────────────────────────────── */
function clampPins(items, max = 4) {
  return items.length <= max ? items : items.slice(0, max);
}

/* ── Toast component ──────────────────────────────────── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] toast-enter">
      <div className="glass-strong rounded-xl shadow-glow px-4 py-2.5 text-sm text-slate-200 flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {message}
      </div>
    </div>
  );
}

/* ── Tab Button ───────────────────────────────────────── */
function TabButton({ active, icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
        active
          ? "text-accent border-accent bg-accent/5"
          : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.02]"
      }`}
    >
      {icon}
      {label}
      {badge > 0 && (
        <span className="ml-1 px-1.5 py-0 rounded-full bg-accent/20 text-accent text-[9px] font-bold">{badge}</span>
      )}
    </button>
  );
}

/* ── Main App ─────────────────────────────────────────── */
export default function App() {
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedCountryId, setSelectedCountryId] = useState("USA");
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState(null);

  // Interactions
  const [dataLens, setDataLens] = useState("none");
  const [activeYear, setActiveYear] = useState(2026);
  const [activeTab, setActiveTab] = useState("info"); // "info" | "charts" | "scenarios"

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinned, setPinned] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [toast, setToast] = useState(null);

  const scenarioCountryIds = useMemo(() => {
    if (!activeScenario) return null;
    return countries.filter(c => {
      if (activeScenario === 'gang-crisis') return (c.gangRelatedGunDeathsPercent >= 50 || c.organizedCrimeIndex >= 6.5);
      if (activeScenario === 'permissive-risk') return (c.lawStrictness || "").toLowerCase() === 'permissive' && c.homicideRatePer100k > 5;
      if (activeScenario === 'safe-havens') return (c.lawStrictness || "").toLowerCase() === 'strict' && c.homicideRatePer100k < 2;
      if (activeScenario === 'youth-risk') return c.underAge25Percent >= 50;
      return false;
    }).map(c => c.id);
  }, [activeScenario]);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId) ?? countries[0],
    [selectedCountryId]
  );
  const selectedState = useMemo(() => {
    if (!selectedStateId) return null;
    return usStatesData.find((s) => s.id === selectedStateId) ?? null;
  }, [selectedStateId]);
  const selectedCity = useMemo(() => {
    if (!selectedCityId) return null;
    return cities.find((ct) => ct.id === selectedCityId) ?? null;
  }, [selectedCityId]);

  const citiesForContext = useMemo(() => {
    if (selectedStateId) return cities.filter((ct) => ct.stateId === selectedStateId);
    if (!selectedCountryId) return [];
    if (selectedCountryId === "USA") return [];
    return cities.filter((ct) => ct.countryId === selectedCountryId);
  }, [selectedCountryId, selectedStateId]);

  const statesForCountry = useMemo(() => {
    if (selectedCountryId !== "USA") return [];
    return usStatesData;
  }, [selectedCountryId]);

  const globalAvgKeyMetrics = useMemo(() => {
    const avg = (key) => countries.reduce((sum, c) => sum + (c[key] ?? 0), 0) / Math.max(1, countries.length);
    return {
      homicideRatePer100k: avg("homicideRatePer100k"),
      firearmHomicideRate: avg("firearmHomicideRate"),
      organizedCrimeIndex: avg("organizedCrimeIndex"),
      underAge25Percent: avg("underAge25Percent"),
      likelihoodDeathIfOwner: avg("likelihoodDeathIfOwner"),
      likelihoodIncarcerationIfOwner: avg("likelihoodIncarcerationIfOwner"),
    };
  }, []);

  /* ── handlers ──────────────────────────────────────── */
  const handleSelectLocation = useCallback((loc) => {
    if (!loc) return;
    setSidebarOpen(true);
    setActiveTab("info");
    if (loc.type === "country") {
      setSelectedCityId(null);
      setSelectedStateId(null);
      setSelectedCountryId(loc.countryId);
    } else if (loc.type === "state") {
      setSelectedCityId(null);
      setSelectedCountryId("USA");
      setSelectedStateId(loc.stateId);
    } else {
      setSelectedCityId(loc.cityId);
      setSelectedCountryId(loc.countryId);
    }
  }, []);

  const handleSelectState = useCallback((stateId) => {
    setSelectedCountryId("USA");
    setSelectedStateId(stateId);
    setSelectedCityId(null);
    setSidebarOpen(true);
    setActiveTab("info");
  }, []);

  const handleViewCity = useCallback((cityId) => {
    const ct = cities.find((x) => x.id === cityId);
    if (!ct) return;
    setSelectedCountryId(ct.countryId);
    if (ct.stateId) setSelectedStateId(ct.stateId);
    setSelectedCityId(cityId);
  }, []);

  const pinToCompare = useCallback((pin) => {
    setPinned((prev) => {
      if (prev.some((p) => p.type === pin.type && p.id === pin.id)) {
        return prev.filter((p) => !(p.type === pin.type && p.id === pin.id));
      }
      return clampPins([...prev, pin], 4);
    });
  }, []);

  const handleGlobeReady = useCallback(() => setLoading(false), []);
  const handleCountryNotFound = useCallback((name) => setToast(`No detailed data for ${name}`), []);

  /* ── icons ─────────────────────────────────────────── */
  const infoIcon = <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const chartIcon = <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  const scenarioIcon = <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#030712] font-sans text-slate-200">
      {loading && (
        <div className="absolute inset-0 z-[100]">
          <LoadingScreen visible={true} />
        </div>
      )}

      {/* ── BACKGROUND: Globe ─────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Globe
          countries={countries}
          cities={cities}
          usStates={usStatesData}
          selectedCountryId={selectedCountryId}
          selectedStateId={selectedStateId}
          selectedCityId={selectedCityId}
          scenarioCountryIds={scenarioCountryIds}
          citiesVisible={!!selectedCountryId}
          dataLens={dataLens}
          activeYear={activeYear}
          onSelectCountry={(countryId) => handleSelectLocation({ type: "country", countryId })}
          onSelectState={handleSelectState}
          onSelectCity={(cityId) => {
            const ct = cities.find((x) => x.id === cityId);
            if (!ct) return;
            handleViewCity(cityId);
          }}
          onGlobeReady={handleGlobeReady}
          onCountryNotFound={handleCountryNotFound}
        />
      </div>

      {/* ── FOREGROUND: Floating Widgets ──────────────── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Top Left: Data Lenses */}
        <div className="absolute top-4 left-4 pointer-events-auto hidden md:block z-20">
          <div className="glass-strong rounded-full border border-white/[0.08] p-1 flex items-center shadow-glow backdrop-blur-xl">
            {[
              { id: 'none', label: 'Standard', activeCls: 'bg-white/10 text-white shadow-sm border border-white/[0.05]' },
              { id: 'homicide', label: 'Homicides', activeCls: 'bg-red-500/20 text-red-300 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
              { id: 'crime', label: 'Crime', activeCls: 'bg-amber-500/20 text-amber-300 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
              { id: 'law', label: 'Laws', activeCls: 'bg-green-500/20 text-green-300 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]' },
            ].map(lens => (
              <button
                key={lens.id}
                onClick={() => setDataLens(lens.id)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-300 border border-transparent ${
                  dataLens === lens.id ? lens.activeCls : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {lens.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Center: Search Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto w-full max-w-[500px] px-4 z-30">
          <div className="shadow-glow rounded-xl">
            <SearchBar countries={countries} cities={cities} onSelectLocation={handleSelectLocation} />
          </div>
        </div>

        {/* Top Right: Toggle Panel Button (if closed) */}
        {!sidebarOpen && (
          <div className="absolute top-4 right-4 pointer-events-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="glass-strong rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-accent border border-white/[0.08] hover:bg-white/[0.05] hover:border-accent/30 transition-all shadow-glow flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" /></svg>
              Open Panel
            </button>
          </div>
        )}

        {/* Right: Floating Sidebar */}
        {sidebarOpen && (
          <div className="absolute top-4 right-4 bottom-[90px] w-[380px] pointer-events-auto flex flex-col glass-strong rounded-2xl border border-white/[0.08] shadow-glow-strong overflow-hidden animate-slide-in-right backdrop-blur-2xl">
            {/* Tab Bar */}
            <div className="flex shrink-0 border-b border-white/[0.08] bg-slate-900/40">
              <TabButton active={activeTab === "info"} icon={infoIcon} label="Info" onClick={() => setActiveTab("info")} />
              <TabButton active={activeTab === "charts"} icon={chartIcon} label="Charts" onClick={() => setActiveTab("charts")} />
              <TabButton active={activeTab === "scenarios"} icon={scenarioIcon} label="Scenarios" onClick={() => setActiveTab("scenarios")} badge={scenarioCountryIds?.length || 0} />
              {/* Close sidebar */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="px-3 flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500/20 transition-colors border-l border-white/[0.08]"
                title="Close panel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
              </button>
            </div>

            {/* Tab Content (scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
              {activeTab === "info" && (
                <>
                  <Breadcrumb
                    country={selectedCountry}
                    state={selectedState}
                    city={selectedCity}
                    onSelectCountry={(id) => { setSelectedStateId(null); setSelectedCityId(null); setSelectedCountryId(id); }}
                    onSelectState={(id) => { setSelectedCityId(null); setSelectedStateId(id); }}
                  />
                  {selectedCity ? (
                    <CityPanel
                      city={selectedCity}
                      country={selectedCountry}
                      state={selectedState}
                      activeYear={activeYear}
                      onDismiss={() => setSelectedCityId(null)}
                      onPin={() => pinToCompare({ type: "city", id: selectedCity.id, label: `${selectedCity.name} (${selectedCountry.name})` })}
                      onClosePanel={() => setSidebarOpen(false)}
                    />
                  ) : selectedStateId ? (
                    <StatePanel
                      stateData={selectedState}
                      citiesForState={citiesForContext}
                      activeYear={activeYear}
                      onBack={() => { setSelectedStateId(null); setSelectedCityId(null); }}
                      onPin={() => pinToCompare({ type: "state", id: selectedState.id, label: selectedState.name })}
                      onViewCity={handleViewCity}
                      onClosePanel={() => setSidebarOpen(false)}
                    />
                  ) : (
                    <CountryPanel
                      country={selectedCountry}
                      citiesForCountry={citiesForContext}
                      statesForCountry={statesForCountry}
                      globalAvgKeyMetrics={globalAvgKeyMetrics}
                      activeYear={activeYear}
                      onPin={() => pinToCompare({ type: "country", id: selectedCountry.id, label: selectedCountry.name })}
                      onViewCity={handleViewCity}
                      onSelectState={handleSelectState}
                      onClosePanel={() => setSidebarOpen(false)}
                    />
                  )}
                </>
              )}

              {activeTab === "charts" && (
                <ChartPanel
                  countries={countries}
                  cities={cities}
                  onPin={(countryId) => {
                    const c = countries.find((x) => x.id === countryId);
                    if (!c) return;
                    pinToCompare({ type: "country", id: c.id, label: c.name });
                  }}
                  inline
                />
              )}

              {activeTab === "scenarios" && (
                <ScenarioExplorer
                  activeScenario={activeScenario}
                  onChange={setActiveScenario}
                  countries={countries}
                  scenarioCountryIds={scenarioCountryIds}
                  onPin={(countryId) => {
                    const c = countries.find((x) => x.id === countryId);
                    if (!c) return;
                    pinToCompare({ type: "country", id: c.id, label: c.name });
                  }}
                  onSelectCountry={(countryId) => handleSelectLocation({ type: "country", countryId })}
                  inline
                />
              )}
            </div>
          </div>
        )}

        {/* Bottom Left: Time Scrubber */}
        <div className="absolute bottom-6 left-4 pointer-events-auto w-[340px] z-20">
          <div className="glass-strong rounded-2xl border border-white/[0.08] p-2.5 shadow-glow-strong backdrop-blur-2xl">
            <TimeScrubber activeYear={activeYear} onSetYear={setActiveYear} />
          </div>
        </div>

        {/* Bottom Left (Above Timeline): Pinned Items & Compare */}
        {pinned.length > 0 && (
          <div className="absolute bottom-[100px] left-4 pointer-events-auto w-[340px] z-20">
            <div className="glass-strong rounded-2xl border border-white/[0.08] p-3 shadow-glow backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  Pinned ({pinned.length})
                </span>
                <button
                  onClick={() => setCompareOpen(true)}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                >
                  Compare All
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {pinned.map((p, i) => (
                  <div key={`${p.type}:${p.id}`} className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 transition-colors group">
                    <span className="truncate pr-2 font-medium">{p.label}</span>
                    <button onClick={() => setPinned((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-rose-400 transition-colors shrink-0 opacity-50 group-hover:opacity-100">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Right: Links & Attribution */}
        <div className="absolute bottom-6 right-4 pointer-events-auto z-20">
          <div className="glass-strong rounded-xl border border-white/[0.08] px-3 py-2 shadow-glow backdrop-blur-2xl flex items-center gap-3.5 text-[10px] font-medium text-slate-500">
            <a href="https://github.com/JustFady/Global-Homicide-Monitor" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors group">
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <div className="w-px h-3 bg-white/[0.15]" />
            <a href="https://www.unodc.org/unodc/en/data-and-analysis/global-study-on-homicide.html" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">
              Data: UNODC
            </a>
            <div className="w-px h-3 bg-white/[0.15]" />
            <a href="https://www.smallarmssurvey.org/" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">
              Small Arms Survey
            </a>
          </div>
        </div>

      </div>

      {/* ── Compare Modal ────────────────────────────────── */}
      {compareOpen && (
        <CompareTable
          pinned={pinned}
          countries={countries}
          cities={cities}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {/* ── Toast ──────────────────────────────────────── */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
