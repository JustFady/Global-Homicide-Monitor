import React from "react";

/**
 * Breadcrumb navigation for the drill-down: 🌍 > Country > State > City
 */
export default function Breadcrumb({ country, state, city, onSelectCountry, onSelectState, onClearCity }) {
  const crumbs = [];

  // Globe / root
  crumbs.push({
    label: "Globe",
    onClick: null, // no action — we're always at globe level
    active: !country,
  });

  // Country
  if (country) {
    crumbs.push({
      label: `${country.flagEmoji} ${country.name}`,
      onClick: () => {
        onSelectCountry?.(country.id);
      },
      active: !state && !city,
    });
  }

  // State
  if (state) {
    crumbs.push({
      label: state.name,
      onClick: () => {
        onSelectState?.(state.id);
      },
      active: !city,
    });
  }

  // City
  if (city) {
    crumbs.push({
      label: city.name,
      onClick: null,
      active: true,
    });
  }

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/[0.04] overflow-x-auto">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-slate-600 text-[10px] mx-0.5">›</span>}
          {crumb.onClick && !crumb.active ? (
            <button
              onClick={crumb.onClick}
              className="text-[11px] text-slate-400 hover:text-accent transition-colors whitespace-nowrap"
            >
              {crumb.label}
            </button>
          ) : (
            <span className={`text-[11px] whitespace-nowrap ${crumb.active ? "text-white font-semibold" : "text-slate-500"}`}>
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
