'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Lock, CreditCard, Clock, Play, ArrowRight, Star, Heart } from 'lucide-react';
import { api } from './api';
import Navbar from '@/components/Navbar';
import ParticleCanvas from '@/components/ParticleCanvas';
import GlassCard from '@/components/GlassCard';

export default function Home() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanions() {
      try {
        const res = await api.providers.list();
        setCompanions(res.data || []);
      } catch (err) {
        console.error("Failed to load marquee companions", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanions();
  }, []);

  // Floating mini-cards mock data (3 provider mini-cards at the bottom of hero)
  const heroFloatingCards = [
    {
      name: 'Ansh Mehra',
      role: 'Listener',
      rating: '4.9',
      photo: '/download.jpg',
      tag: 'Cozy Chats'
    },
    {
      name: 'Dev Suthar',
      role: 'Gaming Buddy',
      rating: '5.0',
      photo: '/that chill.jpg',
      tag: 'Gaming/Anime'
    },
    {
      name: 'Vratik Akbari',
      role: 'Shopping Partner',
      rating: '4.8',
      photo: '/person3.jpg',
      tag: 'Mindset'
    }
  ];

  return (
    <div className="relative min-h-screen bg-companion-black text-white overflow-hidden flex flex-col">
      {/* Absolute background star field */}
      <ParticleCanvas density="high" color="mixed" showHorizon={true} />

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-28 pb-16 z-10 text-center max-w-5xl mx-auto">
        {/* Eyebrow Text */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-xs uppercase tracking-[0.3em] text-companion-violet font-semibold mb-4"
        >
          # Emotional Connection, On GENZ Demand
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl md:text-8xl font-extrabold tracking-tight text-white mb-6 leading-[1.05]"
        >
          Find Your Perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-companion-purple via-companion-violet to-companion-cyan">
            Service
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          className="text-white/60 text-base md:text-lg max-w-2xl font-light leading-relaxed mb-10"
        >
          Hire verified emotional support companions — listeners, virtual best friends, vent partners. Book by the hour, day, or month. Completely confidential and secure.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Link href="/browse">
            <button className="px-8 py-4 bg-companion-purple hover:bg-companion-purple/90 text-sm font-semibold rounded-full shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:scale-102 transition-all flex items-center justify-center gap-2">
              Start Browsing <ArrowRight size={16} />
            </button>
          </Link>
          <a href="#how-it-works">
            <button className="px-8 py-4 bg-white/3 border border-white/10 hover:border-white/20 text-sm font-semibold rounded-full hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <Play size={14} className="fill-white" /> Watch how it works
            </button>
          </a>
        </motion.div>

        {/* Floating Mini-cards Row */}
        <div className="w-full flex justify-center items-center gap-4 md:gap-8 flex-wrap mt-auto">
          {heroFloatingCards.map((card, idx) => (
            <motion.div
              key={card.name}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 + idx * 0.15, ease: 'easeOut' }}
            >
              {/* Floating animation wrapper */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: idx * 0.7
                }}
              >
                <GlassCard className="flex items-center gap-4 p-3.5 border border-white/10 w-[240px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.photo}
                    alt={card.name}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h5 className="text-white text-xs font-semibold truncate">{card.name}</h5>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center shrink-0">
                        ★ {card.rating}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/50 mb-1 font-light truncate">{card.role}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-companion-purple/20 text-companion-violet border border-companion-purple/20">
                      {card.tag}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section id="how-it-works" className="relative py-28 px-6 bg-black z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-companion-cyan font-bold mb-3"
          >
            Simple onboarding
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-white mb-16"
          >
            How it works
          </motion.h2>

          {/* Three Steps Horizontal Row */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mt-12">
            {/* Connecting dashed line on desktop */}
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[1px] border-t-2 border-dashed border-white/10 z-0" />

            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-companion-dark border border-white/10 flex items-center justify-center mb-6 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 font-extrabold text-4xl absolute -top-5 left-1/2 -translate-x-1/2 select-none">1</span>
                <Shield className="text-companion-purple w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">1. Browse Profiles</h4>
              <p className="text-sm text-white/50 font-light max-w-xs leading-relaxed">
                Filter by specialties, price ranges, and real-time availability to find your matching companion.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-companion-dark border border-white/10 flex items-center justify-center mb-6 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 font-extrabold text-4xl absolute -top-5 left-1/2 -translate-x-1/2 select-none">2</span>
                <Clock className="text-companion-cyan w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">2. Book a Session</h4>
              <p className="text-sm text-white/50 font-light max-w-xs leading-relaxed">
                Choose hourly, daily, or monthly support packages and confirm instantly via secure payment checkouts.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-companion-dark border border-white/10 flex items-center justify-center mb-6 relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 font-extrabold text-4xl absolute -top-5 left-1/2 -translate-x-1/2 select-none">3</span>
                <Heart className="text-companion-violet w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">3. Start Chatting</h4>
              <p className="text-sm text-white/50 font-light max-w-xs leading-relaxed">
                Connect inside our custom real-time chat interface with secure messaging and typing signals.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Featured Companions (Marquee Row) */}
      <section className="relative py-28 bg-companion-black z-10 overflow-hidden border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-companion-violet font-bold mb-3"
          >
            Premium selection
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-white"
          >
            Meet our companions
          </motion.h2>
        </div>

        {/* Infinite Marquee Row */}
        <div className="relative flex items-center py-6 w-full select-none overflow-x-hidden">
          <div className="flex gap-6 animate-marquee whitespace-nowrap min-w-full">
            {/* Double companions data to make infinite scrolling look continuous */}
            {[...companions, ...companions, ...companions].map((p, idx) => {
              const displayPhoto = p.photos && p.photos.length > 0 
                ? p.photos[0] 
                : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600';
              return (
                <div 
                  key={`${p._id}-${idx}`}
                  className="w-[200px] inline-block shrink-0"
                >
                  <GlassCard hover className="w-full h-[280px] p-3 flex flex-col justify-between group relative select-none">
                    <Link href={`/providers/${p._id}`} className="absolute inset-0 z-10" />
                    
                    {/* Photo */}
                    <div className="w-full h-[130px] rounded-lg overflow-hidden bg-white/5 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={displayPhoto} 
                        alt={p.userId?.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {p.isLive && (
                        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col flex-1 justify-between mt-3 text-left">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-white text-xs font-semibold truncate w-4/5">{p.userId?.name}</span>
                          <span className="text-[10px] text-amber-400 font-bold shrink-0">★ {p.avgRating ? p.avgRating.toFixed(1) : '5.0'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-companion-purple/15 text-companion-violet border border-companion-purple/15">
                          {p.tags?.[0] || 'Listener'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-white text-xs font-bold">₹{p.hourlyRate}/hr</span>
                        <button 
                          type="button"
                          className="text-[10px] font-bold text-companion-violet opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Trust & Safety */}
      <section className="relative py-28 px-6 bg-black z-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-10 border border-white/10 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Column 1 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Shield className="text-companion-purple w-8 h-8 mb-4 shrink-0" />
                <h4 className="text-base font-semibold text-white mb-2">Verified Providers</h4>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Every profile undergoes strict verification checks to guarantee standard identity authenticity.
                </p>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Lock className="text-companion-cyan w-8 h-8 mb-4 shrink-0" />
                <h4 className="text-base font-semibold text-white mb-2">100% Private</h4>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Your details and conversations are encrypted and never shared. Connect in complete anonymity.
                </p>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <CreditCard className="text-companion-purple w-8 h-8 mb-4 shrink-0" />
                <h4 className="text-base font-semibold text-white mb-2">Secure Payments</h4>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Powered by Razorpay. Funds are held securely and released only after session completion.<br/>
                  Only small 25% upfront holds to prevent spam bookings, fully refundable if cancelled 24hrs before session time.<br/>
                  25% upfront holds are released back to you if provider cancels or doesn't show up for the session.<br/>
                  30-day refund policy for any dissatisfaction with the session experience.<br/>
                  25-30% of session fee goes to the owner, 10-15% goes to platform maintenance and support, and the rest is reserved for refunds, chargebacks, and operational costs.<br/>
                </p>
              </div>

              {/* Column 4 */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <Clock className="text-companion-cyan w-8 h-8 mb-4 shrink-0" />
                <h4 className="text-base font-semibold text-white mb-2">Available 24/7</h4>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  No matter the hour, active providers are online ready to listen, talk, and assist you.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Section 5: CTA Banner */}
      <section className="relative py-28 px-6 bg-companion-black z-10 flex flex-col justify-center items-center text-center overflow-hidden border-t border-white/5">
        {/* Subtle background particles */}
        <div className="absolute inset-0 opacity-40">
          <ParticleCanvas density="low" color="purple" showHorizon={false} />
        </div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            Ready to feel less alone?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-base font-light"
          >
            Join thousands of users finding comfort, guidance, and friendship in verified companions.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="pt-4"
          >
            <Link href="/browse">
              <button className="px-8 py-4 bg-companion-purple hover:bg-companion-purple/90 text-sm font-semibold rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:scale-102 transition-all">
                Find Your Provider →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black py-16 px-6 z-10 border-t border-white/5 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <h4 className="font-bold text-lg text-white">Nexora</h4>
            <p className="text-xs text-white/50 font-light max-w-sm leading-relaxed">
              Premium emotional companionship marketplace offering support, guidance, and gaming partnership. Real connections when you need them most.
            </p>
          </div>
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Platform</h5>
            <ul className="space-y-2.5 text-xs text-white/50 font-light">
              <li><Link href="/browse" className="hover:text-companion-violet transition-colors">Browse Profiles</Link></li>
              <li><a href="#how-it-works" className="hover:text-companion-violet transition-colors">How It Works</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">Support</h5>
            <ul className="space-y-2.5 text-xs text-white/50 font-light">
              <li><a href="#" className="hover:text-companion-violet transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-companion-violet transition-colors">Contact Us on : fproject6988@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs text-white/40 font-light">
          © 2026 Nexora · Built with MENN and a lot of love ❤️... 
        </div>
      </footer>
    </div>
  );
}
