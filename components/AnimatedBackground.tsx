'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Fast X Cyber Palette: Binance Gold, Electric Cyan, Violet Purple, Emerald Green
    const colors = ['#F0B90B', '#00F0FF', '#A855F7', '#10B981', '#F59E0B', '#38BDF8'];
    const particleCount = Math.min(Math.floor((width * height) / 9000), 110);
    const particles: Particle[] = [];

    // Mouse tracking
    let mouse = { x: -1000, y: -1000, radius: 180 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.35,
        alpha: Math.random() * 0.4 + 0.35,
        color: color,
      });
    }

    let tick = 0;

    const render = () => {
      tick += 0.006;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing background ambient neon orbs
      const grad1 = ctx.createRadialGradient(
        width * 0.2 + Math.sin(tick) * 70,
        height * 0.25 + Math.cos(tick) * 50,
        0,
        width * 0.2,
        height * 0.25,
        width * 0.45
      );
      grad1.addColorStop(0, 'rgba(240, 185, 11, 0.12)'); // Binance Gold
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.8 + Math.cos(tick) * 80,
        height * 0.45 + Math.sin(tick) * 60,
        0,
        width * 0.8,
        height * 0.45,
        width * 0.5
      );
      grad2.addColorStop(0, 'rgba(0, 240, 255, 0.10)'); // Neon Cyan
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      const grad3 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(tick * 0.8) * 90,
        height * 0.85 + Math.cos(tick * 0.8) * 50,
        0,
        width * 0.5,
        height * 0.85,
        width * 0.55
      );
      grad3.addColorStop(0, 'rgba(168, 85, 247, 0.11)'); // Cyber Violet
      grad3.addColorStop(1, 'transparent');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 2. Update & Draw Interactive Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce at screen borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interactive mouse gravity / push
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.2;
          p.x -= (dx / dist) * force * 2.5;
          p.y -= (dy / dist) * force * 2.5;
          p.alpha = Math.min(1, p.baseAlpha + 0.5);
        } else {
          p.alpha = p.baseAlpha;
        }

        // Draw glowing particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Connect nearby particles with subtle cyber constellation lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = 135;

          if (dist2 < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist2 / maxDist) * 0.28;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.9;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Cyber Grid Texture */}
      <div className="absolute inset-0 cyber-grid opacity-40" />
      {/* Dynamic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/80 via-transparent to-[#07090e]/60" />
    </div>
  );
}
