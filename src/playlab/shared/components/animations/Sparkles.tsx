"use client";

import { useRef, useEffect } from "react";

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  shape: "star" | "circle" | "diamond";
}

const COLORS = ["#FFD700", "#FF9EBC", "#A882E8", "#66CC94", "#54A0FF", "#FFA94D"];

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rotation: number
) {
  const spikes = 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const rad = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.6, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ─── Celebration variant (full-screen burst) ────────────────────────────────

interface CelebrationSparklesProps {
  active: boolean;
  width: number;
  height: number;
}

function createCelebrationSparkle(width: number, _height: number): SparkleParticle {
  return {
    x: Math.random() * width,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    life: 1,
    maxLife: 90 + Math.floor(Math.random() * 60),
    radius: 5 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
    shape: (["star", "circle", "diamond"] as const)[Math.floor(Math.random() * 3)],
  };
}

export function CelebrationSparkles({ active, width, height }: CelebrationSparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SparkleParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.maxLife--;
        p.rotation += p.rotSpeed;

        const alpha = Math.max(0, Math.min(1, p.maxLife / 60));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.radius, p.rotation);
        } else if (p.shape === "diamond") {
          drawDiamond(ctx, p.x, p.y, p.radius, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.maxLife <= 0) particlesRef.current.splice(i, 1);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (spawnRef.current) {
      clearInterval(spawnRef.current);
      spawnRef.current = null;
    }
    if (!active) return;

    // Initial burst
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        particlesRef.current.push(createCelebrationSparkle(width, height));
      }, i * 20);
    }

    // Continuous drizzle
    spawnRef.current = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push(createCelebrationSparkle(width, height));
      }
    }, 120);

    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [active, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      // h-full/w-full, NOT inset-0 alone. A canvas is a REPLACED element: with
      // width:auto the used width is its intrinsic (attribute) width and the
      // `right` offset is dropped, so `inset-0` left it painting at its buffer
      // size anchored top-left — a 360px-wide buffer covering the left 45% of
      // an 800px landscape screen, which is the "confetti only on one side"
      // bug. An explicit 100%/100% makes the element track its parent, and the
      // buffer (sized from the measured stage) then maps onto the whole area.
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
