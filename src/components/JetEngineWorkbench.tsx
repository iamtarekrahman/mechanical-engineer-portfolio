"use client";

import { MutableRefObject, useEffect, useId, useRef, useState } from "react";
import { Modal } from "./Modal";
import { ENGINE_PARTS } from "./jet-engine-parts";
import type {
  EngineCamera,
  EngineOptions,
  EngineScene,
} from "./jet-engine-scene";
import styles from "./JetEngineWorkbench.module.css";

function ToolIcon({
  name,
}: {
  name: "orbit" | "pan" | "wire" | "labels" | "fit" | "expand";
}) {
  const paths = {
    orbit: (
      <>
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-35 12 12)" />
        <ellipse cx="12" cy="12" rx="4" ry="9" transform="rotate(-35 12 12)" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
    pan: (
      <>
        <path d="M12 3v18M3 12h18M9 6l3-3 3 3M18 9l3 3-3 3M9 18l3 3 3-3M6 9l-3 3 3 3" />
      </>
    ),
    wire: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M12 2v10M3 17l9-5 9 5" />
      </>
    ),
    labels: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    fit: (
      <>
        <path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    expand: (
      <>
        <path d="M14 3h7v7M21 3l-8 8M10 21H3v-7M3 21l8-8" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function EngineDrawing({ explode }: { explode: number }) {
  const gap = explode / 100;
  return (
    <svg
      className={styles.fallbackDrawing}
      viewBox="0 0 560 300"
      role="img"
      aria-label="Cutaway jet engine assembly drawing"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M25 150h510" strokeDasharray="5 6" opacity=".35" />
        <g transform={`translate(${-gap * 35} 0)`}>
          <ellipse cx="140" cy="150" rx="38" ry="77" />
          <ellipse cx="140" cy="150" rx="11" ry="23" />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i * Math.PI) / 9;
            return (
              <path
                key={i}
                d={`M${140 + Math.cos(a) * 11} ${150 + Math.sin(a) * 23} Q${140 + Math.cos(a + 0.24) * 24} ${150 + Math.sin(a + 0.24) * 53} ${140 + Math.cos(a + 0.1) * 38} ${150 + Math.sin(a + 0.1) * 77}`}
              />
            );
          })}
        </g>
        <g transform={`translate(${-gap * 5} 0)`}>
          {[0, 1, 2, 3].map((i) => (
            <ellipse
              key={i}
              cx={205 + i * 20}
              cy="150"
              rx="17"
              ry={47 - i * 4}
            />
          ))}
          <path d="M205 103l60 12M205 197l60-12" />
        </g>
        <g transform={`translate(${gap * 20} 0)`}>
          <path d="M288 117h54v66h-54zM288 132h54M288 169h54" />
          <ellipse cx="288" cy="150" rx="12" ry="33" />
          <ellipse cx="342" cy="150" rx="12" ry="33" />
        </g>
        <g transform={`translate(${gap * 45} 0)`}>
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={373 + i * 12}
              cy="150"
              rx="13"
              ry={36 - i * 3}
            />
          ))}
        </g>
        <g transform={`translate(${gap * 60} 0)`}>
          <path d="M423 119l32 14v34l-32 14M423 139l25 11-25 11" />
          <ellipse cx="423" cy="150" rx="12" ry="31" />
        </g>
        <path
          d={`M150 ${68 + gap * 145} Q230 ${40 + gap * 145} 345 ${80 + gap * 145} L405 ${101 + gap * 145} M155 ${63 + gap * 145} Q240 ${38 + gap * 145} 347 ${73 + gap * 145}`}
          strokeDasharray="4 3"
        />
      </g>
    </svg>
  );
}

type PanelProps = {
  options: EngineOptions;
  update: (next: Partial<EngineOptions>) => void;
  api: MutableRefObject<EngineScene | null>;
  camera: MutableRefObject<EngineCamera | null>;
  expanded?: boolean;
  suspended?: boolean;
  onExpand?: () => void;
};

