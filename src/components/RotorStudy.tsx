"use client";

import { useEffect, useRef, useState } from "react";

/** Original rotor geometry inspired by ThreeUI's monochrome wireframe studies. */
export function RotorStudy() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rotation = useRef(0.35);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = canvas.current;
    const context = node?.getContext("2d");
    if (!node || !context) return;
    const ctx: CanvasRenderingContext2D = context;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true,
      frame = 0,
      last = 0,
      angle = rotation.current;
    const draw = () => {
      const rect = node.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width,
        h = rect.height;
      if (
        node.width !== Math.round(w * dpr) ||
        node.height !== Math.round(h * dpr)
      ) {
        node.width = Math.round(w * dpr);
        node.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const color = getComputedStyle(node)
        .getPropertyValue("--blueline")
        .trim();
      const scale = Math.min(w / 390, h / 310);
      function project(x: number, y: number, z: number) {
        const a = x * Math.cos(angle) - z * Math.sin(angle);
        const b = x * Math.sin(angle) + z * Math.cos(angle);
        const c = y * Math.cos(0.94) - b * Math.sin(0.94);
        const depth = y * Math.sin(0.94) + b * Math.cos(0.94);
        const rx = a * Math.cos(-0.38) - c * Math.sin(-0.38);
        const ry = a * Math.sin(-0.38) + c * Math.cos(-0.38);
        return [w / 2 + rx * scale, h / 2 + ry * scale, depth];
      }
      function ring(radius: number, y: number, strong = false) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const t = (i / 100) * Math.PI * 2;
          const [x, py] = project(
            Math.cos(t) * radius,
            y,
            Math.sin(t) * radius,
          );
          if (i === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.globalAlpha = strong ? 0.85 : 0.36;
        ctx.lineWidth = strong ? 1.1 : 0.75;
        ctx.strokeStyle = color;
        ctx.stroke();
      }
      for (let i = 0; i < 11; i++) {
        ring(101, -58 + i * 11.6, i === 0 || i === 10);
        ring(20, -58 + i * 11.6);
      }
      for (let i = 0; i < 12; i++) {
        const t = (i / 12) * Math.PI * 2;
        const [x1, y1] = project(Math.cos(t) * 101, -58, Math.sin(t) * 101);
        const [x2, y2] = project(Math.cos(t) * 101, 58, Math.sin(t) * 101);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.globalAlpha = 0.16;
        ctx.stroke();
      }
      ring(12, -100, true);
      ring(12, 100, true);
      for (const t of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const [x1, y1] = project(Math.cos(t) * 12, -100, Math.sin(t) * 12);
        const [x2, y2] = project(Math.cos(t) * 12, 100, Math.sin(t) * 12);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.globalAlpha = 0.65;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    const tick = (now: number) => {
      if (now - last > 32) {
        angle += 0.003;
        rotation.current = angle;
        draw();
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      draw();
      if (visible && !document.hidden && !paused && !reduced.matches)
        frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(sync);
    resize.observe(node);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(node);
    const palette = new MutationObserver(draw);
    palette.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    setReady(true);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      palette.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  return (
    <figure className="rotor-study">
      <div className="study-topline">
        <span>FIG. 01 / ROTOR STUDY</span>
        <span aria-hidden="true">ISOMETRIC</span>
      </div>
      <div className="rotor-viewport">
        {!ready && (
          <svg
            className="rotor-fallback"
            viewBox="0 0 390 310"
            aria-hidden="true"
          >
            <g
              transform="rotate(-25 195 155)"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              {Array.from({ length: 11 }, (_, i) => (
                <ellipse key={i} cx="195" cy={100 + i * 10} rx="94" ry="37" />
              ))}
              <path d="M195 52v208" strokeDasharray="4 4" />
            </g>
          </svg>
        )}
        <canvas ref={canvas} aria-hidden="true" />
        <span className="study-axis study-axis-x" aria-hidden="true" />
        <span className="study-axis study-axis-y" aria-hidden="true" />
        <span className="study-label study-label-top">Parallel disc array</span>
        <span className="study-label study-label-bottom">
          Boundary-layer principle
        </span>
      </div>
      <figcaption className="study-caption">
        <span>
          Geometry in motion.<small>A study of the bladeless rotor.</small>
        </span>
        <button
          type="button"
          className="icon-button rotor-control"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume rotor rotation" : "Pause rotor rotation"}
          aria-pressed={paused}
        >
          {paused ? "↻" : "Ⅱ"}
        </button>
      </figcaption>
    </figure>
  );
}
