# Agent-Driven Build Plan: Biomimetic Market Visualization

## Mission
Ship a high-impact, visualization-first prototype of "The Market as a Living Organism" using your current dataset, without a heavy backend or database.

This plan is designed for:
- 2 humans (you + teammate)
- multiple AI agents doing scoped work in parallel
- quick iteration toward a polished demo

## Product Definition (What You Are Building)
- One interactive 3D organism driven by market state factors.
- Timeline scrubber for historical replay.
- Force toggles:
  - gamma metabolism
  - manipulation pressure (pulling/stacking)
  - liquidity/imbalance
- Health state readout (`stable`, `stressed`, `critical`).
- Optional counterfactual overlay (`Observed` vs `No-Gamma` vs `No-Manipulation`) as a lightweight chart panel.

## Architecture (Deliberately Lightweight)
- Frontend-first app (React + React Three Fiber + Drei + Zustand).
- Data served from static files (`.json` / `.csv`) generated offline by Python scripts.
- Optional tiny local API only if needed for convenience (`FastAPI` with no DB).
- No database, no streaming infra, no auth, no queue.

## Team Model

### Human A (Technical Lead)
- Owns data semantics and factor formulas.
- Reviews all generated scripts/metrics.
- Signs off on scientific claims and caveats.

### Human B (Experience Lead)
- Owns 3D UX, interactions, visuals, narrative.
- Signs off on usability, flow, and demo quality.

### AI Agents
- Use purpose-specific agents for each stage below.
- Each agent has:
  - objective
  - exact prompt template
  - expected outputs
  - acceptance checks

## Repository Target Structure
```text
cpsc481_project/
  parsed_scaled/
  analysis/
    relationships/
    cleaned/
    factors/
    counterfactual/
  scripts/
    build_clean_features.py
    build_state_indices.py
    build_counterfactual.py
  app/                        # frontend
  docs/
    factor_definitions.md
    limitations.md
    demo_script.md
  plan.md
```

## Global Rules for Every Agent
- Keep everything reproducible from command line.
- Never overwrite raw data.
- Log assumptions in comments or markdown.
- Prefer small scripts with explicit inputs/outputs.
- If uncertain, default to "model-based what-if", not causal proof.

## Stage Plan

## Stage 0: Alignment and Contracts (Half day)
Objective:
- Lock scope and interfaces so all later agents can run independently.

Primary owner:
- Human A + Human B

Outputs:
- `docs/factor_definitions.md` (draft skeleton)
- `docs/limitations.md` (draft skeleton)
- agreed output schemas for `clean_features.csv`, `state_indices.csv`, `counterfactual.csv`

Agent prompt:
```text
You are the Project Contract Agent.
Task: Create a strict schema contract for three files:
1) clean_features.csv
2) state_indices.csv
3) counterfactual.csv

Requirements:
- Include column names, data types, and semantic meaning.
- Include required vs optional fields.
- Include one sample row for each file.
- Keep language concise and implementation-ready.

Context:
- Data source: parsed_scaled/levels.csv
- We are building a visualization-first prototype.
- No heavy backend and no database.
```

Acceptance checks:
- Schema is unambiguous.
- Both humans agree to same field names.

## Stage 1: Data Audit and Cleanup (Day 1)
Objective:
- Turn noisy/redundant raw columns into a stable cleaned feature set.

Primary owner:
- Human A

Outputs:
- `scripts/build_clean_features.py`
- `analysis/cleaned/clean_features.csv`
- `analysis/cleaned/feature_pruning_report.csv`

Agent prompt:
```text
You are the Data Cleanup Agent.
Implement scripts/build_clean_features.py.

Input:
- parsed_scaled/levels.csv

Requirements:
- Fix header typo in processing layer: 'cans ll_delta' -> 'call_delta'
- Drop constant columns
- Detect and drop exact duplicate columns
- Detect and flag near-duplicate columns (abs correlation > 0.999)
- Keep a compact non-redundant set for visualization
- Save:
  - analysis/cleaned/clean_features.csv
  - analysis/cleaned/feature_pruning_report.csv

Output format:
- CLI script with argparse
- clear print summary of rows kept, columns removed, reasons
```

