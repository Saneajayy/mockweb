'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: string;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  swingAmp: number;
  swingSpeed: number;
  swingOffset: number;
  alpha: number;
  isCrystal: boolean;
  rotation: number;
  rotSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tailLength: number;
  width: number;
  life: number;
  maxLife: number;
}

export default function WinterSky({
  className = '',
  snowOnly = false,
  flakeCount,
  starCount,
  sizeScale = 1,
  speedScale = 1,
}: {
  className?: string;
  snowOnly?: boolean;
  flakeCount?: number;
  starCount?: number;
  sizeScale?: number;
  speedScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // 1. Static Pinpoint Stars
    let stars: Star[] = [];
    const initStars = (w: number, h: number) => {
      if (snowOnly) return;
      const skyHeight = h * 0.72;
      const count = Math.floor((w * skyHeight) / 6500);
      const starColors = ['#FFFFFF', '#FFFFFF', '#F0F9FF', '#E0F2FE', '#FFFEEA'];
      const targetCount = starCount !== undefined ? starCount : Math.max(40, Math.min(count, 130));

      stars = Array.from({ length: targetCount }, () => {
        const isBright = Math.random() < 0.12;
        return {
          x: Math.random() * w,
          y: Math.random() * skyHeight,
          // Ultra-thin pinpoint stars: 0.4px to 1.1px
          radius: isBright ? 0.85 + Math.random() * 0.35 : 0.4 + Math.random() * 0.45,
          baseAlpha: isBright ? 0.7 + Math.random() * 0.3 : 0.25 + Math.random() * 0.4,
          twinkleSpeed: 0.006 + Math.random() * 0.018,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        };
      });
    };

    // 2. Snowflakes
    let flakes: Snowflake[] = [];
    const initFlakes = (w: number, h: number) => {
      const count = Math.floor((w * h) / 14000);
      const targetCount = flakeCount !== undefined ? flakeCount : Math.max(50, Math.min(count, 110));
      flakes = Array.from({ length: targetCount }, () => {
        const depth = Math.random();
        let radius: number;
        let speedY: number;
        let alpha: number;
        let swingAmp: number;

        if (depth < 0.6) {
          // Distant tiny flakes (soft, slow)
          radius = 0.6 + Math.random() * 0.7;
          speedY = 0.25 + Math.random() * 0.35;
          alpha = 0.25 + Math.random() * 0.35;
          swingAmp = 0.4 + Math.random() * 0.8;
        } else if (depth < 0.9) {
          // Midground flakes
          radius = 1.3 + Math.random() * 0.8;
          speedY = 0.45 + Math.random() * 0.4;
          alpha = 0.5 + Math.random() * 0.3;
          swingAmp = 0.8 + Math.random() * 1.2;
        } else {
          // Closer foreground flakes
          radius = 2.1 + Math.random() * 1.0;
          speedY = 0.65 + Math.random() * 0.45;
          alpha = 0.7 + Math.random() * 0.25;
          swingAmp = 1.2 + Math.random() * 1.6;
        }

        const isCrystal = Math.random() < 0.35;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          radius: radius * sizeScale,
          speedY: speedY * speedScale,
          speedX: (Math.random() - 0.5) * 0.15 * speedScale,
          swingAmp: swingAmp * Math.min(sizeScale, 1.5),
          swingSpeed: 0.008 + Math.random() * 0.015,
          swingOffset: Math.random() * Math.PI * 2,
          alpha,
          isCrystal,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.016,
        };
      });
    };

    // 3. Shooting Stars (sparse, random intervals)
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarFrame = 120 + Math.floor(Math.random() * 240); // Initial spawn between 2-6s

    const spawnShootingStar = () => {
      if (width === 0 || height === 0) return;
      // Angle: ~28° to ~38° downwards
      const goRight = Math.random() < 0.75;
      const angleDeg = goRight ? 26 + Math.random() * 12 : 142 + Math.random() * 12;
      const rad = (angleDeg * Math.PI) / 180;
      const speed = 10 + Math.random() * 5;

      const startX = goRight
        ? Math.random() * (width * 0.65)
        : width * 0.35 + Math.random() * (width * 0.65);
      const startY = height * 0.05 + Math.random() * (height * 0.35);
      const maxLife = 26 + Math.floor(Math.random() * 14); // ~0.45s to ~0.65s

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(rad) * speed,
        vy: Math.sin(rad) * speed,
        tailLength: Math.min(width * 0.45, 70 + Math.random() * 60),
        width: 0.8 + Math.random() * 0.4, // Thin razor point (0.8px - 1.2px)
        life: maxLife,
        maxLife,
      });

      // Next spawn scheduled in 6 to 14 seconds (at 60fps: 360 to 840 frames)
      nextShootingStarFrame = 360 + Math.floor(Math.random() * 480);
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      initStars(width, height);
      initFlakes(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      if (!snowOnly) {
        // 1. Draw ultra-thin pinpoint twinkling Stars
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
          const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkle * 0.3));

          ctx.save();
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle micro-cross glint for select brighter stars
          if (star.radius > 1.0 && currentAlpha > 0.82) {
            ctx.strokeStyle = star.color;
            ctx.lineWidth = 0.35;
            ctx.globalAlpha = currentAlpha * 0.35;
            ctx.beginPath();
            ctx.moveTo(star.x - 2.5, star.y);
            ctx.lineTo(star.x + 2.5, star.y);
            ctx.moveTo(star.x, star.y - 2.5);
            ctx.lineTo(star.x, star.y + 2.5);
            ctx.stroke();
          }

          ctx.restore();
        }

        // 2. Draw Realistic Shooting Stars
        nextShootingStarFrame -= 1;
        if (nextShootingStarFrame <= 0 && shootingStars.length < 2) {
          spawnShootingStar();
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          ss.x += ss.vx;
          ss.y += ss.vy;
          ss.life -= 1;

          if (ss.life <= 0) {
            shootingStars.splice(i, 1);
            continue;
          }

          // Bell curve alpha envelope (fades in quickly, peaks, fades out)
          const progress = 1 - ss.life / ss.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.95;

          // Tail calculation
          const velocity = Math.hypot(ss.vx, ss.vy);
          const dirX = ss.vx / velocity;
          const dirY = ss.vy / velocity;
          const currentTail = ss.tailLength * Math.min(1, progress * 3);
          const tailX = ss.x - dirX * currentTail;
          const tailY = ss.y - dirY * currentTail;

          ctx.save();
          const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          grad.addColorStop(0.15, `rgba(224, 242, 254, ${alpha * 0.85})`);
          grad.addColorStop(0.6, `rgba(255, 255, 255, ${alpha * 0.3})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = ss.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Pinpoint meteor head with faint micro-glow
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, ss.width * 0.85, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // 3. Draw realistic slow gentle falling Snow
      for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];

        flake.y += flake.speedY;
        flake.x +=
          flake.speedX +
          Math.sin(time * flake.swingSpeed + flake.swingOffset) * (flake.swingAmp * 0.04);

        flake.rotation += flake.rotSpeed;

        if (flake.y > height + 8) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 8) {
          flake.x = -8;
        } else if (flake.x < -8) {
          flake.x = width + 8;
        }

        if (flake.isCrystal && flake.radius >= 1.6) {
          // Render detailed 6-point crystal snowflake with delicate branches
          ctx.save();
          ctx.translate(flake.x, flake.y);
          ctx.rotate(flake.rotation);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(0.65, flake.radius * 0.18);
          ctx.lineCap = 'round';
          ctx.globalAlpha = Math.min(1, flake.alpha * 1.15);

          const r = flake.radius * 1.35;
          for (let b = 0; b < 6; b++) {
            // Main radial arm
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, r);
            ctx.stroke();

            // Branching v-tips
            const branchPos = r * 0.55;
            const branchLen = r * 0.35;
            ctx.beginPath();
            ctx.moveTo(0, branchPos);
            ctx.lineTo(-branchLen * 0.65, branchPos - branchLen * 0.45);
            ctx.moveTo(0, branchPos);
            ctx.lineTo(branchLen * 0.65, branchPos - branchLen * 0.45);
            ctx.stroke();

            ctx.rotate(Math.PI / 3);
          }

          // Center delicate core dot
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.5, flake.radius * 0.2), 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else {
          // Standard circular snow puff particle
          ctx.save();
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = flake.alpha;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [snowOnly, flakeCount, starCount, sizeScale, speedScale]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
