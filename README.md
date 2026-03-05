# Next-Generation Market Visualizations: Biomimetic & Counterfactual Systems

## Project Overview
This project represents a shift from traditional quantitative visualization toward biomimetic systems and causal inference. We are moving from descriptive analytics ("what is") into simulations of "what could be." By transforming market microstructure data into a 3D biological entity and parallel "counterfactual" realities, we shift the paradigm from "What happened?" to "Why did it happen?"

---

## Core Concepts

### 1. The Market as a Living Organism
A biomimetic transformation of market microstructure data into a 3D biological entity, allowing for intuitive "health" monitoring of systemic risk.

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

---

## Interaction & User Agency
* **3D Navigation**: Users can rotate the 3D entity and isolate specific strike regions to observe localized activity.
* **Historical Scrubbing**: A timeline allows users to scrub through "health" cycles to identify lead-up patterns to market stress.
* **Force Toggling**: Users can "switch off" specific market forces in real-time to observe how price trajectories diverge in a vacuum.
* **Divergence Measurement**: Quantitative tools to measure the structural delta between reality and the counterfactual simulations.

---

## Technical Stack & Architecture
To support a hosted, interactive environment, the project is built on a modern full-stack architecture:

* **Frontend**: **React** with **Three.js (React Three Fiber)** for high-performance 3D rendering.
* **Backend**: **FastAPI (Python)** for processing microstructure data and running causal inference models.
* **Real-time Engine**: **WebSockets** to stream live market data (ground truth) directly to the client.
* **Causal Engine**: Implementation of stochastic modeling and causal counterfactuals to isolate market variables.
* **Hosting**: Designed for deployment on **Vercel** (Frontend) and **AWS/Heroku** (Backend) for low-latency interaction.

---

## Academic & Research Value
This project bridges the gap between data visualization and:
* **Causal Analysis**: Isolating variables in complex adaptive systems.
* **Explainable Modeling**: Making "Black Box" market forces transparent.
* **Decision Support**: Enhancing risk assessment through counterfactual reasoning.

---

## Getting Started
1. **Clone the Repo**: `git clone [repository-url]`
2. **Install Dependencies**: `npm install` and `pip install -r requirements.txt`
3. **Run Development Server**: `npm run dev`
4. **Initialize Data Stream**: Connect via the provided WebSocket endpoint to visualize live or historical data.