Acceptance checks:
- Script runs end-to-end.
- Pruning report explains every removed field.
- `spx_price` is removed or marked constant.

## Stage 2: Factor Engine (Day 2)
Objective:
- Produce interpretable biological control signals from cleaned data.

Primary owner:
- Human A

Outputs:
- `scripts/build_state_indices.py`
- `analysis/factors/state_indices.csv`
- `docs/factor_definitions.md` (fully completed)

Target factors:
- `liquidity_density_factor`
- `gamma_metabolism_factor`
- `manipulation_factor`
- `price_kinetic_factor`
- `health_score`

Agent prompt:
```text
You are the Factor Engineering Agent.
Implement scripts/build_state_indices.py.

Input:
- analysis/cleaned/clean_features.csv

Requirements:
- Build the following normalized factors in range [0,1]:
  - liquidity_density_factor
  - gamma_metabolism_factor
  - manipulation_factor
  - price_kinetic_factor
- Build health_score as weighted blend (configurable weights)
- Add smoothing option (rolling window)
- Output analysis/factors/state_indices.csv
- Emit markdown formulas and rationale into docs/factor_definitions.md
- Keep formulas interpretable and explain each signal direction.
```

Acceptance checks:
- Factors are finite and bounded.
- Health score changes over time (not flat).
- Mapping rationale is understandable to a non-quant audience.

## Stage 3: Visual Language and Scene System (Days 3-4)
Objective:
- Convert factors into clear organism behavior.

Primary owner:
- Human B

Outputs:
- `app/` scaffold with live scene
- organism shader/material mapping
- control panel + timeline slider

Agent prompt:
```text
You are the 3D UX Agent.
Build a React Three Fiber scene that maps:
- liquidity_density_factor -> cellular density / particle count
- gamma_metabolism_factor -> pulse frequency and emissive intensity
- manipulation_factor -> local deformation spikes and unstable flicker
- price_kinetic_factor -> directional motion / body tilt
- health_score -> global color state (stable/stressed/critical)

Requirements:
- smooth interpolation between frames
- scrubber to move through historical time
- toggles for each force
- responsive layout desktop + laptop
- no placeholder lorem UI; make a deliberate visual style
```

Acceptance checks:
- Scrubbing is smooth.
- Turning one factor off visibly changes behavior.
- Scene remains readable and not visually noisy.

## Stage 4: Data Binding and Playback Engine (Day 5)
Objective:
- Wire frontend to generated factor files with deterministic playback.

Primary owner:
- Human B (with Human A support)

Outputs:
- data loader module
- frame interpolation utilities
- replay controller state store

Agent prompt:
```text
You are the Frontend Data Integration Agent.
Integrate analysis/factors/state_indices.csv (or json export) into the app.

Requirements:
- deterministic playback loop
- timeline scrub with frame interpolation
- play/pause/speed controls
- robust handling of missing frames
- typed data model and validation guard
```

Acceptance checks:
- No crashes when scrubbing aggressively.
- Frame rate stable on normal laptop.

## Stage 5: Counterfactual Lite Panel (Day 6)
Objective:
- Add simple what-if trajectories without a heavy causal engine.

Primary owner:
- Human A (model) + Human B (UI)

Outputs:
- `scripts/build_counterfactual.py`
- `analysis/counterfactual/counterfactual.csv`
- UI overlay panel for divergence

Agent prompt:
```text
You are the Counterfactual Lite Agent.
Create a simple decomposition model for short-horizon price movement:
- observed
- gamma_component
- manipulation_component
- residual

Generate:
- no_gamma = observed - gamma_component
- no_manipulation = observed - manipulation_component

Output:
- analysis/counterfactual/counterfactual.csv
- include divergence metrics:
  - abs_gap_observed_vs_no_gamma
  - abs_gap_observed_vs_no_manipulation
  - cumulative_gap versions

Important:
- Label all outputs as model-based what-if simulations.
```

Acceptance checks:
- Trajectories are not identical.
- Divergence metrics are coherent and non-negative.

## Stage 6: Narrative Polish and Demo Packaging (Days 7-8)
Objective:
- Turn prototype into a strong story.

Primary owner:
- Human B

Outputs:
- `docs/demo_script.md`
- on-screen labels/tooltips
- final camera presets and transitions