function EngineStage({
  options,
  api,
  camera,
  onSelect,
  onStatus,
  allowOverflow,
}: {
  options: EngineOptions;
  api: MutableRefObject<EngineScene | null>;
  camera: MutableRefObject<EngineCamera | null>;
  onSelect: (id: string) => void;
  onStatus: (status: "loading" | "ready" | "fallback") => void;
  allowOverflow: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const input = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const latest = useRef({ options, onSelect, onStatus });
  latest.current = { options, onSelect, onStatus };
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const part =
    ENGINE_PARTS.find((p) => p.id === options.selected) ?? ENGINE_PARTS[0];
  useEffect(() => {
    const node = canvas.current;
    const surface = input.current;
    if (!node || !surface || !label.current) return;
    let stopped = false;
    let started = false;
    let scene: EngineScene | null = null;
    const set = (value: typeof status) => {
      if (!stopped) {
        setStatus(value);
        latest.current.onStatus(value);
      }
    };
    set("loading");
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        try {
          const { createEngineScene } = await import("./jet-engine-scene");
          if (stopped || !label.current) return;
          scene = createEngineScene(
            node,
            surface,
            label.current,
            latest.current.options,
            camera.current,
            (id) => latest.current.onSelect(id),
            () => set("fallback"),
            allowOverflow,
          );
          api.current = scene;
          set("ready");
        } catch {
          set("fallback");
        }
      },
      { rootMargin: "160px" },
    );
    observer.observe(surface);
    return () => {
      stopped = true;
      observer.disconnect();
      if (scene) {
        camera.current = scene.getCamera();
        scene.dispose();
        if (api.current === scene) api.current = null;
      }
    };
  }, [api, camera, attempt, allowOverflow]);
  useEffect(() => {
    api.current?.setOptions(options);
  }, [options, api]);

  return (
    <div
      className={styles.stage}
      data-engine-status={status}
      data-engine-overflow={allowOverflow}
      data-mode={options.mode}
    >
      {status !== "ready" && <EngineDrawing explode={options.explode} />}
      <canvas
        key={attempt}
        ref={canvas}
        className={styles.canvas}
        data-engine-canvas
        aria-hidden="true"
        hidden={status === "fallback"}
      />
      <div
        ref={input}
        className={styles.interactionSurface}
        data-engine-input
        tabIndex={status === "ready" ? 0 : -1}
        aria-label="Interactive jet engine. Drag within the drawing area to explore. Arrow keys rotate, plus and minus zoom, zero resets the view."
        role="img"
        aria-hidden={status !== "ready"}
        onKeyDown={(event) => {
          const keys: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
          };
          if (keys[event.key]) {
            event.preventDefault();
            api.current?.nudge(...keys[event.key]);
          } else if (["+", "=", "-", "0"].includes(event.key)) {
            event.preventDefault();
            if (event.key === "0") api.current?.reset();
            else api.current?.zoom(event.key === "-" ? -1 : 1);
          }
        }}
      />
      <span
        ref={label}
        className={styles.partLabel}
        aria-hidden="true"
        hidden={status !== "ready" || !options.showLabels}
      >
        <i />
        {part.shortName}
      </span>
      <span className={styles.stageBadge}>
        CUTAWAY / {options.wireframe ? "WIREFRAME" : "SOLID"}
      </span>
      {status === "ready" && (
        <div className={styles.zoomTools}>
          <button
            type="button"
            onClick={() => api.current?.zoom(1)}
            aria-label="Zoom in on engine"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => api.current?.zoom(-1)}
            aria-label="Zoom out of engine"
          >
            −
          </button>
        </div>
      )}
      {status === "loading" && (
        <span className={styles.loading} role="status">
          Preparing the assembly…
        </span>
      )}
      {status === "fallback" && (
        <div className={styles.fallbackMessage} role="status">
          3D is unavailable here. Explore the assembly drawing and parts below.
          <button type="button" onClick={() => setAttempt((n) => n + 1)}>
            Retry 3D
          </button>
        </div>
      )}
    </div>
  );
}

