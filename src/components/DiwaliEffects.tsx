'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Hanging festive fairy lights along the top
export function FairyLights() {
  const bulbs = [
    { color: '#f59e0b', delay: '0s' },    // Amber
    { color: '#fbbf24', delay: '0.4s' },  // Gold
    { color: '#ea580c', delay: '0.8s' },  // Deep Orange
    { color: '#ef4444', delay: '1.2s' },  // Ruby
    { color: '#10b981', delay: '0.6s' },  // Emerald
    { color: '#f59e0b', delay: '1.4s' },  // Amber
    { color: '#fbbf24', delay: '0.2s' },  // Gold
    { color: '#ec4899', delay: '1.0s' },  // Festive Pink
    { color: '#ea580c', delay: '0.5s' },  // Orange
    { color: '#f59e0b', delay: '1.6s' },  // Amber
    { color: '#10b981', delay: '0.9s' },  // Emerald
    { color: '#fbbf24', delay: '1.3s' },  // Gold
  ];

  return (
    <div className="w-full overflow-visible pointer-events-none select-none relative z-30 flex items-start justify-around px-2 pt-0.5 pb-8">
      {/* Decorative wire */}
      <svg className="absolute top-0 left-0 w-full h-4 text-amber-500/30 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1200 20">
        <path d="M0,4 Q100,16 200,4 Q300,16 400,4 Q500,16 600,4 Q700,16 800,4 Q900,16 1000,4 Q1100,16 1200,4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {bulbs.map((b, i) => (
        <div key={i} className="flex flex-col items-center" style={{ marginTop: `${Math.sin(i * 0.8) * 3 + 4}px` }}>
          <div className="w-1 h-1.5 bg-amber-900/80 rounded-t-sm" />
          <div
            className="w-2.5 h-3.5 rounded-full"
            style={{
              backgroundColor: b.color,
              boxShadow: `0 0 8px 2px ${b.color}, 0 0 16px 4px ${b.color}50`,
              animation: `fairy-shimmer 2.2s ease-in-out infinite alternate`,
              animationDelay: b.delay,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Gorgeous SVG Diya with flickering flame
export function DiyaIcon({ className = "w-6 h-6", glowing = true }: { className?: string; glowing?: boolean }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Ambient flame glow - smooth faded circular radial gradient */}
      {glowing && (
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.1) 35%, rgba(0, 0, 0, 0) 70%)',
          }}
        />
      )}
      
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full overflow-visible">
        {/* Clay base */}
        <path
          d="M12 38 C 12 52, 52 52, 52 38 C 50 36, 42 34, 32 34 C 22 34, 14 36, 12 38 Z"
          fill="url(#clayGradient)"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        {/* Diya lip rim */}
        <ellipse cx="32" cy="37" rx="20" ry="4" fill="url(#oilGradient)" stroke="#f59e0b" strokeWidth="0.8" />
        {/* Decorative golden engraving */}
        <path d="M20 42 Q 32 46 44 42" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        
        {/* Animated Flame */}
        <g className="animate-flame" style={{ transformOrigin: '32px 34px' }}>
          {/* Flame ambient halo */}
          <ellipse cx="32" cy="24" rx="7" ry="12" fill="url(#flameAuraGradient)" />

          {/* Outer orange flame */}
          <path
            d="M32 14 C 28 22, 27 28, 30 34 C 31 35.5, 33 35.5, 34 34 C 37 28, 36 22, 32 14 Z"
            fill="url(#outerFlameGradient)"
          />
          {/* Inner core gold/white flame */}
          <path
            d="M32 20 C 30 25, 29.5 29, 31 33 C 31.5 34, 32.5 34, 33 33 C 34.5 29, 34 25, 32 20 Z"
            fill="url(#innerFlameGradient)"
          />
        </g>

        <defs>
          <radialGradient id="flameAuraGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#ea580c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="clayGradient" x1="12" y1="34" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9a3412" />
            <stop offset="0.5" stopColor="#c2410c" />
            <stop offset="1" stopColor="#7c2d12" />
          </linearGradient>
          <linearGradient id="oilGradient" x1="12" y1="37" x2="52" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b45309" />
            <stop offset="0.5" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="outerFlameGradient" x1="32" y1="14" x2="32" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ea580c" />
            <stop offset="0.6" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="innerFlameGradient" x1="32" y1="20" x2="32" y2="33" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Particle Fireworks & Sparkles canvas
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Sparkle {
  x: number;
  y: number;
  vy: number;
  size: number;
  opacity: number;
  pulseSpeed: number;
  angle: number;
}

const GOLDEN_COLORS = ['#fbbf24', '#f59e0b', '#ea580c', '#fef08a', '#ec4899', '#38bdf8', '#a855f7'];

export function DiwaliCanvas({ triggerFirework }: { triggerFirework?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Spawns firework burst at specific location or random center
  const createFirework = useCallback((targetX?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = targetX ?? (canvas.width * 0.2 + Math.random() * canvas.width * 0.6);
    const y = targetY ?? (canvas.height * 0.15 + Math.random() * canvas.height * 0.35);

    const count = 45;
    const baseColor = GOLDEN_COLORS[Math.floor(Math.random() * GOLDEN_COLORS.length)];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color: Math.random() > 0.4 ? baseColor : '#fbbf24',
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
      });
    }
  }, []);

  useEffect(() => {
    if (triggerFirework && triggerFirework > 0) {
      createFirework();
    }
  }, [triggerFirework, createFirework]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Init ambient floating sparkles
      sparklesRef.current = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vy: -(0.2 + Math.random() * 0.6),
        size: 1 + Math.random() * 2.2,
        opacity: Math.random(),
        pulseSpeed: 0.01 + Math.random() * 0.02,
        angle: Math.random() * Math.PI * 2,
      }));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render floating golden stardust / embers
      sparklesRef.current.forEach((sp) => {
        sp.y += sp.vy;
        sp.angle += sp.pulseSpeed;
        const currentOpacity = 0.2 + Math.sin(sp.angle) * 0.5;

        if (sp.y < -10) {
          sp.y = canvas.height + 10;
          sp.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${Math.max(0, currentOpacity)})`;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render firework particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.vx *= 0.98; // drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [createFirework]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}