Agent prompt:
```text
You are the Demo Narrative Agent.
Produce a concise 2-3 minute demo script:
- opening context
- show normal state
- show stress build-up
- toggle forces and explain differences
- show counterfactual divergence panel
- close with limitations and next steps

Also suggest exact on-screen captions that make the science honest.
```

Acceptance checks:
- A viewer can understand value in one pass.
- Claims stay conservative and defensible.

## Stage 7: QA and Hardening (Day 9)
Objective:
- Remove failure points before submission/demo.

Primary owner:
- Human A + Human B

Outputs:
- bug list + fixes
- reproducibility checklist
- limitations section finalized

Agent prompt:
```text
You are the QA Agent.
Review project for:
- broken commands
- missing files
- schema mismatches
- UI state bugs
- misleading claims

Deliver:
- prioritized issue list (critical/high/medium)
- concrete fixes with file-level instructions
- final go/no-go checklist
```

Acceptance checks:
- Clean run from setup to demo.
- No critical issues open.

## Stage 8: Final Submission Build (Day 10)
Objective:
- Freeze a reliable final version.

Primary owner:
- Human A

Outputs:
- tagged commit
- final artifact folder
- short readme quickstart

Agent prompt:
```text
You are the Release Agent.
Prepare final submission:
- verify all scripts run from clean environment
- verify app build command succeeds
- produce final artifacts list
- update README with exact run commands
- generate final known-limitations section
```

Acceptance checks:
- Teammate can run demo with copy-paste commands.

## Parallel Work Matrix (Who Does What at Same Time)
- Day 1: Human A + Data Cleanup Agent, Human B + 3D scaffold agent.
- Day 2: Human A + Factor Agent, Human B + scene behavior agent.
- Day 3-4: Human B + UX agent while Human A validates factors.
- Day 5: Integration agent and data contract agent in lockstep.
- Day 6: Counterfactual agent + chart UI agent.
- Day 7-8: Narrative agent + visual polish agent.
- Day 9-10: QA agent + release agent.

## Prompt Library (Copy/Paste Fast)

## Prompt A: Build Script Agent
```text
Read current repo files first. Implement only what is asked.
Create/modify minimal files, keep scripts CLI-driven, use argparse.
Do not hardcode absolute paths. Write outputs under analysis/.
After coding, run the script and summarize outputs.
```

## Prompt B: Frontend Feature Agent
```text
Use existing app structure and preserve style consistency.
Ship a complete feature (UI + state + rendering) with no dead controls.
Add concise comments only where logic is non-obvious.
Include a short manual test checklist in your response.
```

## Prompt C: Review Agent
```text
Do a strict review focused on regressions and correctness.
Return findings ordered by severity with file/line references.
If no findings, state that explicitly and list residual risks.
```

## Minimal Technical Stack
- Python: pandas, numpy, matplotlib/seaborn for analysis scripts.
- Frontend: React, @react-three/fiber, @react-three/drei, Zustand, d3-scale.
- Build/deploy: static hosting (Netlify/Vercel/GitHub Pages acceptable).

## Commands to Standardize
```bash
python scripts/build_clean_features.py --input parsed_scaled/levels.csv --out analysis/cleaned
python scripts/build_state_indices.py --input analysis/cleaned/clean_features.csv --out analysis/factors
python scripts/build_counterfactual.py --input analysis/factors/state_indices.csv --out analysis/counterfactual
```

## Quality Bar (Definition of Excellent)
- Visuals feel intentional, not generic.
- Controls are responsive and easy to understand.
- Factor mappings are interpretable and documented.
- Counterfactual panel is clearly labeled as simulation.
- Demo tells a coherent story in under 3 minutes.

## Risk Controls
- Redundancy risk:
  - prune aggressively and document why.
- Overclaim risk:
  - explicit caveat language everywhere.
- Scope risk:
  - no heavy backend, no database, no streaming.
- Performance risk:
  - precompute files offline and keep runtime lightweight.

## Next Immediate Actions
1. Human A runs Stage 1 prompt with an agent to generate cleanup script + reports.
2. Human B starts Stage 3 scaffold in parallel with mock factor JSON.
3. End of day: lock schema, then unblock Stage 2/4 integration.