function EnginePanel({
  options,
  update,
  api,
  camera,
  expanded = false,
  suspended = false,
  onExpand,
}: PanelProps) {
  const id = useId();
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const partIndex = ENGINE_PARTS.findIndex((p) => p.id === options.selected);
  const part = ENGINE_PARTS[partIndex] ?? ENGINE_PARTS[0];
  const unavailable = status !== "ready";
  return (
    <div className={`${styles.panel} ${expanded ? styles.expanded : ""}`}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>FIG. 01 / INTERACTIVE ASSEMBLY</span>
          <h2>Inside the engine.</h2>
        </div>
        <span className={styles.liveMark}>
          <i />
          {status === "ready" ? "3D" : "STUDY"}
        </span>
      </div>
      <div
        className={styles.toolbar}
        role="group"
        aria-label="Engine viewing tools"
      >
        <button
          type="button"
          aria-pressed={options.mode === "orbit"}
          disabled={unavailable}
          onClick={() => update({ mode: "orbit" })}
        >
          <ToolIcon name="orbit" />
          Orbit
        </button>
        <button
          type="button"
          aria-pressed={options.mode === "pan"}
          disabled={unavailable}
          onClick={() => update({ mode: "pan" })}
        >
          <ToolIcon name="pan" />
          Pan
        </button>
        <button
          type="button"
          aria-pressed={options.wireframe}
          disabled={unavailable}
          onClick={() => update({ wireframe: !options.wireframe })}
        >
          <ToolIcon name="wire" />
          Wire
        </button>
        <button
          type="button"
          aria-pressed={options.showLabels}
          title={options.showLabels ? "Hide part labels" : "Show part labels"}
          disabled={unavailable}
          onClick={() => update({ showLabels: !options.showLabels })}
        >
          <ToolIcon name="labels" />
          Labels
        </button>
        <button
          type="button"
          disabled={unavailable}
          onClick={() => api.current?.reset()}
        >
          <ToolIcon name="fit" />
          Fit
        </button>
        {onExpand && (
          <button
            type="button"
            className={styles.expandTool}
            onClick={onExpand}
            aria-label="Expand jet engine workbench"
          >
            <ToolIcon name="expand" />
            <span>Expand</span>
          </button>
        )}
      </div>
      {suspended ? (
        <div className={styles.stage}>
          <EngineDrawing explode={options.explode} />
        </div>
      ) : (
        <EngineStage
          options={options}
          api={api}
          camera={camera}
          onSelect={(selected) => update({ selected })}
          onStatus={setStatus}
          allowOverflow={!expanded}
        />
      )}
      <div className={styles.viewRow}>
        <p>
          {status === "ready"
            ? "Drag to explore · scroll to zoom"
            : "A conceptual turbofan study"}
        </p>
        <div role="group" aria-label="Engine view presets">
          <button
            type="button"
            disabled={unavailable}
            onClick={() => api.current?.reset("front")}
          >
            Front
          </button>
          <button
            type="button"
            disabled={unavailable}
            onClick={() => api.current?.reset("side")}
          >
            Side
          </button>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.explosionHeading}>
          <label htmlFor={`${id}-explode`}>
            Assembly separation <output>{options.explode}%</output>
          </label>
          <button
            type="button"
            onClick={() => update({ explode: options.explode > 0 ? 0 : 100 })}
          >
            {options.explode > 0 ? "Reassemble" : "Explode"}
            <span aria-hidden="true">{options.explode > 0 ? "↙" : "↗"}</span>
          </button>
        </div>
        <input
          id={`${id}-explode`}
          className={styles.slider}
          type="range"
          min="0"
          max="100"
          step="1"
          value={options.explode}
          aria-valuetext={`${options.explode} percent separated`}
          onChange={(event) => update({ explode: Number(event.target.value) })}
        />
        <div className={styles.explosionHeading}>
          <label htmlFor={`${id}-speed`}>
            Blade speed <output>{options.speed}×</output>
          </label>
          <button
            type="button"
            disabled={unavailable}
            aria-label={
              options.spinning ? "Pause blade rotation" : "Start blade rotation"
            }
            onClick={() =>
              update({ spinning: !options.spinning, speed: options.speed || 1 })
            }
          >
            {options.spinning ? "Pause" : "Play"}
            <span aria-hidden="true">{options.spinning ? "Ⅱ" : "▷"}</span>
          </button>
        </div>
        <input
          id={`${id}-speed`}
          className={styles.slider}
          type="range"
          min="0"
          max="3"
          step="0.25"
          disabled={unavailable}
          value={options.speed}
          aria-valuetext={`${options.speed} times speed${options.spinning ? "" : ", paused"}`}
          onChange={(event) => {
            const speed = Number(event.target.value);
            update({ speed, spinning: speed > 0 });
          }}
        />
        <div
          className={styles.partList}
          role="group"
          aria-label="Select an engine part"
        >
          {ENGINE_PARTS.map((p, index) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === options.selected}
              onClick={() => update({ selected: p.id })}
            >
              <span>0{index + 1}</span>
              {p.shortName}
            </button>
          ))}
        </div>
        <div className={styles.partInfo} aria-live="polite" aria-atomic="true">
          <span className={styles.partNumber}>0{partIndex + 1}</span>
          <div>
            <h3>{part.name}</h3>
            <p>{part.description}</p>
          </div>
        </div>
        <details className={styles.help}>
          <summary>
            Workbench guide <span aria-hidden="true">+</span>
          </summary>
          <p>
            Choose a part to highlight it. Drag within the drawing area to orbit,
            or choose Pan to move the assembly. Pinch or scroll there to zoom.
            With the model focused, use arrow keys to rotate, + / − to zoom, and
            0 to fit. The slider
            separates the six groups and lowers the casing; Reassemble brings
            them home. Blade speed controls the fan, compressor, and turbine
            rotors. Pause holds their position while you inspect the assembly.
            Use Labels to show or hide the floating part names.
          </p>
          <p>
            Original illustrative geometry. This is a study of an engine’s
            architecture.
          </p>
        </details>
      </div>
    </div>
  );
}

export function JetEngineWorkbench() {
  const [options, setOptions] = useState<EngineOptions>({
    explode: 0,
    selected: "fan",
    wireframe: false,
    showLabels: false,
    mode: "orbit",
    speed: 1,
    spinning: true,
  });
  const [expanded, setExpanded] = useState(false);
  const api = useRef<EngineScene | null>(null);
  const camera = useRef<EngineCamera | null>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduced.matches)
        setOptions((previous) => ({ ...previous, spinning: false }));
    };
    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);
  const update = (next: Partial<EngineOptions>) =>
    setOptions((previous) => ({ ...previous, ...next }));
  const setExpansion = (next: boolean) => {
    if (api.current) camera.current = api.current.getCamera();
    setExpanded(next);
  };
  const props = { options, update, api, camera };
  return (
    <>
      <EnginePanel
        {...props}
        suspended={expanded}
        onExpand={() => setExpansion(true)}
      />
      <Modal
        open={expanded}
        onClose={() => setExpansion(false)}
        title="Jet engine workbench"
        className={styles.modal}
      >
        <EnginePanel {...props} expanded />
      </Modal>
    </>
  );
}
