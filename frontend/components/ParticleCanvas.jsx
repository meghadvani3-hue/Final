'use client';

import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({ density = 'high', color = 'white', showHorizon = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Support for High-DPI / Retina displays to ensure razor-sharp rendering
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dynamic particle counts
    let particleCount = 200; // Reduced slightly because visual depth makes it feel richer
    if (density === 'medium') particleCount = 100;
    if (density === 'low') particleCount = 40;

    const particles = [];

    // Initialize particles with interconnected physical properties
    for (let i = 0; i < particleCount; i++) {
      // 3D Depth Factor: smaller particles are far away, larger are closer
      const size = Math.random() * 1.6 + 0.4; // 0.4px to 2.0px
      const depthFactor = size / 2.0; // Normalized 0.2 to 1.0

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: size,
        // Closer particles move faster, distant ones drift slowly
        speedY: (Math.random() * 0.4 + 0.1) * depthFactor,
        // Base opacity matches depth (distant stars/dust are dimmer)
        baseOpacity: Math.random() * 0.4 + 0.2 * depthFactor,
        opacity: 0, // Will fade in initially
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        // Gentle horizontal swaying properties
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.01 + 0.002,
        wobbleRadius: Math.random() * 0.3 + 0.1,
        colorType: color === 'mixed' 
          ? (Math.random() > 0.65 ? 'cyan' : Math.random() > 0.35 ? 'purple' : 'white')
          : color
      });
    }

    // Animation Loop
    const animate = () => {
      // Creates a very subtle trails/softness by not perfectly clearing, or use pure clear for crispness
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // 1. Update Positions (Floating up + Organic swaying)
        p.y -= p.speedY;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * p.wobbleRadius;

        // 2. Continuous Twinkle Logic
        p.opacity += p.twinkleSpeed * p.twinkleDirection;
        if (p.opacity >= p.baseOpacity) {
          p.opacity = p.baseOpacity;
          p.twinkleDirection = -1;
        } else if (p.opacity <= 0.1) {
          p.opacity = 0.1;
          p.twinkleDirection = 1;
        }

        // 3. Smooth Edge Fading (No sudden pops at the edges)
        let edgeFade = 1;
        const fadeZoneY = 80; // Distance from top/bottom to start fading
        const fadeZoneX = 40; // Distance from sides to start fading

        if (p.y < fadeZoneY) edgeFade *= p.y / fadeZoneY;
        else if (p.y > height - fadeZoneY) edgeFade *= (height - p.y) / fadeZoneY;
        
        if (p.x < fadeZoneX) edgeFade *= p.x / fadeZoneX;
        else if (p.x > width - fadeZoneX) edgeFade *= (width - p.x) / fadeZoneX;

        // Reset particle safely when it goes off the top
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.opacity = 0;
        }
        // Wrap around horizontally if drifting too far
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // 4. Render Particle with Glow Effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        let colorStr = 'rgba(255, 255, 255, '; // Fixed invalid 270 value
        if (p.colorType === 'cyan') {
          colorStr = 'rgba(56, 189, 248, ';  // Tailwinds sky-400
        } else if (p.colorType === 'purple') {
          colorStr = 'rgba(192, 132, 252, '; // Tailwinds purple-400 (slightly warmer/comfier)
        }

        const finalOpacity = Math.max(0, Math.min(p.opacity * edgeFade, 1));
        ctx.fillStyle = `${colorStr}${finalOpacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, color]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {showHorizon && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-[1px] pointer-events-none transition-all duration-1000"
          style={{
            top: '55%',
            background: 'linear-gradient(to right, transparent, #1d4ed8, #3b82f6, #1d4ed8, transparent)',
            boxShadow: '0 0 50px 12px rgba(59, 130, 246, 0.4), 0 0 20px 2px rgba(147, 197, 253, 0.2)'
          }}
        />
      )}
    </div>
  );
}