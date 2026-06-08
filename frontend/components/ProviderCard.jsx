'use client';

import React from 'react';
import Link from 'next/link';
import GlassCard from './GlassCard';

export default function ProviderCard({ provider }) {
  if (!provider) return null;

  // Destructure from backend structure or mock structure
  const { _id, bio, photos, tags, hourlyRate, isLive, avgRating, totalReviews, userId } = provider;
  const name = userId?.name || 'Anonymous Companion';
  const displayPhoto = photos && photos.length > 0 
    ? photos[0] 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';

  return (
    <GlassCard hover className="flex flex-col h-full group relative">
      <Link href={`/providers/${_id}`} className="absolute inset-0 z-10" />

      {/* Profile Image with Online Indicator */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl border-b border-white/5 bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayPhoto}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Live status dot */}
        {isLive && (
          <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
            </span>
          </div>
        )}
      </div>

      {/* Card Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2.5">
          {/* Header Name & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-white text-base font-semibold tracking-wide transition-colors group-hover:text-companion-violet">
              {name}
            </h4>
            <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-400">
              <span>★</span>
              <span>{avgRating ? avgRating.toFixed(1) : '5.0'}</span>
            </div>
          </div>

          {/* Tags (showing up to 2 badges) */}
          <div className="flex flex-wrap gap-1.5">
            {tags && tags.slice(0, 2).map((tag, i) => (
              <span 
                key={i} 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-companion-purple/10 text-companion-violet border border-companion-purple/15"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bio snippet */}
          {bio && (
            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed font-light">
              {bio}
            </p>
          )}
        </div>

        {/* Pricing Rate & View Action */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-baseline justify-between text-xs text-white/50">
            <div>
              <span className="text-base font-bold text-white">₹{hourlyRate || '499'}</span>
              <span>/hr</span>
            </div>
            <span className="text-[10px] text-white/45">
              ({totalReviews || '0'} reviews)
            </span>
          </div>

          <button 
            type="button"
            className="w-full relative z-20 py-2.5 text-xs font-semibold tracking-wide border border-companion-purple/35 text-companion-violet hover:text-white hover:bg-companion-purple rounded-xl transition-all duration-300"
          >
            View Profile →
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
