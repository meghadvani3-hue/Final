'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleCanvas from '@/components/ParticleCanvas';
import ProviderCard from '@/components/ProviderCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { api } from '@/app/api';
import toast from 'react-hot-toast';

export default function Browse() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [onlineOnly, setOnlineOnly] = useState(false);

  const specialties = [
    'Listener',
    'Vent Partner',
    'Gaming Buddy',
    'Life Coach',
    'Study Buddy',
    'Virtual BF/GF',
    'Motivator',
    'Night Owl'
  ];

  const fetchFilteredCompanions = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (selectedTags.length > 0) filters.tags = selectedTags;
      if (onlineOnly) filters.isLive = true;

      const res = await api.providers.list(filters);
      setProviders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load companions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters or online toggle changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFilteredCompanions();
    }, 400); // 400ms debounce to avoid spamming network requests during typing

    return () => clearTimeout(delayDebounceFn);
  }, [minPrice, maxPrice, selectedTags, onlineOnly]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedTags([]);
    setOnlineOnly(false);
    toast.success('Filters cleared');
  };

  return (
    <div className="relative min-h-screen bg-companion-black text-white flex flex-col">
      <Navbar />

      {/* Low Density Particle Header */}
      <div className="relative h-[220px] flex flex-col justify-center px-6 md:px-12 pt-20 border-b border-white/5 overflow-hidden bg-black z-10 shrink-0">
        <ParticleCanvas density="low" color="cyan" showHorizon={false} />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            Find Your Provider
          </h1>
          <p className="text-sm text-white/50 font-light">
            Browse verified emotional support providers, listeners, and virtual best friends.
          </p>
        </div>
      </div>

      {/* Main Filter + Grid Section */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 z-10 relative">
        
        {/* Left Sidebar Filters (Desktop) */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">Filters</h3>
            <button 
              onClick={clearAllFilters}
              className="text-xs text-companion-violet hover:underline cursor-pointer font-medium"
            >
              Clear all
            </button>
          </div>
          
          <hr className="border-white/10" />

          {/* Price Range filter */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-white/70">Price Range (₹/hr)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Specialties filter */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-white/70">Specialties</label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected 
                        ? 'bg-companion-purple border-companion-purple text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]' 
                        : 'bg-white/3 border-white/10 text-white/60 hover:text-white/80 hover:border-white/15'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Availability Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Online Now Only</span>
            <button
              type="button"
              onClick={() => setOnlineOnly(!onlineOnly)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                onlineOnly ? 'bg-companion-purple' : 'bg-white/10'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                  onlineOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Right Companions Grid */}
        <main className="flex-1">
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : providers.length === 0 ? (
            <div className="py-24 text-center border border-white/5 rounded-2xl bg-white/2 backdrop-blur-sm">
              <p className="text-white/40 text-sm font-light mb-1">No companions match your search criteria</p>
              <p className="text-xs text-white/30 font-light">Try adjusting your filters or price limits</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p._id} provider={p} />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
