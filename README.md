# Next-Generation Market Visualizations: Biomimetic & Counterfactual Systems

## Project Overview
This project represents a sophisticated shift from traditional quantitative visualization toward biomimetic systems and causal inference. We are moving from descriptive analytics ("what is") into the realm of simulations and causal analysis ("what could be"). By transforming market microstructure data into intuitive 3D biological entities and parallel "counterfactual" realities, we shift the paradigm of financial monitoring toward immediate sensory perception and explainable modeling.

---

## The Core Ideas

### 1. The Market as a Living Organism (Biomimetic Monitoring)
This concept involves a biomimetic transformation of market microstructure data into a 3D biological entity to allow for intuitive "health" monitoring of systemic risk.

* **3D Evolution**: The organism pulses with order imbalances and deforms under structural market stress.
* **Intuitive Diagnostics**: Before a crash or "flush," the organism appears visually "sick" or unstable, bypassing abstract cognition for immediate sensory perception.
* **Data-to-Biological Mapping**:

| Market Data | Biological Interpretation |
| :--- | :--- |
| Liquidity (Order Volume) | Cellular Density |
| Gamma Exposure | Metabolism / Energy Flow |
| Order Pulling | Apoptosis (Cell Death) |
| Order Stacking | Abnormal Growth / Hyperplasia |
| Price Movement | Kinesthetic Reaction |

### 2. Counterfactual Market (Alternative Realities)
A visualization framework that utilizes causal inference to display parallel market realities, stripping away specific hidden forces to reveal their true impact.

* **The Three Parallel Layers**:
    1. **Observed Market**: The "ground truth" real-time data.
    2. **No-Gamma Reality**: A simulation removing the effects of delta-hedging pressure.
    3. **No-Manipulation Reality**: A simulation filtering out pulling, stacking, and spoofing signals.
* **Divergence Measurement**: Quantitative tools to measure the structural delta between reality and the counterfactual simulations.

---

## Interaction & User Agency
* **3D Navigation**: Users can rotate the 3D entity and isolate specific strike regions to observe localized cellular activity.
* **Historical Scrubbing**: Ability to scrub through historical "health" cycles to identify lead-up patterns to market stress.
* **Force Toggling**: Users can "switch off" specific market forces (like liquidity imbalance) to see how the price would have moved in a vacuum.
* **Synchronized Realities**: Three identical coordinate systems displayed side-by-side or overlaid, showing diverging price trajectories and structural dynamics.

---

## Implementation & System Architecture
To support a hosted, interactive environment, the project is built on a modern full-stack architecture designed for real-time performance.

* **Frontend**: **React** with **Three.js (React Three Fiber)** to manage the 3D rendering and synchronized coordinate systems.
* **Backend**: **FastAPI (Python)** to compute causal deltas and run the "No-Gamma" and "No-Manipulation" simulation layers.
* **Hosting**: The frontend and interactive UI are hosted on **Netlify**, utilizing continuous integration and serverless functions where necessary.
* **Causal Engine**: Bridging the gap between visualization and causal analysis to isolate variables in complex adaptive systems.
* **Data Pipeline**: A dedicated system to ingest and visualize market microstructure data (liquidity, volume, and price movement).

---

## Academic & Research Value
This project shifts the focus from "What happened?" to "Why did it happen?". It serves as a research tool for:
* **Causal Analysis**: Isolating variables in complex adaptive systems.
* **Explainable Modeling**: Making "Black Box" market forces transparent.
* **Decision Support**: Enhancing risk assessment through counterfactual reasoning.

---

## Getting Started
1. **Clone the Repo**: `git clone [repository-url]`
2. **Install Frontend Dependencies**: `npm install`
3. **Install Backend Dependencies**: `pip install -r requirements.txt`
4. **Deploy**: Push to the main branch for automatic deployment via **Netlify**.

---

## Greek Columns Reference (`parsed_scaled/levels.csv`)
The `call_*` and `put_*` columns are option Greeks (sensitivities) for the same timestamp/strike context.

### Variables
- `S`: underlying price (ES)
- `K`: strike
- `T`: time to expiration (years)
- `r`: risk-free rate
- `q`: dividend yield (or carry)
- `sigma`: implied volatility
- `N(.)`: standard normal CDF
- `phi(.)`: standard normal PDF

Define:

`d1 = [ln(S/K) + (r - q + 0.5*sigma^2)T] / (sigma*sqrt(T))`

`d2 = d1 - sigma*sqrt(T)`

### Black-Scholes Prices
- `Call = S*exp(-qT)*N(d1) - K*exp(-rT)*N(d2)`
- `Put  = K*exp(-rT)*N(-d2) - S*exp(-qT)*N(-d1)`

### Dataset Greek Formulas
1. `call_delta`, `put_delta`
   - `call_delta = exp(-qT)*N(d1)`
   - `put_delta  = exp(-qT)*(N(d1) - 1)`

2. `call_gamma`, `put_gamma` (same formula)
   - `gamma = exp(-qT)*phi(d1) / (S*sigma*sqrt(T))`

3. `call_vega`, `put_vega` (same formula)
   - `vega = S*exp(-qT)*phi(d1)*sqrt(T)`

4. `call_theta`, `put_theta`
   - `call_theta = -(S*exp(-qT)*phi(d1)*sigma)/(2*sqrt(T)) - r*K*exp(-rT)*N(d2) + q*S*exp(-qT)*N(d1)`
   - `put_theta  = -(S*exp(-qT)*phi(d1)*sigma)/(2*sqrt(T)) + r*K*exp(-rT)*N(-d2) - q*S*exp(-qT)*N(-d1)`

5. `call_rho`, `put_rho`
   - `call_rho = K*T*exp(-rT)*N(d2)`
   - `put_rho  = -K*T*exp(-rT)*N(-d2)`

6. `call_vanna`, `put_vanna` (same formula)
   - `vanna = -exp(-qT)*phi(d1)*(d2/sigma)`

7. `call_vomma`, `put_vomma` (same formula)
   - `vomma = vega*(d1*d2/sigma)`

8. `call_charm`, `put_charm`
   - `call_charm = q*exp(-qT)*N(d1) - exp(-qT)*phi(d1)*[2*(r-q)T - d2*sigma*sqrt(T)]/(2*T*sigma*sqrt(T))`
   - `put_charm  = -q*exp(-qT)*N(-d1) - exp(-qT)*phi(d1)*[2*(r-q)T - d2*sigma*sqrt(T)]/(2*T*sigma*sqrt(T))`

### Notes
- In many rows, `call_gamma == put_gamma`, `call_vega == put_vega`, `call_vanna == put_vanna`, and `call_vomma == put_vomma`.
- Also often `put_delta ~= call_delta - 1` for the same strike/expiry (standard parity relationship).
