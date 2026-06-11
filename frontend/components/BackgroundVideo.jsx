'use client';

import React from 'react';

export default function BackgroundVideo({ showHorizon = false }) {
  return (
    // Changed absolute to fixed, and added w-screen h-screen
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black z-0" />

      {/* Horizon glow effect */}
      {showHorizon && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-[1px] pointer-events-none transition-all duration-1000 z-10"
          style={{
            top: '43%',
            position: 'absolute',
            opacity: 1.0,
            background: 'linear-gradient(to right, transparent, #e09615, #e0b710, #e3ce0c, transparent)',
            boxShadow: '0 0 50px 12px rgba(239, 177, 6, 0.4), 0 0 20px 2px rgba(147, 197, 253, 0.2)'
          }}
        />
        
      )}
    </div>
  );
}