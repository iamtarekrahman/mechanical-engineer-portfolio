"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { createEnergyScene } from "./energy-scene";
import { batteryStatus, energyIsChanging, initialEnergyState, stepEnergy, type EnergyControls } from "./energy-simulation";
import styles from "./EnergyGarden.module.css";

const ELIGIBLE = "(min-width: 1024px) and (any-pointer: fine), (orientation: landscape)";

function EnergyIcon({ type }: { type: "wind" | "light" | "fan" | "battery" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {type === "wind" && <><path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h5a3 3 0 1 1-3 3" /></>}
      {type === "light" && <><path d="M8 16c0-2-3-3-3-7a7 7 0 0 1 14 0c0 4-3 5-3 7M8 17h8M9 20h6M11 23h2" /><path d="M10 9l2 3 2-3M12 12v5" /></>}
      {type === "fan" && <><circle cx="12" cy="12" r="2" /><path d="M10 10C2 11 3 2 8 3c3 0 3 3 3 6M14 10c-1-8 8-7 7-2 0 3-3 3-6 3M14 14c8-1 7 8 2 7-3 0-3-3-3-6M10 14c1 8-8 7-7 2 0-3 3-3 6-3" /></>}
      {type === "battery" && <><rect x="2" y="6" width="18" height="12" rx="2" /><path d="M22 10v4M11 8l-3 5h5l-2 3" /></>}
    </svg>
  );
}

/** The illustration also keeps the energy controls useful without WebGL. */
function EnergyDrawing({ solar, wind, lit, fan, charge, dark }: {
  solar?: boolean; wind: number; lit: boolean; fan: boolean; charge: number; dark: boolean;
}) {
  return (
    <svg className={styles.fallback} viewBox="0 0 250 300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <ellipse cx="126" cy="263" rx="104" ry="15" fill="var(--blueline)" opacity="0.06" stroke="none" />
      {solar ? <>
        {dark ? <path d="M188 29a23 23 0 1 0 22 32 21 21 0 0 1-22-32Z" fill="var(--brass)" stroke="none" /> : <><circle cx="195" cy="48" r="19" fill="var(--brass)" stroke="none" />{Array.from({ length: 8 }, (_, i) => <path key={i} d="M195 19v-6" transform={`rotate(${i * 45} 195 48)`} />)}</>}
        <path d="M49 261V120l105-18 50 27v132M49 183l105-11 50 18M154 102v159M42 120l111-21 58 29" fill="var(--surface)" />
        <path d="m66 109 14-32 106 4-13 32Z" fill="var(--blueline)" />
        <path d="m74 94 106 3M105 78l-11 33M133 79l-10 33M161 80l-10 33" stroke="var(--paper)" opacity="0.5" />
        <path d="M65 139l69-11v37l-69 8ZM65 199l69-7v44l-69 4Z" fill={lit ? "#eac177" : "var(--hairline)"} />
        <g transform="translate(100 151)"><circle r="3" fill="currentColor" /><g className={fan ? styles.drawingFan : undefined}><path d="M-2-2C-19 0-13-18-7-12L0-3M2-2C0-19 18-13 12-7L3 0M2 2C19 0 13 18 7 12L0 3M-2 2C0 19-18 13-12 7L-3 0" fill="var(--graphite)" /></g></g>
        <path d="M169 206h20v55h-20Z" fill="var(--blueline)" />
        <rect x="207" y="222" width="25" height="39" rx="3" fill="var(--surface)" />
        <rect x="212" y={254 - charge * 25} width="15" height={Math.max(0.5, charge * 25)} fill="var(--blueline)" stroke="none" />
        <path d="M212 222v-5h15v5M205 249h-9V125" />
      </> : <>
        <path d="m76 254 4-153h7l5 153Z" fill="var(--surface)" />
        <g transform="translate(83 94)"><g className={wind > 0.005 ? styles.drawingRotor : undefined} style={{ animationDuration: `${Math.max(0.65, 3 / Math.max(wind, 0.01))}s` }}><path d="M-4-5C-8-24-3-56 0-72L6-67 8-13 3-3ZM-3 5C-16 20-45 32-61 37l-1-8 43-32 15-1ZM6 1c20 0 44 22 57 35l-6 4-50-20-7-9Z" fill="var(--surface)" /></g><circle r="8" fill="var(--brass)" /></g>
        <path d="M122 250v-63l46-29 45 29v63Z" fill="var(--surface)" />
        <path d="m115 190 53-38 53 38-7 8-46-31-46 31Z" fill="var(--blueline)" />
        <path d="M133 207h22v23h-22ZM180 207h22v23h-22Z" fill={`rgba(235,180,77,${0.08 + wind * 0.92})`} />
        <path d="M162 222h12v28M143 207v23M191 207v23M83 257h40v-8" />
        <path d="M69 258h33" strokeWidth="5" />
      </>}
      <path d="M30 268h197" opacity="0.4" />
    </svg>
  );
}

export function EnergyGarden() {
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState({ wind: false, solar: false });
  const [renderer, setRenderer] = useState<"loading" | "webgl" | "fallback">("loading");
  const [blowing, setBlowing] = useState(false);
  const [lights, setLights] = useState(false);
  const [fan, setFan] = useState(false);
  const [view, setView] = useState({ wind: 0, battery: 0.62, dark: false, status: "Charging" });
  const canvas = useRef<HTMLCanvasElement>(null);
  const windViewport = useRef<HTMLDivElement>(null);
  const solarViewport = useRef<HTMLDivElement>(null);
  const windReveal = useRef<HTMLButtonElement>(null);
  const solarReveal = useRef<HTMLButtonElement>(null);
  const revealed = useRef(open);
  const scrollToProject = useRef<"wind" | "solar" | null>(null);
  const state = useRef(initialEnergyState());
  const controls = useRef<EnergyControls>({ blowing: false, lights: false, fan: false, dark: false, reducedMotion: false });
  const wake = useRef<() => void>(() => {});
  const refresh = useRef<() => void>(() => {});

  useEffect(() => {
    const query = window.matchMedia(ELIGIBLE);
    const sync = () => setEligible(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!eligible || !canvas.current || !windViewport.current || !solarViewport.current) return;
    let disposed = false;
    let scene: ReturnType<typeof createEnergyScene> | null = null;
    let loading = false;
    let frame = 0;
    let previous = 0;
    let published = 0;
    const visible = new Set<Element>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const surface = canvas.current;
    const windBox = windViewport.current;
    const solarBox = solarViewport.current;
    setRenderer("loading");
    setBlowing(false);

    function activity() {
      return {
        wind: revealed.current.wind && visible.has(windBox),
        solar: revealed.current.solar && visible.has(solarBox),
      };
    }
    function publish() {
      if (!disposed) setView({ wind: state.current.wind, battery: state.current.battery,
        dark: controls.current.dark, status: batteryStatus(state.current, controls.current) });
    }
    function render() {
      const powered = !controls.current.dark || state.current.battery > 0;
      scene?.render({ ...state.current, dark: controls.current.dark,
        reducedMotion: controls.current.reducedMotion,
        lightsOn: controls.current.lights && powered, fanOn: controls.current.fan && powered });
    }
    function tick(now: number) {
      frame = 0;
      const active = activity();
      if (disposed || (!active.wind && !active.solar) || document.hidden) return;
      if (now - previous < 1000 / 30) { frame = requestAnimationFrame(tick); return; }
      state.current = stepEnergy(state.current, controls.current, (now - previous) / 1000, active);
      previous = now;
      render();
      const changing = energyIsChanging(state.current, controls.current, active);
      if (now - published > 120 || !changing) { publish(); published = now; }
      if (changing) frame = requestAnimationFrame(tick);
    }
    function requestFrame() {
      const active = activity();
      if (disposed || (!active.wind && !active.solar) || document.hidden) return;
      if (!frame) { previous = performance.now() - 34; frame = requestAnimationFrame(tick); }
      if (!loading) {
        loading = true;
        void import("./energy-scene").then(({ createEnergyScene: create }) => {
          if (disposed) return;
          let failed = false;
          scene = create(surface, windBox, solarBox, () => {
            failed = true;
            if (!disposed) setRenderer("fallback");
          });
          if (!failed) setRenderer("webgl");
          requestFrame();
        }).catch(() => { if (!disposed) setRenderer("fallback"); });
      }
    }
    wake.current = requestFrame;
    // A hidden viewport must also be erased from the shared canvas. This runs
    // after React commits disclosure changes, even when the simulation is idle.
    refresh.current = () => {
      render();
      const active = activity();
      if (!active.wind && !active.solar) { cancelAnimationFrame(frame); frame = 0; }
      else requestFrame();
    };
    function syncTheme() {
      controls.current.dark = document.documentElement.dataset.theme === "dark";
      publish();
      requestFrame();
    }
    function syncReduced() { controls.current.reducedMotion = reduced.matches; requestFrame(); }
    function stopBlowing() {
      controls.current.blowing = false;
      if (!disposed) setBlowing(false);
      requestFrame();
    }
    function visibilityChanged() {
      if (document.hidden) {
        stopBlowing();
        cancelAnimationFrame(frame);
        frame = 0;
      } else requestFrame();
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
      const active = activity();
      if (!active.wind) stopBlowing();
      if (active.wind || active.solar) requestFrame();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(windBox);
    observer.observe(solarBox);
    const theme = new MutationObserver(syncTheme);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const resize = new ResizeObserver(() => { scene?.resize(); requestFrame(); });
    resize.observe(surface);
    resize.observe(windBox);
    resize.observe(solarBox);
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("blur", stopBlowing);
    window.addEventListener("pointerup", stopBlowing);
    window.addEventListener("pointercancel", stopBlowing);
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame);
    reduced.addEventListener("change", syncReduced);
    syncReduced();
    syncTheme();
    return () => {
      disposed = true;
      controls.current.blowing = false;
      wake.current = () => {};
      refresh.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      theme.disconnect();
      scene?.dispose();
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("blur", stopBlowing);
      window.removeEventListener("pointerup", stopBlowing);
      window.removeEventListener("pointercancel", stopBlowing);
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", requestFrame);
      reduced.removeEventListener("change", syncReduced);
    };
  }, [eligible]);

  useEffect(() => {
    refresh.current();
    const kind = scrollToProject.current;
    scrollToProject.current = null;
    const garden = canvas.current?.parentElement;
    // Compact layouts keep the expanded models below the hero. An edge tab can
    // be opened from any scroll position, so bring its controls into view.
    if (kind && garden && getComputedStyle(garden).position !== "fixed") {
      (kind === "wind" ? windReveal : solarReveal).current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    }
  }, [open.wind, open.solar]);

  function toggleProject(kind: "wind" | "solar") {
    const next = { ...revealed.current, [kind]: !revealed.current[kind] };
    revealed.current = next;
    scrollToProject.current = next[kind] ? kind : null;
    if (kind === "wind" && !next.wind) {
      controls.current.blowing = false;
      setBlowing(false);
    }
    // The disclosure button stays mounted and visible in both states, so Escape
    // can return focus before hiding the scene's controls.
    if (!next[kind]) (kind === "wind" ? windReveal : solarReveal).current?.focus({ preventScroll: true });
    setOpen(next);
  }

  function blow(active: boolean) {
    controls.current.blowing = active;
    setBlowing(active);
    wake.current();
  }
  function toggle(kind: "lights" | "fan") {
    controls.current[kind] = !controls.current[kind];
    (kind === "lights" ? setLights : setFan)(controls.current[kind]);
    wake.current();
  }

  if (!eligible) return null;
  const power = Math.round(view.wind * 100);
  const charge = view.battery <= 0 ? 0 : view.battery >= 1 ? 100 : Math.max(1, Math.min(99, Math.round(view.battery * 100)));
  const powered = !view.dark || view.battery > 0;
  const anyOpen = open.wind || open.solar;

  return (
    <section className={styles.garden} aria-label="Interactive renewable energy models" data-energy-open={anyOpen} data-energy-renderer={renderer} data-energy-theme={view.dark ? "dark" : "light"}>
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" hidden={!anyOpen} />
      <aside className={`${styles.panel} ${styles.windPanel}`} aria-label="Wind energy project" data-open={open.wind} data-highlight-scope="wind-energy"
        onKeyDown={event => { if (event.key === "Escape" && open.wind) { event.preventDefault(); event.stopPropagation(); toggleProject("wind"); } }}>
        <button ref={windReveal} type="button" className={styles.reveal} aria-expanded={open.wind} aria-controls="wind-energy-content"
          aria-label={`${open.wind ? "Hide project" : "Reveal a cool project"}: wind energy`} onClick={() => toggleProject("wind")}>
          <span className={styles.revealIcon}><EnergyIcon type="wind" /></span>
          <span className={styles.revealCopy}><span>WIND ENERGY</span><strong>{open.wind ? "Hide project" : "Reveal a cool project"}</strong></span>
          <span className={styles.revealMark} aria-hidden="true">{open.wind ? "−" : "+"}</span>
        </button>
        <div id="wind-energy-content" className={styles.content} hidden={!open.wind}>
        <header className={styles.heading}>
          <span className={styles.overline}><i /> 01 / WIND ENERGY</span>
          <h2 id="wind-energy-title">From wind to light.</h2>
        </header>
        <div ref={windViewport} className={styles.stage} role="img" aria-label={`Wind turbine connected to a cottage. Power output ${power} percent.`}>
          <EnergyDrawing wind={view.wind} lit={power > 0} fan={false} charge={0} dark={view.dark} />
        </div>
        <div className={styles.controls}>
          <div className={styles.readout}><span>POWER OUTPUT</span><output aria-live="off">{power}<small>%</small></output></div>
          <div className={styles.meter} role="meter" aria-label="Wind power" aria-valuemin={0} aria-valuemax={100} aria-valuenow={power}>
            <span style={{ "--fill": `${power}%` } as CSSProperties} />
          </div>
          <button className={styles.blow} type="button" aria-pressed={blowing} aria-describedby="wind-instructions"
            onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); event.currentTarget.setPointerCapture(event.pointerId); blow(true); }}
            onPointerUp={() => blow(false)} onPointerCancel={() => blow(false)} onLostPointerCapture={() => blow(false)} onBlur={() => blow(false)}
            onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); if (!event.repeat) blow(true); } }}
            onKeyUp={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); blow(false); } }}>
            <EnergyIcon type="wind" /><span>{blowing ? "Blowing…" : "Hold to blow"}</span><span className={styles.buttonArrow} aria-hidden="true">↗</span>
          </button>
          <p id="wind-instructions" className={styles.hint}>Hold to make wind. Release to coast.</p>
        </div>
        </div>
      </aside>
      <aside className={`${styles.panel} ${styles.solarPanel}`} aria-label="Solar energy project" data-open={open.solar} data-highlight-scope="solar-energy"
        onKeyDown={event => { if (event.key === "Escape" && open.solar) { event.preventDefault(); event.stopPropagation(); toggleProject("solar"); } }}>
        <button ref={solarReveal} type="button" className={styles.reveal} aria-expanded={open.solar} aria-controls="solar-energy-content"
          aria-label={`${open.solar ? "Hide project" : "Reveal a cool project"}: solar energy`} onClick={() => toggleProject("solar")}>
          <span className={styles.revealIcon}><EnergyIcon type="battery" /></span>
          <span className={styles.revealCopy}><span>SOLAR ENERGY</span><strong>{open.solar ? "Hide project" : "Reveal a cool project"}</strong></span>
          <span className={styles.revealMark} aria-hidden="true">{open.solar ? "−" : "+"}</span>
        </button>
        <div id="solar-energy-content" className={styles.content} hidden={!open.solar}>
        <header className={styles.heading}>
          <span className={styles.overline}><i /> 02 / SOLAR ENERGY</span>
          <h2 id="solar-energy-title">Sunlight, saved.</h2>
        </header>
        <div ref={solarViewport} className={styles.stage} role="img" aria-label={`Two-storey solar home with ${view.dark ? "moon" : "sun"}. Lights ${lights && powered ? "on" : "off"}, fan ${fan && powered ? "on" : "off"}.`}>
          <EnergyDrawing solar wind={0} lit={lights && powered} fan={fan && powered} charge={view.battery} dark={view.dark} />
          <span className={styles.dayLabel}>{view.dark ? "MOONLIT / BATTERY SUPPLY" : "DAYLIGHT / SOLAR SUPPLY"}</span>
        </div>
        <div className={styles.controls}>
          <div className={styles.batteryReadout}>
            <span className={styles.batteryIcon} style={{ "--charge": `${charge}%` } as CSSProperties} aria-hidden="true"><i /></span>
            <div><span className={styles.batteryStatus} role="status">{view.status}</span><span className={styles.batteryCaption}>BATTERY RESERVE</span></div>
            <output aria-label="Battery charge" aria-live="off">{charge}<small>%</small></output>
          </div>
          <div className={styles.switches}>
            <button type="button" role="switch" aria-checked={lights} aria-label="Building lights" onClick={() => toggle("lights")}><EnergyIcon type="light" /><span>Lights</span><i className={styles.switchTrack} aria-hidden="true" /></button>
            <button type="button" role="switch" aria-checked={fan} aria-label="Building fan" onClick={() => toggle("fan")}><EnergyIcon type="fan" /><span>Fan</span><i className={styles.switchTrack} aria-hidden="true" /></button>
          </div>
          <p className={styles.hint}>{powered ? "Change the theme. Watch the energy flow." : "Battery empty. Switch to light mode to recharge."}</p>
        </div>
        </div>
      </aside>
      <span className={styles.simulationNote} hidden={!anyOpen}>INTERACTIVE ENERGY STUDY · SIMULATION</span>
    </section>
  );
}
