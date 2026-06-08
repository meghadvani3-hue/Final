import React from 'react';
import GlassCard from './GlassCard';

export default function LoadingSkeleton({ count = 6 }) {
  const skeletons = Array(count).fill(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {skeletons.map((_, idx) => (
        <GlassCard key={idx} className="flex flex-col h-[350px] animate-pulse">
          {/* Top Aspect Photo Skeleton */}
          <div className="w-full aspect-[4/3] bg-white/5 border-b border-white/5" />
          
          {/* Card Body Skeleton */}
          <div className="p-4 flex flex-col flex-1 justify-between gap-4">
            <div className="space-y-2.5">
              <div className="h-4 bg-white/10 rounded-full w-2/3" />
              <div className="flex gap-2">
                <div className="h-5 bg-white/5 rounded-full w-16" />
                <div className="h-5 bg-white/5 rounded-full w-20" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded-full w-1/3" />
              <div className="h-8 bg-white/10 rounded-xl w-full" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
