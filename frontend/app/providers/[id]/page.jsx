'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';
import BookingModal from '@/components/BookingModal';
import { api } from '@/app/api';
import { useAuth } from '@/components/AuthContext';
import { Star, Clock, Heart, Award, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProviderDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Booking Card Selection states
  const [sessionType, setSessionType] = useState('hourly'); // 'hourly' | 'daily' | 'monthly'
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await api.providers.get(id);
        setProvider(data);
      } catch (err) {
        console.error(err);
        toast.error('Provider not found');
        router.push('/browse');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id, router]);

  useEffect(() => {
    setDuration(1);
  }, [sessionType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-companion-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50 animate-pulse">Loading Provider profile...</p>
      </div>
    );
  }

  if (!provider) return null;

  const { bio, photos, tags, hourlyRate, dailyRate, monthlyRate, isLive, avgRating, totalReviews, userId } = provider;
  const name = userId?.name || 'Anonymous Companion';
  const displayPhoto = photos && photos.length > 0 
    ? photos[0] 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';

  // Calculate pricing based on selections
  const getRate = () => {
    if (sessionType === 'hourly') return hourlyRate || 499;
    if (sessionType === 'daily') return dailyRate || (hourlyRate * 8) || 2999;
    return monthlyRate || (dailyRate * 25) || 49999;
  };

  const rate = getRate();
  const totalAmount = rate * duration;

  const increment = () => setDuration(prev => prev + 1);
  const decrement = () => setDuration(prev => Math.max(1, prev - 1));

  return (
    <div className="relative min-h-screen bg-companion-black text-white flex flex-col pb-20">
      <Navbar />

      {/* Hero Section (400px tall) */}
      <div className="relative h-[400px] w-full overflow-hidden shrink-0 flex items-center justify-center">
        {/* Blurred Photo Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayPhoto}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content Centered Over Background */}
        <div className="relative z-10 text-center flex flex-col items-center px-6 pt-16">
          {/* Back button */}
          <button 
            onClick={() => router.back()}
            className="absolute top-4 left-0 md:-left-20 flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Profile Image Ring */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayPhoto}
            alt={name}
            className="w-[120px] h-[120px] rounded-full object-cover border-2 border-companion-purple shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          />

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight">
            {name}
          </h2>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-green-500 animate-ping shadow-[0_0_8px_#22c55e]' : 'bg-zinc-600'}`} />
            <span className="text-xs font-semibold text-white/60">
              {isLive ? 'Available Now' : 'Offline'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-400">
            <span>★</span>
            <span>{avgRating ? avgRating.toFixed(1) : '5.0'}</span>
            <span className="text-white/40 font-light">({totalReviews || 0} reviews)</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {tags && tags.map((tag, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-companion-purple/10 text-companion-violet border border-companion-purple/15 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (two column on desktop) */}
      <div className="max-w-6xl mx-auto w-full px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <GlassCard className="p-8 border border-white/8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="text-companion-purple w-5 h-5 shrink-0" /> About {name.split(' ')[0]}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-line">
              {bio || 'This companion has not provided a biography yet.'}
            </p>
          </GlassCard>

          {/* Credentials Info */}
          <GlassCard className="p-8 border border-white/8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Award className="text-companion-cyan w-5 h-5 shrink-0" /> Verified Support
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light text-white/60">
              <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-lg">🛡️</span>
                <span>Background checked and identity verified.</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
                <span className="text-lg">💬</span>
                <span>Trained in active listening and empathetic dialogue.</span>
              </div>
            </div>
          </GlassCard>

          {/* Reviews Section */}
          <GlassCard className="p-8 border border-white/8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="text-amber-400 w-5 h-5 shrink-0" /> Reviews
            </h3>
            <div className="py-6 text-center text-sm text-white/40 font-light border border-dashed border-white/10 rounded-xl bg-white/2">
              <p>Companionship reviews and feedback list</p>
              <p className="text-xs text-white/30 mt-0.5">(Post-MVP placeholder: Coming soon)</p>
            </div>
          </GlassCard>
        </div>

        {/* Right Column (Narrower, sticky booking selector) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <GlassCard className="p-6 border border-white/12 space-y-6">
              <h3 className="text-lg font-bold text-white">Book a Session</h3>

              {/* plan types toggles */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2">Session Type</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    {['hourly', 'daily', 'monthly'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSessionType(type)}
                        className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                          sessionType === type 
                            ? 'bg-companion-purple text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)]' 
                            : 'text-white/50 hover:text-white/70'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration select */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-2">
                    Duration ({sessionType === 'hourly' ? 'hours' : sessionType === 'daily' ? 'days' : 'months'})
                  </label>
                  <div className="flex items-center justify-between bg-white/3 border border-white/10 rounded-xl p-2.5">
                    <button 
                      type="button"
                      onClick={decrement}
                      className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 text-lg font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-bold text-base">{duration}</span>
                    <button 
                      type="button"
                      onClick={increment}
                      className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 text-lg font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2 text-sm font-light">
                  <div className="flex justify-between text-white/50">
                    <span>Plan Rate:</span>
                    <span className="text-white font-normal">₹{rate} / {sessionType === 'hourly' ? 'hr' : sessionType === 'daily' ? 'day' : 'mo'}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Duration:</span>
                    <span className="text-white font-normal">{duration} {sessionType === 'hourly' ? 'hour(s)' : sessionType === 'daily' ? 'day(s)' : 'month(s)'}</span>
                  </div>
                  <hr className="border-white/10 my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-white/70">Total Cost:</span>
                    <span className="text-companion-cyan text-lg font-bold">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Book Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast.error("Please sign in or register to book a session.");
                      return;
                    }
                    if (user.role !== 'seeker') {
                      toast.error("Companions cannot book other companions. Please register a seeker account.");
                      return;
                    }
                    setBookingModalOpen(true);
                  }}
                  className="w-full bg-companion-purple hover:bg-companion-purple/90 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01]"
                >
                  Book Now & Pay →
                </button>
              </div>
            </GlassCard>
          </div>
        </div>

      </div>

      {/* Booking Checkout Modal Wrapper */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        provider={provider}
      />
    </div>
  );
}
