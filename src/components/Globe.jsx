import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ── helpers ──────────────────────────────────────────── */
function norm(s) {
  return (s ?? "")
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFeatureName(f) {
  return (
    f?.properties?.name ??
    f?.properties?.NAME ??
    f?.properties?.admin ??
    f?.properties?.ADMIN ??
    f?.properties?.sovereignt ??
    f?.properties?.SOVEREIGNT ??
    null
  );
}

function getFeatureISO3(f) {
  return f?.properties?.iso_a3 ?? f?.properties?.ISO_A3 ?? null;
}

const nameAliases = {
  "united states of america": "united states",
  "russian federation": "russia",
  "china, people republic of": "china",
  "dominican rep": "dominican republic",
  "dominican rep.": "dominican republic",
  "czechia": "czech republic",
  "eswatini": "swaziland",
  "côte divoire": "ivory coast",
};

/* ── tooltip HTML builder ─────────────────────────────── */
function buildTooltipHTML(data, isState = false) {
  if (!data) return "";

  const strictColor =
    data.lawStrictness === "Strict"
      ? "#10b981"
      : data.lawStrictness === "Moderate"
      ? "#f59e0b"
      : "#f43f5e";

  const flag = isState ? "🇺🇸" : (data.flagEmoji || "🌍");
  const subtitle = isState ? "United States" : (data.region || "");

  return `
    <div style="
      font-family: Inter, system-ui, sans-serif;
      background: rgba(6, 10, 20, 0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 12px 16px;
      min-width: 200px;
      max-width: 280px;
      pointer-events: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.15);
    ">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <span style="font-size:20px;">${flag}</span>
        <div>
          <div style="font-size:14px; font-weight:600; color:#f1f5f9;">${data.name}</div>
          <div style="font-size:11px; color:#94a3b8;">${subtitle}</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
        <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:6px 8px;">
          <div style="font-size:10px; color:#64748b;">Homicide</div>
          <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${data.homicideRatePer100k}/100k</div>
        </div>
        <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:6px 8px;">
          <div style="font-size:10px; color:#64748b;">Firearm</div>
          <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${data.firearmHomicideRate}/100k</div>
        </div>
        <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:6px 8px;">
          <div style="font-size:10px; color:#64748b;">Crime Index</div>
          <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${data.organizedCrimeIndex}</div>
        </div>
        <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:6px 8px;">
          <div style="font-size:10px; color:#64748b;">Gun Law</div>
          <div style="font-size:13px; font-weight:600; color:${strictColor};">${data.lawStrictness}</div>
        </div>
      </div>
      <div style="font-size:10px; color:#475569; margin-top:8px; text-align:center;">Click to view details</div>
    </div>
  `;
}

function buildUnknownTooltipHTML(name) {
  return `
    <div style="
      font-family: Inter, system-ui, sans-serif;
      background: rgba(6, 10, 20, 0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 10px 14px;
      pointer-events: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    ">
      <div style="font-size:13px; font-weight:500; color:#94a3b8;">${name || "Unknown"}</div>
      <div style="font-size:10px; color:#475569; margin-top:2px;">No data available</div>
    </div>
  `;
}

/* ── component ────────────────────────────────────────── */
export default function Globe({
  countries,
  cities,
  usStates,
  selectedCountryId,
  selectedStateId,
  selectedCityId,
  scenarioCountryIds,
  citiesVisible,
  dataLens,
  onSelectCountry,
  onSelectState,
  onSelectCity,
  onGlobeReady,
  onCountryNotFound,
}) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const stateRef = useRef({ selectedCountryId, selectedStateId, hoveredCountryId: null, scenarioCountryIds, dataLens });
  const [worldFeatures, setWorldFeatures] = useState([]);
  const [usFeatures, setUsFeatures] = useState([]);

  // Interpolation helper for heatmaps
  const interpolateColor = (val, min, max, type) => {
    const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
    // For homicide/crime: green -> yellow -> red
    // For laws: 0=permissive(red), 1=moderate(yellow), 2=strict(green)
    let r, g, b;
    if (type === 'strictness') {
      const isRed = val === 0;
      const isYellow = val === 1;
      return isRed ? 'rgba(244,63,94,0.7)' : isYellow ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)';
    } else {
      if (t < 0.5) {
        // Green to Yellow
        r = Math.round(16 + t * 2 * (245 - 16));
        g = Math.round(185 + t * 2 * (158 - 185));
        b = Math.round(129 + t * 2 * (11 - 129));
      } else {
        // Yellow to Red
        const t2 = (t - 0.5) * 2;
        r = Math.round(245 + t2 * (244 - 245));
        g = Math.round(158 + t2 * (63 - 158));
        b = Math.round(11 + t2 * (94 - 11));
      }
      return `rgba(${r},${g},${b},0.85)`;
    }
  };

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = { selectedCountryId, selectedStateId, hoveredCountryId: stateRef.current.hoveredCountryId, scenarioCountryIds, dataLens };
  }, [selectedCountryId, selectedStateId, scenarioCountryIds, dataLens]);

  const countryByName = useMemo(() => {
    const map = new Map();
    for (const c of countries) map.set(norm(c.name), c.id);
    for (const [alias, target] of Object.entries(nameAliases)) {
      const targetId = countries.find((c) => norm(c.name) === norm(target))?.id;
      if (targetId) map.set(norm(alias), targetId);
    }
    return map;
  }, [countries]);

  const countryIdSet = useMemo(() => new Set(countries.map((c) => c.id)), [countries]);
  const countryById = useMemo(() => {
    const map = new Map();
    for (const c of countries) map.set(c.id, c);
    return map;
  }, [countries]);

  const resolveCountryIdFromFeature = useCallback(
    (feature) => {
      if (!feature) return null;
      const iso3 = getFeatureISO3(feature);
      if (iso3 && countryIdSet.has(iso3)) return iso3;
      const name = getFeatureName(feature);
      const byName = name ? countryByName.get(norm(name)) ?? null : null;
      if (byName) return byName;
      return null;
    },
    [countryByName, countryIdSet]
  );

  const stateByName = useMemo(() => {
    const map = new Map();
    for (const c of (usStates || [])) map.set(norm(c.name), c.id);
    return map;
  }, [usStates]);

  const stateById = useMemo(() => {
    const map = new Map();
    for (const c of (usStates || [])) map.set(c.id, c);
    return map;
  }, [usStates]);

  const selectedCity = useMemo(() => {
    if (!selectedCityId) return null;
    return cities.find((c) => c.id === selectedCityId) ?? null;
  }, [cities, selectedCityId]);

  // ── Initialize globe once ────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    if (globeRef.current) return;

    const el = containerRef.current;
    el.innerHTML = "";
    let cancelled = false;

    async function init() {
      const topo = await import("topojson-client");

      // Load globe.gl UMD
      if (typeof window !== "undefined" && !window.Globe) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/globe.gl@2.45.1/dist/globe.gl.min.js";
          s.async = true;
          s.onload = resolve;
          s.onerror = () => reject(new Error("Failed to load globe.gl"));
          document.head.appendChild(s);
        });
      }

      const GlobeImpl = typeof window !== "undefined" ? window.Globe : null;
      if (!GlobeImpl || cancelled) return;

      const res = await fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json");
      const worldTopo = await res.json();
      const fc = topo.feature(worldTopo, worldTopo.objects.countries);

      const usRes = await fetch("https://unpkg.com/us-atlas@3/states-10m.json");
      const usTopo = await usRes.json();
      const usFc = topo.feature(usTopo, usTopo.objects.states);
      // Tag us states
      usFc.features.forEach(f => f.isUSState = true);

      if (cancelled) return;
      setWorldFeatures(fc.features ?? []);
      setUsFeatures(usFc.features ?? []);

      const combinedFeatures = [...(fc.features || []), ...(usFc.features || [])];

      const getPolygonColor = (d) => {
        const isUSState = !!d.isUSState;
        const iso3 = getFeatureISO3(d);
        const fName = getFeatureName(d);
        
        const id = isUSState 
          ? (fName ? stateByName.get(norm(fName)) : null)
          : (iso3 && countryIdSet.has(iso3) ? iso3 : (fName ? countryByName.get(norm(fName)) : null));
        
        const st = stateRef.current;

        // Visual overlay logic: Hide USA if a state is selected, or if USA is selected (showing states instead)
        if (id === 'USA' && (st.selectedCountryId === 'USA' || st.selectedStateId)) {
          return "rgba(0,0,0,0)";
        }

        // Hide US States if USA is not selected
        if (isUSState && st.selectedCountryId !== 'USA') {
          return "rgba(0,0,0,0)";
        }

        const dataObj = isUSState ? stateById.get(id) : countryById.get(id);

        if (dataObj && st.dataLens && st.dataLens !== 'none') {
          if (st.dataLens === 'homicide') {
            return interpolateColor(dataObj.homicideRatePer100k, 0, 45, 'scalar');
          }
          if (st.dataLens === 'crime') {
            return interpolateColor(dataObj.organizedCrimeIndex, 2, 9, 'scalar');
          }
          if (st.dataLens === 'law') {
            const val = dataObj.lawStrictness === 'Permissive' ? 0 : dataObj.lawStrictness === 'Moderate' ? 1 : 2;
            return interpolateColor(val, 0, 2, 'strictness');
          }
        }

        if (id && isUSState && id === st.selectedStateId) return "rgba(59,130,246,0.85)";
        if (id && !isUSState && id === st.selectedCountryId) return "rgba(59,130,246,0.85)";
        if (id && id === st.hoveredCountryId) return "rgba(99,102,241,0.7)";
        
        if (st.scenarioCountryIds && id && st.scenarioCountryIds.includes(id)) return "rgba(59,130,246,0.45)";
        if (st.scenarioCountryIds && id && !st.scenarioCountryIds.includes(id)) {
           return isUSState && st.selectedCountryId === 'USA' ? "rgba(255,255,255,0.01)" : (!isUSState ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0)");
        }
        
        return (isUSState && st.selectedCountryId === 'USA') ? "rgba(255,255,255,0.05)" : (id ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.01)");
      };

      const globe = new GlobeImpl(el)
        .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .backgroundColor("rgba(0,0,0,0)") // Transparent to show CSS background
        .showAtmosphere(true)
        .atmosphereColor("#3b82f6")
        .atmosphereAltitude(0.2)
        .polygonsData(combinedFeatures)
        .polygonAltitude((d) => {
          const isUSState = !!d.isUSState;
          const iso3 = getFeatureISO3(d);
          const fName = getFeatureName(d);
          const id = isUSState ? (fName ? stateByName.get(norm(fName)) : null) : ((iso3 && countryIdSet.has(iso3)) ? iso3 : (fName ? countryByName.get(norm(fName)) : null));
          
          if (id === 'USA' && (stateRef.current.selectedCountryId === 'USA' || stateRef.current.selectedStateId)) return 0;
          if (isUSState && stateRef.current.selectedCountryId !== 'USA') return 0;
          
          if (isUSState && id === stateRef.current.selectedStateId) return 0.025;
          if (!isUSState && id === stateRef.current.selectedCountryId) return 0.025;
          return 0.008;
        })
        .polygonCapColor(getPolygonColor)
        .polygonSideColor(() => "rgba(59,130,246,0.08)")
        .polygonStrokeColor((d) => {
          const isUSState = !!d.isUSState;
          const iso3 = getFeatureISO3(d);
          const fName = getFeatureName(d);
          const id = isUSState ? (fName ? stateByName.get(norm(fName)) : null) : ((iso3 && countryIdSet.has(iso3)) ? iso3 : (fName ? countryByName.get(norm(fName)) : null));
          const st = stateRef.current;
          
          if (id === 'USA' && st.selectedCountryId === 'USA') return "rgba(0,0,0,0)";
          if (isUSState && st.selectedCountryId !== 'USA') return "rgba(0,0,0,0)";
          
          if (id && (id === st.selectedCountryId || id === st.selectedStateId || id === st.hoveredCountryId)) return "rgba(59,130,246,0.5)";
          return "rgba(255,255,255,0.08)";
        })
        .polygonLabel((d) => {
          const isUSState = !!d.isUSState;
          const iso3 = getFeatureISO3(d);
          const fName = getFeatureName(d);
          const id = isUSState ? (fName ? stateByName.get(norm(fName)) : null) : ((iso3 && countryIdSet.has(iso3)) ? iso3 : (fName ? countryByName.get(norm(fName)) : null));
          const st = stateRef.current;

          if (isUSState && st.selectedCountryId !== 'USA') return null;
          if (id === 'USA' && st.selectedCountryId === 'USA') return null;

          if (id) {
            const c = isUSState ? stateById.get(id) : countryById.get(id);
            return c ? buildTooltipHTML(c, isUSState) : buildUnknownTooltipHTML(fName);
          }
          return buildUnknownTooltipHTML(fName);
        })
        .onPolygonHover((feature) => {
          const isUSState = feature ? !!feature.isUSState : false;
          const iso3 = feature ? getFeatureISO3(feature) : null;
          const fName = feature ? getFeatureName(feature) : null;
          const id = isUSState ? (fName ? stateByName.get(norm(fName)) : null) : (iso3 && countryIdSet.has(iso3) ? iso3 : fName ? countryByName.get(norm(fName)) : null);
          
          stateRef.current.hoveredCountryId = id;
          el.style.cursor = feature ? "pointer" : "grab";
          // Re-render
          globe.polygonCapColor(getPolygonColor).polygonAltitude((d2) => {
            const isUS = !!d2.isUSState;
            const iso32 = getFeatureISO3(d2);
            const fName2 = getFeatureName(d2);
            const id2 = isUS ? (fName2 ? stateByName.get(norm(fName2)) : null) : ((iso32 && countryIdSet.has(iso32)) ? iso32 : (fName2 ? countryByName.get(norm(fName2)) : null));
            const st = stateRef.current;

            if (id2 === 'USA' && st.selectedCountryId === 'USA') return 0;
            if (isUS && st.selectedCountryId !== 'USA') return 0;
            
            if (isUS && id2 === st.selectedStateId) return 0.025;
            if (!isUS && id2 === st.selectedCountryId) return 0.025;
            if (id2 && id2 === id) return 0.015;
            return 0.008;
          });
        })
        .onPolygonClick((feature) => {
          const isUSState = feature ? !!feature.isUSState : false;
          const iso3 = getFeatureISO3(feature);
          const fName = getFeatureName(feature);
          const id = isUSState ? (fName ? stateByName.get(norm(fName)) : null) : ((iso3 && countryIdSet.has(iso3)) ? iso3 : (fName ? countryByName.get(norm(fName)) : null));
          
          if (id) {
            if (isUSState) {
              onSelectState(id);
            } else {
              onSelectCountry(id);
            }
          } else {
            onCountryNotFound?.(fName || "Unknown territory");
          }
        })
        .polygonsTransitionDuration(200)
        // Points (city markers)
        .pointsData([])
        .pointLat((d) => d.lat)
        .pointLng((d) => d.lng)
        .pointRadius(0.15)
        .pointAltitude(0.0)
        .pointColor(() => "rgba(99,102,241,0.95)")
        .pointsMerge(false)
        .pointResolution(6)
        .pointsTransitionDuration(300)
        .pointLabel((d) => `
          <div style="
            font-family: Inter, sans-serif;
            background: rgba(6,10,20,0.9);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 8px 12px;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          ">
            <div style="font-size:13px; font-weight:600; color:#f1f5f9;">${d.name}</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Homicide: ${d.homicideRatePer100k}/100k</div>
          </div>
        `)
        .onPointClick((point) => {
          if (point?.id) onSelectCity(point.id);
        });

      globeRef.current = globe;

      // Initial view
      const initCountry = countries.find((c) => c.id === stateRef.current.selectedCountryId) ?? countries[0];
      globe.pointOfView({ lat: initCountry.lat, lng: initCountry.lng, altitude: 2.2 }, 1200);

      // Handle resize explicitly
      const ro = new ResizeObserver(() => {
        if (!el || !globe) return;
        globe.width(el.clientWidth).height(el.clientHeight);
      });
      ro.observe(el);

      // Signal ready
      setTimeout(() => onGlobeReady?.(), 800);
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      try { el.innerHTML = ""; } catch {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update polygon styling on selection / scenario change / lens ──
  useEffect(() => {
    if (!globeRef.current || !worldFeatures || !usFeatures) return;
    globeRef.current.polygonsData([...worldFeatures, ...usFeatures]);
  }, [selectedCountryId, selectedStateId, scenarioCountryIds, dataLens, worldFeatures, usFeatures]);

  // ── Update city points ────────────────────────────────
  useEffect(() => {
    if (!globeRef.current) return;
    
    // We only show cities for a specific area (Country for outside the US, State for inside the US)
    if (!citiesVisible || (!selectedCountryId && !selectedStateId)) {
      globeRef.current.pointsData([]);
      return;
    }

    // Since we don't have separate state cities mapping in our DB, we'll just show the country ones for now
    const points = cities
      .filter((c) => c.countryId === selectedCountryId)
      .map((c) => ({ ...c }));

    globeRef.current
      .pointsData(points)
      .pointRadius((d) => {
        if (selectedCityId === d.id) return 0.35;
        // Size proportional to homicide rate
        const rate = d.homicideRatePer100k ?? 5;
        return Math.min(0.28, Math.max(0.1, rate / 40));
      })
      .pointColor((d) => {
        if (selectedCityId === d.id) return "rgba(59,130,246,1)";
        const rate = d.homicideRatePer100k ?? 5;
        if (rate > 10) return "rgba(244,63,94,0.9)";    // red = dangerous
        if (rate > 5) return "rgba(245,158,11,0.9)";     // amber = moderate
        return "rgba(16,185,129,0.85)";                   // green = safe
      })
      .pointAltitude((d) => (selectedCityId === d.id ? 0.025 : 0.005));
  }, [cities, citiesVisible, selectedCountryId, selectedCityId]);

  // ── Fly to selected country / state / city ─────────────────────
  useEffect(() => {
    if (!globeRef.current) return;
    const duration = 1000;
    if (selectedCity) {
      // Zoom close to city
      globeRef.current.pointOfView(
        { lat: selectedCity.lat, lng: selectedCity.lng, altitude: 0.5 },
        duration
      );
    } else if (selectedStateId) {
      // Zoom to state
      const st = (usStates || []).find(s => s.id === selectedStateId);
      if (st && st.lat && st.lng) {
        globeRef.current.pointOfView(
          { lat: st.lat, lng: st.lng, altitude: 1.0 },
          duration
        );
      }
    } else {
      const c = countries.find((x) => x.id === selectedCountryId) ?? countries[0];
      globeRef.current.pointOfView(
        { lat: c.lat, lng: c.lng, altitude: 2.2 },
        duration
      );
    }
  }, [selectedCity, selectedStateId, selectedCountryId, countries, usStates]);

  return <div ref={containerRef} className="w-full h-full" />;
}
