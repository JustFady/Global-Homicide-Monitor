import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const HEALTH_COLORS = {
  stable: '#2a9d8f',
  stressed: '#f4a261',
  critical: '#e76f51',
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpArray(a = [], b = [], t = 0) {
  const maxLen = Math.max(a.length, b.length);
  const out = new Array(maxLen);
  for (let i = 0; i < maxLen; i += 1) {
    out[i] = lerp(Number(a[i] ?? 0), Number(b[i] ?? 0), t);
  }
  return out;
}

function interpolateFrame(current, next, alpha) {
  if (!current) {
    return null;
  }
  if (!next) {
    return current;
  }

  return {
    ...current,
    liquidity_density_factor: lerp(current.liquidity_density_factor, next.liquidity_density_factor, alpha),
    gamma_metabolism_factor: lerp(current.gamma_metabolism_factor, next.gamma_metabolism_factor, alpha),
    manipulation_factor: lerp(current.manipulation_factor, next.manipulation_factor, alpha),
    price_kinetic_factor: lerp(current.price_kinetic_factor, next.price_kinetic_factor, alpha),
    health_score: lerp(current.health_score, next.health_score, alpha),
    side_imbalance: lerp(current.side_imbalance, next.side_imbalance, alpha),
    order_density: lerp(current.order_density, next.order_density, alpha),
    ask_flow: lerpArray(current.ask_flow, next.ask_flow, alpha),
    bid_flow: lerpArray(current.bid_flow, next.bid_flow, alpha),
  };
}

function useReplayData() {
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch('/data/replay_frames.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load replay data: ${response.status}`);
        }
        const data = await response.json();
        if (!mounted) {
          return;
        }
        setPayload(data);
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { payload, error, loading };
}

function OrganismScene({ frame, toggles }) {
  const bodyRef = useRef();
  const auraRef = useRef();
  const flowRef = useRef();

  const frameRef = useRef(frame);
  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  const numLanes = frame.ask_flow.length;

  const bloodSeeds = useMemo(() => {
    return Array.from({ length: 140 }, (_, idx) => {
      const lane = idx % Math.max(numLanes, 1);
      const seed = (idx * 0.61803398875) % 1;
      return { lane, seed, side: idx % 2 === 0 ? 'ask' : 'bid' };
    });
  }, [numLanes]);

  const bloodMeshRef = useRef();
  const temp = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const f = frameRef.current;
    if (!f) {
      return;
    }

    const pulseSpeed = 1.2 + f.gamma_metabolism_factor * 5.0;
    const pulse = 1.0 + Math.sin(state.clock.elapsedTime * pulseSpeed * Math.PI) * 0.04;

    const kineticTilt = (f.price_kinetic_factor - 0.5) * 0.45;
    const sideLean = f.side_imbalance * 0.28;

    if (bodyRef.current) {
      bodyRef.current.scale.setScalar(lerp(bodyRef.current.scale.x, pulse, 0.15));
      bodyRef.current.rotation.z = lerp(bodyRef.current.rotation.z, kineticTilt + sideLean, 0.07);
      bodyRef.current.rotation.x = lerp(bodyRef.current.rotation.x, (f.liquidity_density_factor - 0.5) * 0.15, 0.06);
    }

    if (auraRef.current) {
      const auraScale = 1.45 + f.manipulation_factor * 0.18;
      auraRef.current.scale.setScalar(lerp(auraRef.current.scale.x, auraScale, 0.08));
      auraRef.current.rotation.z += delta * (0.08 + f.gamma_metabolism_factor * 0.2);
    }

    if (flowRef.current) {
      flowRef.current.rotation.y += delta * (0.08 + f.gamma_metabolism_factor * 0.08);
    }

    if (bloodMeshRef.current) {
      const laneCount = Math.max(f.ask_flow.length, 1);
      for (let i = 0; i < bloodSeeds.length; i += 1) {
        const item = bloodSeeds[i];
        const laneRatio = laneCount <= 1 ? 0.5 : item.lane / (laneCount - 1);
        const y = (laneRatio - 0.5) * 2.4;

        const laneFlow = item.side === 'ask'
          ? (f.ask_flow[item.lane] ?? 0)
          : (f.bid_flow[item.lane] ?? 0);

        const driftSpeed = 0.35 + laneFlow * 1.6 + f.gamma_metabolism_factor * 0.55;
        const phase = (state.clock.elapsedTime * driftSpeed + item.seed * 7.0) % 2;
        const direction = item.side === 'ask' ? 1 : -1;
        const x = (phase - 1) * 2.2 * direction;
        const turbulence = Math.sin((state.clock.elapsedTime + item.seed) * 8.0) * f.manipulation_factor * 0.1;
        const zBase = item.side === 'ask' ? 0.26 : -0.26;

        temp.position.set(x, y + turbulence, zBase + Math.sin(item.seed * 20 + state.clock.elapsedTime) * 0.04);
        const scale = 0.013 + laneFlow * 0.018 + f.order_density * 0.012;
        temp.scale.setScalar(scale);
        temp.updateMatrix();
        bloodMeshRef.current.setMatrixAt(i, temp.matrix);
      }
      bloodMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const healthColor = HEALTH_COLORS[frame.health_state] ?? HEALTH_COLORS.stressed;

  return (
    <group>
      <mesh ref={bodyRef}>
        <icosahedronGeometry args={[0.85, 9]} />
        <meshStandardMaterial
          color={healthColor}
          roughness={0.45}
          metalness={0.1}
          emissive={healthColor}
          emissiveIntensity={0.35 + frame.gamma_metabolism_factor * 0.75}
          transparent
          opacity={0.9}
          wireframe={false}
        />
      </mesh>

      <mesh ref={auraRef} rotation={[Math.PI / 2, 0, 0]} visible={toggles.liquidity}>
        <torusGeometry args={[1.55, 0.07 + frame.liquidity_density_factor * 0.08, 32, 180]} />
        <meshStandardMaterial
          color="#f4e3b2"
          transparent
          opacity={0.24 + frame.liquidity_density_factor * 0.35}
          emissive="#f4e3b2"
          emissiveIntensity={0.18 + frame.liquidity_density_factor * 0.45}
        />
      </mesh>

      <group ref={flowRef}>
        {frame.ask_flow.map((value, laneIdx) => {
          const laneRatio = frame.ask_flow.length <= 1 ? 0.5 : laneIdx / (frame.ask_flow.length - 1);
          const y = (laneRatio - 0.5) * 2.4;
          const askRadius = 0.018 + value * 0.07;
          const bidRadius = 0.018 + (frame.bid_flow[laneIdx] ?? 0) * 0.07;

          return (
            <group key={`lane-${laneIdx}`}>
              <mesh position={[0, y, 0.26]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[askRadius, askRadius, 2.25, 12]} />
                <meshStandardMaterial
                  color="#e76f51"
                  emissive="#e76f51"
                  emissiveIntensity={0.08 + value * 0.35}
                  transparent
                  opacity={toggles.liquidity ? 0.8 : 0.22}
                />
              </mesh>

              <mesh position={[0, y, -0.26]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[bidRadius, bidRadius, 2.25, 12]} />
                <meshStandardMaterial
                  color="#2a9d8f"
                  emissive="#2a9d8f"
                  emissiveIntensity={0.08 + (frame.bid_flow[laneIdx] ?? 0) * 0.35}
                  transparent
                  opacity={toggles.liquidity ? 0.8 : 0.22}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      <instancedMesh ref={bloodMeshRef} args={[null, null, bloodSeeds.length]} visible={toggles.liquidity}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#f4a261"
          emissive="#f4a261"
          emissiveIntensity={0.2 + frame.gamma_metabolism_factor * 0.6}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      <mesh position={[0, 0, 0]} visible={toggles.gamma}>
        <sphereGeometry args={[0.29 + frame.gamma_metabolism_factor * 0.13, 32, 32]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fef3c7"
          emissiveIntensity={0.2 + frame.gamma_metabolism_factor * 1.6}
          transparent
          opacity={0.3 + frame.gamma_metabolism_factor * 0.45}
        />
      </mesh>

      {toggles.manipulation && frame.manipulation_factor > 0.48 ? (
        <mesh position={[0.5, 0.2, 0.62]}>
          <sphereGeometry args={[0.07 + frame.manipulation_factor * 0.12, 12, 12]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.3 + frame.manipulation_factor * 1.1}
            transparent
            opacity={0.22 + frame.manipulation_factor * 0.52}
          />
        </mesh>
      ) : null}

      {toggles.kinetic ? (
        <mesh position={[0, -1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.31 + frame.price_kinetic_factor * 0.42, 64]} />
          <meshStandardMaterial
            color="#264653"
            transparent
            opacity={0.24 + frame.price_kinetic_factor * 0.45}
            emissive="#264653"
            emissiveIntensity={0.15 + frame.price_kinetic_factor * 0.38}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function App() {
  const { payload, error, loading } = useReplayData();

  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [toggles, setToggles] = useState({
    gamma: true,
    manipulation: true,
    liquidity: true,
    kinetic: true,
  });

  const frames = payload?.frames ?? [];
  const frameCount = frames.length;
  const maxPlayhead = Math.max(frameCount - 1, 0);

  useEffect(() => {
    if (playhead > maxPlayhead) {
      setPlayhead(maxPlayhead);
    }
  }, [playhead, maxPlayhead]);

  useEffect(() => {
    if (!isPlaying || frameCount <= 1) {
      return undefined;
    }

    let previous = performance.now();
    let rafId = 0;

    const tick = (now) => {
      const deltaSeconds = (now - previous) / 1000;
      previous = now;

      setPlayhead((prev) => {
        const next = prev + deltaSeconds * speed * 14;
        if (next >= maxPlayhead) {
          return maxPlayhead;
        }
        return next;
      });

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isPlaying, speed, frameCount, maxPlayhead]);

  useEffect(() => {
    if (playhead >= maxPlayhead && frameCount > 0) {
      setIsPlaying(false);
    }
  }, [playhead, maxPlayhead, frameCount]);

  const interpolatedFrame = useMemo(() => {
    if (frameCount === 0) {
      return null;
    }

    const baseIndex = clamp(Math.floor(playhead), 0, maxPlayhead);
    const nextIndex = clamp(baseIndex + 1, 0, maxPlayhead);
    const alpha = clamp(playhead - baseIndex, 0, 1);
    return interpolateFrame(frames[baseIndex], frames[nextIndex], alpha);
  }, [frames, frameCount, maxPlayhead, playhead]);

  if (loading) {
    return (
      <main className="shell shell-center">
        <p className="status">Loading organism replay data...</p>
      </main>
    );
  }

  if (error || !payload || !interpolatedFrame) {
    return (
      <main className="shell shell-center">
        <h1 className="title">Market Organism</h1>
        <p className="status">{error || 'No replay frames found at /public/data/replay_frames.json'}</p>
        <p className="status status-small">Run: <code>python scripts/export_replay_frames.py</code></p>
      </main>
    );
  }

  const currentTimestamp = interpolatedFrame.timestamp ?? 'n/a';
  const organismClock = interpolatedFrame.organism_clock ?? currentTimestamp;

  return (
    <main className="shell">
      <div className="canvas-wrap">
        <Canvas camera={{ position: [0, 0.2, 4.6], fov: 44 }}>
          <color attach="background" args={['#f6efe4']} />
          <ambientLight intensity={0.72} />
          <directionalLight position={[2.8, 2.4, 2.5]} intensity={1.18} color="#ffe7be" />
          <directionalLight position={[-2.2, -1.3, -2.5]} intensity={0.45} color="#a8dadc" />

          <OrganismScene frame={interpolatedFrame} toggles={toggles} />

          <OrbitControls
            enablePan={false}
            minDistance={3.2}
            maxDistance={8}
            maxPolarAngle={Math.PI * 0.75}
            minPolarAngle={Math.PI * 0.25}
          />
        </Canvas>
      </div>

      <section className="hud" aria-label="Replay Controls">
        <h1 className="title">Market Organism Replay</h1>
        <p className="meta">
          state: <strong>{interpolatedFrame.health_state}</strong>
          {' | '}
          health: <strong>{interpolatedFrame.health_score.toFixed(2)}</strong>
        </p>
        <p className="meta">
          timestamp: <strong>{new Date(currentTimestamp).toLocaleString()}</strong>
        </p>
        <p className="meta">
          organism clock: <strong>{new Date(organismClock).toLocaleString()}</strong>
        </p>

        <label className="control" htmlFor="timeline">
          <span>timeline</span>
          <input
            id="timeline"
            type="range"
            min={0}
            max={maxPlayhead}
            step={0.001}
            value={playhead}
            onChange={(event) => {
              setPlayhead(Number(event.target.value));
              setIsPlaying(false);
            }}
          />
        </label>

        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (playhead >= maxPlayhead) {
                setPlayhead(0);
              }
              setIsPlaying((value) => !value);
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setPlayhead(0);
              setIsPlaying(false);
            }}
          >
            Reset
          </button>

          <label className="speed" htmlFor="speed">
            speed
            <select
              id="speed"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
            </select>
          </label>
        </div>

        <div className="toggles" role="group" aria-label="Force Layer Toggles">
          {Object.keys(toggles).map((key) => (
            <label className="toggle" key={key}>
              <input
                type="checkbox"
                checked={toggles[key]}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setToggles((prev) => ({ ...prev, [key]: checked }));
                }}
              />
              {key}
            </label>
          ))}
        </div>

        <p className="caveat">Model-based simulation for visual interpretation, not causal proof.</p>
      </section>
    </main>
  );
}

export default App;
