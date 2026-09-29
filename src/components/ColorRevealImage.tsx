"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import "./color-reveal.css";

interface ColorRevealImageProps {
  src: string;
  alt: string;
  /** Brush radius in CSS pixels, independent of source resolution. */
  spotlightRadius?: number;
  /** Total lifetime of a stroke, including its final fade. */
  fadeDuration?: number;
  className?: string;
}

type PaintPoint = { x: number; y: number; timestamp: number };
type RevealEngine = {
  paint: (clientX: number, clientY: number) => void;
  revealAll: () => void;
};

/**
 * The original image remains untouched underneath a cached monochrome layer.
 * Painting erases that layer; it never filters or tints the original colors.
 */
export function ColorRevealImage({
  src,
  alt,
  spotlightRadius = 24,
  fadeDuration = 10000,
  className = "",
}: ColorRevealImageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RevealEngine | null>(null);
  const descriptionId = useId();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const host = hostRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!host || !image || !canvas) return;
    setReady(false);
    setStatus("");

    // These three small buffers are allocated once, never inside a paint frame.
    const gray = document.createElement("canvas");
    const mask = document.createElement("canvas");
    const brush = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const grayContext = gray.getContext("2d", { willReadFrequently: true });
    const maskContext = mask.getContext("2d");
    const brushContext = brush.getContext("2d");
    if (!context || !grayContext || !maskContext || !brushContext) return;
    const ctx: CanvasRenderingContext2D = context;
    const grayCtx: CanvasRenderingContext2D = grayContext;
    const maskCtx: CanvasRenderingContext2D = maskContext;
    const brushCtx: CanvasRenderingContext2D = brushContext;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lifetime = Math.max(1000, fadeDuration);
    const holdTime = lifetime * 0.75;
    const radius = Math.max(12, spotlightRadius);
    let width = 0,
      height = 0,
      ratio = 1;
    let initialized = false,
      disposed = false,
      visible = true;
    let frame = 0,
      timer = 0;
    let points: PaintPoint[] = [];
    let fullReveal: number | null = null;

    function stop() {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      timer = 0;
    }

    function opacity(timestamp: number, now: number) {
      const age = now - timestamp;
      if (age >= lifetime) return 0;
      if (reduced.matches || age <= holdTime) return 1;
      const progress = (age - holdTime) / (lifetime - holdTime);
      return 1 - progress * progress * (3 - 2 * progress);
    }

    function render(now: number) {
      points = points.filter((point) => now - point.timestamp < lifetime);
      if (fullReveal !== null && now - fullReveal >= lifetime) {
        fullReveal = null;
        setStatus("");
      }
      maskCtx.clearRect(0, 0, mask.width, mask.height);
      maskCtx.globalCompositeOperation = "source-over";
      if (fullReveal !== null) {
        maskCtx.globalAlpha = opacity(fullReveal, now);
        maskCtx.fillStyle = "#fff";
        maskCtx.fillRect(0, 0, mask.width, mask.height);
      }
      for (const point of points) {
        maskCtx.globalAlpha = opacity(point.timestamp, now);
        maskCtx.drawImage(
          brush,
          point.x * mask.width - brush.width / 2,
          point.y * mask.height - brush.height / 2,
        );
      }
      maskCtx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.drawImage(gray, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(mask, 0, 0);
      ctx.globalCompositeOperation = "source-over";
    }

    function schedule() {
      stop();
      if (!initialized || disposed || !visible || document.hidden) return;
      const now = performance.now();
      render(now);
      const times = points.map((point) => point.timestamp);
      if (fullReveal !== null) times.push(fullReveal);
      if (!times.length) return;
      const nextChange =
        Math.min(...times) + (reduced.matches ? lifetime : holdTime);
      if (now < nextChange) {
        // While strokes hold their original color, no animation frames are needed.
        timer = window.setTimeout(schedule, Math.max(1, nextChange - now));
      } else {
        frame = requestAnimationFrame(schedule);
      }
    }

    function prepare() {
      if (
        disposed ||
        !image!.complete ||
        !image!.naturalWidth ||
        !width ||
        !height
      )
        return;
      try {
        ratio = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.max(1, Math.round(width * ratio));
        const pixelHeight = Math.max(1, Math.round(height * ratio));
        canvas!.width = gray.width = mask.width = pixelWidth;
        canvas!.height = gray.height = mask.height = pixelHeight;
        // Match object-fit: cover and object-position: center on the real image.
        const scale = Math.max(
          width / image!.naturalWidth,
          height / image!.naturalHeight,
        );
        const sourceWidth = width / scale,
          sourceHeight = height / scale;
        grayCtx.drawImage(
          image!,
          (image!.naturalWidth - sourceWidth) / 2,
          (image!.naturalHeight - sourceHeight) / 2,
          sourceWidth,
          sourceHeight,
          0,
          0,
          pixelWidth,
          pixelHeight,
        );
        const pixels = grayCtx.getImageData(0, 0, pixelWidth, pixelHeight);
        for (let i = 0; i < pixels.data.length; i += 4) {
          const luminance = Math.round(
            pixels.data[i] * 0.2126 +
              pixels.data[i + 1] * 0.7152 +
              pixels.data[i + 2] * 0.0722,
          );
          pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = luminance;
        }
        grayCtx.putImageData(pixels, 0, 0);
        brush.width = brush.height = Math.max(1, Math.ceil(radius * ratio * 2));
        const center = brush.width / 2;
        const gradient = brushCtx.createRadialGradient(
          center,
          center,
          center * 0.65,
          center,
          center,
          center,
        );
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(1, "transparent");
        brushCtx.fillStyle = gradient;
        brushCtx.fillRect(0, 0, brush.width, brush.height);
        initialized = true;
        setReady(true);
        schedule();
      } catch {
        // A blocked/tainted canvas leaves the actual, unfiltered image in place.
        initialized = false;
        setReady(false);
        stop();
      }
    }

    function position(clientX: number, clientY: number) {
      // Include ancestor rotation (the portrait frame is slightly tilted), so
      // the brush stays under the pointer instead of using an axis-aligned box.
      let matrix = new DOMMatrix();
      let ancestor: Element | null = host;
      while (ancestor) {
        const transform = getComputedStyle(ancestor).transform;
        if (transform !== "none")
          matrix = new DOMMatrix(transform).multiply(matrix);
        ancestor = ancestor.parentElement;
      }
      const corners = [
        new DOMPoint(0, 0),
        new DOMPoint(width, 0),
        new DOMPoint(0, height),
        new DOMPoint(width, height),
      ].map((point) => point.matrixTransform(matrix));
      const rect = host!.getBoundingClientRect();
      const originX = rect.left - Math.min(...corners.map((point) => point.x));
      const originY = rect.top - Math.min(...corners.map((point) => point.y));
      const local = new DOMPoint(
        clientX - originX,
        clientY - originY,
      ).matrixTransform(matrix.inverse());
      return {
        x: Math.max(0, Math.min(1, local.x / width)),
        y: Math.max(0, Math.min(1, local.y / height)),
      };
    }

    engineRef.current = {
      paint(clientX, clientY) {
        if (!initialized) return;
        const point = position(clientX, clientY);
        const now = performance.now();
        const previous = points[points.length - 1];
        const distance = previous
          ? Math.hypot(
              (point.x - previous.x) * width,
              (point.y - previous.y) * height,
            )
          : Infinity;
        if (
          previous &&
          distance < radius * 0.15 &&
          now - previous.timestamp < 50
        )
          return;
        if (
          previous &&
          now - previous.timestamp < 100 &&
          distance > radius * 0.3
        ) {
          const steps = Math.min(12, Math.ceil(distance / (radius * 0.3)));
          for (let step = 1; step < steps; step++) {
            points.push({
              x: previous.x + ((point.x - previous.x) * step) / steps,
              y: previous.y + ((point.y - previous.y) * step) / steps,
              timestamp: now,
            });
          }
        }
        points.push({ ...point, timestamp: now });
        if (points.length > 256) points.splice(0, points.length - 256);
        schedule();
      },
      revealAll() {
        if (!initialized) return;
        fullReveal = performance.now();
        setStatus(
          `Original colors revealed. They return to black and white in about ${Math.round(lifetime / 1000)} seconds.`,
        );
        schedule();
      },
    };

    const resize = new ResizeObserver(([entry]) => {
      if (
        !entry ||
        (width === entry.contentRect.width &&
          height === entry.contentRect.height)
      )
        return;
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      prepare();
    });
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      schedule();
    });
    intersection.observe(host);
    const onError = () => {
      initialized = false;
      setReady(false);
      stop();
    };
    image.addEventListener("load", prepare);
    image.addEventListener("error", onError);
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", schedule);
    // Cached images may finish before effects subscribe to the load event.
    const computed = getComputedStyle(host);
    width = parseFloat(computed.width);
    height = parseFloat(computed.height);
    if (image.complete && image.naturalWidth) prepare();

    return () => {
      disposed = true;
      stop();
      engineRef.current = null;
      image.removeEventListener("load", prepare);
      image.removeEventListener("error", onError);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, [src, spotlightRadius, fadeDuration]);

  return (
    <div className="color-reveal" data-ready={ready}>
      <div
        ref={hostRef}
        className={`color-reveal__viewport ${className}`}
        onPointerDown={(event) => {
          if (!ready) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          engineRef.current?.paint(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || event.buttons !== 0)
            engineRef.current?.paint(event.clientX, event.clientY);
        }}
      >
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 78vw, 300px"
          draggable={false}
          className="color-reveal__original"
        />
        <canvas
          ref={canvasRef}
          className="color-reveal__monochrome"
          aria-hidden="true"
        />
      </div>
      <div className="color-reveal__controls">
        <span aria-hidden="true">Draw to reveal color</span>
        <button
          type="button"
          disabled={!ready}
          onClick={() => engineRef.current?.revealAll()}
          aria-label="Reveal original photo colors"
          aria-describedby={descriptionId}
        >
          Reveal all <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="sr-only" id={descriptionId}>
        Draw over the photo with a pointer or touch, or use this button to
        reveal all its original colors. Color fades back to black and white
        after about {Math.round(fadeDuration / 1000)} seconds.
      </p>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
