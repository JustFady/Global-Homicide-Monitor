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
    <div className="relative h-full overflow-hidden flex">
      {loading && (
        <div className="absolute inset-0 z-[100]">
          <LoadingScreen visible={true} />
        </div>
      )}

      {/* ── LEFT: Globe area ───────────────────────────── */}
      <div className="flex-1 relative min-w-0">
        {/* Globe */}
        <div className="absolute inset-0">
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

        {/* Top bar over globe */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="glass-strong border-b border-white/[0.06]">
            <div className="px-4 py-2.5 flex items-center gap-3">
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
                    onClick={() => setDataLens(lens.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      dataLens === lens.id ? lens.activeCls : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {lens.label}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="flex-1 max-w-lg mx-2">
                <SearchBar countries={countries} cities={cities} onSelectLocation={handleSelectLocation} />
              </div>
              {/* Sidebar toggle (when closed) */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" /></svg>
                  Panel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Unified Sidebar ──────────────────────── */}
      {sidebarOpen && (
        <div className="w-[390px] shrink-0 h-full flex flex-col bg-[rgba(6,10,20,0.95)] border-l border-white/[0.06] animate-slide-in-right">
          {/* Tab Bar */}
          <div className="flex shrink-0 border-b border-white/[0.06]">
            <TabButton active={activeTab === "info"} icon={infoIcon} label="Info" onClick={() => setActiveTab("info")} />
            <TabButton active={activeTab === "charts"} icon={chartIcon} label="Charts" onClick={() => setActiveTab("charts")} />
            <TabButton active={activeTab === "scenarios"} icon={scenarioIcon} label="Lenses" onClick={() => setActiveTab("scenarios")} badge={scenarioCountryIds?.length || 0} />
            {/* Close sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="px-3 flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors border-l border-white/[0.04]"
              title="Close panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Tab Content (scrollable) */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeTab === "info" && (
              <>
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

          {/* Footer: Timeline + Pinned */}
          <div className="shrink-0 border-t border-white/[0.06] p-3 space-y-3">
            <TimeScrubber activeYear={activeYear} onSetYear={setActiveYear} />
            {/* Pinned items */}
            {pinned.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pinned ({pinned.length})</span>
                  <button
                    onClick={() => setCompareOpen(true)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-accent/15 border border-accent/25 text-accent hover:bg-accent/25 transition"
                  >
                    Compare
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pinned.map((p, i) => (
                    <div key={`${p.type}:${p.id}`} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-slate-300">
                      <span className="truncate max-w-[100px]">{p.label}</span>
                      <button onClick={() => setPinned((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-600 hover:text-white transition">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Compare Modal (only thing that stays as a modal) ─── */}
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
