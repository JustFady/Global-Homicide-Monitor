# Biomimetic + Counterfactual Market Prototype

## What We Are Implementing
We are building a visualization-first prototype from `parsed_scaled/levels.csv` with no heavy backend and no database.

Core product goals:
- Transform market microstructure into interpretable visual factors.
- Render a "market organism" view driven by those factors.
- Show side-by-side counterfactual layers:
  - `observed`
  - `no_gamma`
  - `no_manipulation`

Technical approach:
- Offline preprocessing scripts generate CSV artifacts.
- Frontend consumes static files only.
- Data contracts are strict and versionable.

## Data Flow (Current Contract)
1. Raw source: `parsed_scaled/levels.csv`
2. Build `clean_features.csv` (normalized row-level features)
3. Build `state_indices.csv` (bounded visualization factors + health score)
4. Build `counterfactual.csv` (scenario outputs + divergence)

Schema details for these outputs are defined in `docs/schema_contract.md`.

## Repository Files (High-Level)
- `README.md`
  - Project intent, implementation scope, and file-level map.
- `plan.md`
  - Stage-by-stage build plan and agent task prompts.
- `DATA_DICTIONARY.md`
  - Semantic reference for source variables (market state, queue metrics, Greeks).
- `visualize_relationships.py`
  - Analysis utility script for feature relationships/correlation plots.

- `parsed_scaled/levels.csv`
  - Primary source dataset (row-level market states; large file).
- `parsed_scaled/ticks.csv`
  - Tick-level companion dataset.
- `parsed_scaled/summary.json`
  - Compact metadata/stat summary of parsed data.

- `analysis/relationships/top_correlations.csv`
  - Ranked feature correlation pairs from analysis run.
- `analysis/relationships/correlation_heatmap_full.png`
  - Full correlation matrix visualization.
- `analysis/relationships/correlation_heatmap_top10.png`
  - Top-feature subset correlation heatmap.

- `docs/schema_contract.md`
  - Strict CSV contracts for:
    - `clean_features.csv`
    - `state_indices.csv`
    - `counterfactual.csv`

## Immediate Next Implementation Steps
1. Implement `scripts/build_clean_features.py` to produce `analysis/cleaned/clean_features.csv`.
2. Implement `scripts/build_state_indices.py` to produce `analysis/factors/state_indices.csv`.
3. Implement `scripts/build_counterfactual.py` to produce `analysis/counterfactual/counterfactual.csv`.
4. Wire static outputs into the visualization frontend.

## Notes
- Source header typo must be handled in preprocessing: `cans ll_delta` -> `call_delta`.
- For prototype speed, prioritize deterministic transforms and simple interpretable formulas.
