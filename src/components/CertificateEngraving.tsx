"use client";

import { useEffect, useRef } from "react";
import type { Certification } from "@/data/content";

/*
 * Guilloche geometry adapted from ThreeUI's Engraved Certificate (MIT).
 * Copyright (c) 2026 Meng To. See THIRD_PARTY_NOTICES.md.
 * https://github.com/MengTo/threeui/blob/main/src/shaders/neuform-isolated/sources/kinetic-lathe-certificate.html
 * Redrawn only on resize/theme changes; selection motion is a finite CSS animation.
 */
const TAU = Math.PI * 2;
type Point = [number, number];
type RailPoint = [number, number, number, number];

function rectangleOutline(x: number, y: number, w: number, h: number, radius: number): Point[] {
  const points: Point[] = [];
  const corners = [
    [x + w - radius, y + radius, -Math.PI / 2],
    [x + w - radius, y + h - radius, 0],
    [x + radius, y + h - radius, Math.PI / 2],
    [x + radius, y + radius, Math.PI],
  ];
  for (const [cx, cy, start] of corners) {
    for (let step = 0; step <= 12; step++) {
      const angle = start + (step / 12) * Math.PI / 2;
      points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
    }
  }
  return points;
}

function rail(points: Point[], samples: number): RailPoint[] {
  const lengths = new Float64Array(points.length + 1);
  for (let i = 1; i <= points.length; i++) {
    const p = points[i % points.length];
    const previous = points[i - 1];
    lengths[i] = lengths[i - 1] + Math.hypot(p[0] - previous[0], p[1] - previous[1]);
  }
  let segment = 0;
  return Array.from({ length: samples }, (_, index) => {
    const target = index / samples * lengths[points.length];
    while (segment < points.length - 1 && lengths[segment + 1] < target) segment++;
    const length = lengths[segment + 1] - lengths[segment] || 1;
    const ratio = (target - lengths[segment]) / length;
    const p = points[segment];
    const next = points[(segment + 1) % points.length];
    return [p[0] + (next[0] - p[0]) * ratio, p[1] + (next[1] - p[1]) * ratio, (next[1] - p[1]) / length, -(next[0] - p[0]) / length];
  });
}

function drawBand(context: CanvasRenderingContext2D, points: RailPoint[], amplitude: number, waves: number) {
  context.beginPath();
  for (let layer = 0; layer < 9; layer++) {
    const phase = layer / 9 * TAU;
    for (let index = 0; index <= points.length; index++) {
      const point = points[index % points.length];
      const offset = amplitude * Math.sin(waves * index / points.length * TAU + phase);
      const x = point[0] + point[2] * offset;
      const y = point[1] + point[3] * offset;
      if (index) context.lineTo(x, y);
      else context.moveTo(x, y);
    }
  }
  context.stroke();
}

function drawRosette(context: CanvasRenderingContext2D, center: number, radius: number, lobes: number) {
  for (const ring of [{ a: .655, d: .215, n: 38, m: lobes }, { a: .335, d: .115, n: 24, m: lobes + 6 }]) {
    context.beginPath();
    for (let layer = 0; layer < ring.n; layer++) {
      const fraction = layer / ring.n;
      const phase = fraction * TAU;
      const amplitude = radius * ring.a * (1 - .035 * fraction);
      for (let index = 0; index <= 360; index++) {
        const angle = index / 360 * TAU;
        const x = center + amplitude * Math.cos(angle) + radius * ring.d * Math.cos(ring.m * angle + phase);
        const y = center + amplitude * Math.sin(angle) - radius * ring.d * Math.sin(ring.m * angle + phase);
        if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      }
    }
    context.stroke();
  }
}

export function CertificateEngraving({ kind, mark }: { kind: "frame" | "rosette"; mark: Certification["mark"] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    function draw() {
      if (!canvas || !context) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, width, height);
      context.strokeStyle = getComputedStyle(canvas).getPropertyValue("--certificate-etch").trim() || "#827453";
      context.lineWidth = .5;

      if (kind === "frame") {
        context.globalAlpha = .075;
        context.beginPath();
        for (let row = 0; row < height / 7; row++) {
          for (let x = 0; x <= width; x += 7) {
            const phase = row * .44;
            const y = row * 7 + 2.5 * Math.sin(x * .0139 + phase) + 1.5 * Math.sin(x * .0327 - phase * 1.7);
            if (x) context.lineTo(x, y);
            else context.moveTo(x, y);
          }
        }
        context.stroke();
        const inset = width < 400 ? 10 : 14;
        const points = rail(rectangleOutline(inset, inset, width - inset * 2, height - inset * 2, 5), 1500);
        context.globalAlpha = .43;
        drawBand(context, points, 3, Math.round((width + height) / 14));
        context.globalAlpha = .45;
        for (const offset of [-5, 5, 8]) {
          context.beginPath();
          for (let index = 0; index <= points.length; index++) {
            const p = points[index % points.length];
            const x = p[0] + p[2] * offset;
            const y = p[1] + p[3] * offset;
            if (index) context.lineTo(x, y);
            else context.moveTo(x, y);
          }
          context.stroke();
        }
      } else {
        const center = width / 2;
        const radius = Math.min(width, height) / 2;
        const lobes = { dassault: 7, khalifa: 9, colorado: 11, dtu: 13, autodesk: 15, generic: 7 }[mark];
        const circle: Point[] = Array.from({ length: 360 }, (_, i) => [center + radius * .93 * Math.cos(i / 360 * TAU), center + radius * .93 * Math.sin(i / 360 * TAU)]);
        context.globalAlpha = .6;
        drawBand(context, rail(circle, 600), radius * .025, (lobes + 1) * 5);
        context.globalAlpha = .5;
        drawRosette(context, center, radius, lobes);
        for (const size of [.975, .89, .17]) {
          context.beginPath();
          context.arc(center, center, radius * size, 0, TAU);
          context.stroke();
        }
      }
    }

    draw();
    const resize = new ResizeObserver(draw);
    resize.observe(canvas);
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      resize.disconnect();
      theme.disconnect();
    };
  }, [kind, mark]);

  return <canvas ref={canvasRef} className={`certificate-engraving certificate-engraving--${kind}`} aria-hidden="true" />;
}
