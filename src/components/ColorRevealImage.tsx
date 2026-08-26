"use client";

import { useEffect, useRef, useState } from "react";

interface ColorRevealImageProps {
  src: string;
  alt: string;
  spotlightRadius?: number;
  fadeDuration?: number; // in milliseconds
  className?: string;
}

interface PaintPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function ColorRevealImage({
  src,
  alt,
  spotlightRadius = 120,
  fadeDuration = 10000, // 10 seconds
  className = "",
}: ColorRevealImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const paintPointsRef = useRef<PaintPoint[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number>();
  const lastPaintTimeRef = useRef<number>(0);

  // Load images
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
    };

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [src]);

  // Animation loop
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    const img = imageRef.current;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    const animate = () => {
      const now = Date.now();

      // Remove points older than fadeDuration
      paintPointsRef.current = paintPointsRef.current.filter(
        (point) => now - point.timestamp < fadeDuration
      );

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grayscale base
      ctx.filter = "grayscale(100%)";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      // Draw color spotlights for each paint point
      if (paintPointsRef.current.length > 0) {
        // Draw color image first
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        // Create a mask canvas for all spotlights
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');

        if (maskCtx) {
          // Draw all spotlights on mask
          paintPointsRef.current.forEach((point) => {
            const age = now - point.timestamp;
            const fadeProgress = age / fadeDuration; // 0 to 1
            const opacity = 1 - fadeProgress; // 1 to 0

            // Create radial gradient for soft edge
            const gradient = maskCtx.createRadialGradient(
              point.x,
              point.y,
              0,
              point.x,
              point.y,
              spotlightRadius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.5})`);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

            maskCtx.globalCompositeOperation = "lighter";
            maskCtx.beginPath();
            maskCtx.arc(point.x, point.y, spotlightRadius, 0, Math.PI * 2);
            maskCtx.fillStyle = gradient;
            maskCtx.fill();
          });

          // Use mask to draw color image
          ctx.save();
          ctx.globalCompositeOperation = "source-over";

          // Draw the mask as alpha
          ctx.globalCompositeOperation = "destination-over";

          // Create a temporary canvas for the color layer
          const colorCanvas = document.createElement('canvas');
          colorCanvas.width = canvas.width;
          colorCanvas.height = canvas.height;
          const colorCtx = colorCanvas.getContext('2d');

          if (colorCtx) {
            colorCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            colorCtx.globalCompositeOperation = "destination-in";
            colorCtx.drawImage(maskCanvas, 0, 0);

            // Draw the masked color layer on main canvas
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(colorCanvas, 0, 0);
          }

          ctx.restore();
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoaded, spotlightRadius, fadeDuration]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const now = Date.now();

    // Add paint point (throttle to avoid too many points)
    if (now - lastPaintTimeRef.current > 16) { // ~60fps
      paintPointsRef.current.push({ x, y, timestamp: now });
      lastPaintTimeRef.current = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling while painting
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    const now = Date.now();

    // Add paint point (throttle to avoid too many points)
    if (now - lastPaintTimeRef.current > 16) { // ~60fps
      paintPointsRef.current.push({ x, y, timestamp: now });
      lastPaintTimeRef.current = now;
    }
  };

  const handleMouseLeave = () => {
    // Don't clear points - let them fade naturally
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      className={`w-full h-full ${className}`}
      style={{
        cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='brush' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FF6B6B;stop-opacity:1'/%3E%3Cstop offset='33%25' style='stop-color:%23FFD93D;stop-opacity:1'/%3E%3Cstop offset='66%25' style='stop-color:%236BCB77;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%234D96FF;stop-opacity:1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M9.06 11.9l8.07-8.06a1.5 1.5 0 0 1 2.13 0l.92.92a1.5 1.5 0 0 1 0 2.13L12.11 15' stroke='url(%23brush)' stroke-width='2.5' fill='none'/%3E%3Cpath d='M9 12l-7 7v3h3l7-7' fill='url(%23brush)' stroke='url(%23brush)' stroke-width='1.5'/%3E%3C/svg%3E") 0 24, crosshair`,
        touchAction: 'none' // Prevent scrolling on touch
      }}
      aria-label={alt}
    />
  );
}
