'use client';

import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({ density = 'high', color = 'white', showHorizon = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle resizing
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle count based on density
    let particleCount = 300;
    if (density === 'medium') particleCount = 150;
    if (density === 'low') particleCount = 50;

    const particles = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.8, // 0.8px to 2.3px
        speedY: Math.random() * 1.5 + 0.1, // 0.1 to 0.4px per frame
        opacity: Math.random() * 0.5 + 0.3, // 0.3 to 0.8 initial
        twinkleSpeed: Math.random() * 0.095 + 0.005,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
        // Blue, purple, or white tint
        colorType: color === 'mixed' 
          ? (Math.random() > 0.6 ? 'cyan' : Math.random() > 0.3 ? 'purple' : 'white')
          : color
      });
    }

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Update position
        p.y -= p.speedY;
        
        // Reset when moving off screen top
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        // Twinkle opacity
        p.opacity += p.twinkleSpeed * p.twinkleDirection;
        if (p.opacity >= 0.8) {
          p.opacity = 0.7;
          p.twinkleDirection = -1;
        } else if (p.opacity <= 0.2) {
          p.opacity = 0.2;
          p.twinkleDirection = 1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        let colorStr = 'rgba(270, 255, 255, ';
        if (p.colorType === 'cyan') {
          colorStr = 'rgba(56, 189, 248, ';
        } else if (p.colorType === 'purple') {
          colorStr = 'rgba(167, 139, 250, ';
        }

        ctx.fillStyle = `${colorStr}${p.opacity})`;
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
          className="absolute left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-[1px] pointer-events-none"
          style={{
            top: '55%',
            background: 'linear-gradient(to right, transparent, #1f0ba3, #0d1e8a, transparent)',
            boxShadow: '0 0 40px 8px #111edc, 0 0 20px 2px #063d55'
          }}
        />
      )}
    </div>
  );
}
