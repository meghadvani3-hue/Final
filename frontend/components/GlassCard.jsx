'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, onClick, ...props }) {
  const CardComponent = onClick ? motion.button : motion.div;

  const baseStyle = {
    background: 'rgba(226, 10, 10, 0.03)',
    borderColor: 'rgba(246, 8, 8, 0.07)',
    boxshadow: '0px 10px 20px rgba(255, 11, 11, 0.3)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)'
  };

  const hoverTransition = hover ? {
    y: -4,
    borderColor: 'rgba(246, 15, 23, 0.5)',
    boxShadow: '0 0 25px rgba(236, 12, 12, 0.18)'
  } : {};

  return (
    <CardComponent
      style={baseStyle}
      whileHover={hover ? hoverTransition : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
      className={`border rounded-2xl text-left overflow-hidden focus:outline-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </CardComponent>
  );
}
