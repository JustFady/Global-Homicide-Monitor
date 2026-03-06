# CSV Schema Contract (Prototype v1)

Source of truth: `parsed_scaled/levels.csv`  
Target use: static files for frontend visualization (no DB/backend dependency).

## 1) `clean_features.csv`

One row = one observed market state at (`timestamp`, `side`, `future_strike`).

| Column | Type | Required | Constraints | Meaning |
|---|---|---:|---|---|
| `state_id` | string | Yes | unique; format `{timestamp}\|{side}\|{future_strike}` | Stable join key across all output files. |
| `tick_id` | int | Yes | `>= 1` | Source tick/batch identifier from `levels.csv`. |
| `timestamp` | string (ISO-8601) | Yes | timezone required | Snapshot time. |
| `side` | enum string | Yes | `Ask` or `Bid` | Order book side. |
| `future_strike` | float | Yes | 0.25 price increment | ES strike level for row context. |
| `spx_strike` | float | Yes | numeric | SPX mapped strike. |
| `current_es_price` | float | Yes | `> 0` | Raw ES price. |
| `current_es_price_scaled` | float | Yes | `> 0` | Scaled ES price used for visual normalization. |
| `t` | float | Yes | `> 0` | Time to expiration in years. |
| `mbo_total_size` | float | Yes | `>= 0` | Sum of all order sizes parsed from `mbo`. |
| `mbo_order_count` | int | Yes | `>= 0` | Number of individual orders parsed from `mbo`. |
| `mbo_pulling_stacking` | float | Yes | numeric | Net pull/stack pressure at this level. |
| `call_delta` | float | Yes | `[-1, 1]` | Corrected rename of source typo (`cans ll_delta`). |
| `call_gamma` | float | Yes | `>= 0` | Call gamma sensitivity. |
| `call_vega` | float | Yes | `>= 0` | Call vega sensitivity. |
| `put_delta` | float | Yes | `[-1, 1]` | Put delta sensitivity. |
| `price_distance` | float | Yes | numeric | `future_strike - current_es_price_scaled`. |
| `valid_row` | boolean | No | default `true` | Optional QA flag for pipeline filtering. |

Sample row:

```csv
state_id,tick_id,timestamp,side,future_strike,spx_strike,current_es_price,current_es_price_scaled,t,mbo_total_size,mbo_order_count,mbo_pulling_stacking,call_delta,call_gamma,call_vega,put_delta,price_distance,valid_row
2025-04-22T15:47:00.237904-04:00|Ask|5361.50,1,2025-04-22T15:47:00.237904-04:00,Ask,5361.50,5362.00,528675.0,5286.75,0.08267313546423136,29.0,3,0.0,0.48231094979429656,0.0005670427540483349,6.052647493056793,-0.5176890502057034,74.75,true
```

## 2) `state_indices.csv`

One row = one indexed state for rendering and health diagnostics.

| Column | Type | Required | Constraints | Meaning |
|---|---|---:|---|---|
| `state_id` | string | Yes | FK to `clean_features.state_id` | State join key. |
| `timestamp` | string (ISO-8601) | Yes | timezone required | Playback clock key. |
| `side` | enum string | Yes | `Ask` or `Bid` | Side-specific state channel. |
| `future_strike` | float | Yes | numeric | Strike coordinate in scene. |
| `liquidity_density_factor` | float | Yes | `[0,1]` | Normalized liquidity intensity. |
| `gamma_metabolism_factor` | float | Yes | `[0,1]` | Normalized gamma-driven reactivity. |
| `manipulation_factor` | float | Yes | `[0,1]` | Normalized pull/stack stress. |
| `price_kinetic_factor` | float | Yes | `[0,1]` | Normalized local price motion pressure. |
| `health_score` | float | Yes | `[0,1]` | Weighted blend of the four factors. |
| `health_state` | enum string | Yes | `stable` / `stressed` / `critical` | Discrete label from `health_score` thresholds. |
| `source_rows` | int | Yes | `>= 1` | Number of `clean_features` rows aggregated into this index row. |

Sample row:

```csv
state_id,timestamp,side,future_strike,liquidity_density_factor,gamma_metabolism_factor,manipulation_factor,price_kinetic_factor,health_score,health_state,source_rows
2025-04-22T15:47:00.237904-04:00|Ask|5361.50,2025-04-22T15:47:00.237904-04:00,Ask,5361.50,0.41,0.57,0.49,0.35,0.46,stressed,1
```

## 3) `counterfactual.csv`

One row = one scenario-specific output for a state.

| Column | Type | Required | Constraints | Meaning |
|---|---|---:|---|---|
| `state_id` | string | Yes | FK to `state_indices.state_id` | State join key. |
| `timestamp` | string (ISO-8601) | Yes | timezone required | Scenario time key. |
| `side` | enum string | Yes | `Ask` or `Bid` | Scenario side channel. |
| `future_strike` | float | Yes | numeric | Scenario strike coordinate. |
| `scenario` | enum string | Yes | `observed` / `no_gamma` / `no_manipulation` | Counterfactual mode. |
| `price_proxy` | float | Yes | `> 0` | Scenario price estimate used in charts/overlay. |
| `health_score_cf` | float | Yes | `[0,1]` | Scenario health score after force removal. |
| `delta_vs_observed` | float | Yes | numeric | `health_score_cf - observed_health_score`. |
| `divergence_score` | float | Yes | `>= 0` | Magnitude of scenario deviation (`abs(delta_vs_observed)`). |
| `note` | string | No | max 120 chars | Optional trace note (formula/version marker). |

Sample row:

```csv
state_id,timestamp,side,future_strike,scenario,price_proxy,health_score_cf,delta_vs_observed,divergence_score,note
2025-04-22T15:47:00.237904-04:00|Ask|5361.50,2025-04-22T15:47:00.237904-04:00,Ask,5361.50,no_gamma,5286.63,0.39,-0.07,0.07,v1_linear_cf
```

## Contract Rules (All Files)

- CSV must include header row and UTF-8 encoding.
- Empty string is invalid for required fields.
- Null representation for optional fields: empty cell.
- Decimal separator: `.` (dot), no thousands separators.
- Timestamps must be full ISO-8601 with offset (example: `2025-04-22T15:47:00.237904-04:00`).
