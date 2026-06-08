'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/app/api';
import { useAuth } from '@/components/AuthContext';
import { MessageCircle, Calendar, RefreshCw, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Bookings() {
  const { user, token, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'active' | 'completed' | 'declined'

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.bookings.mine();
      // Sort bookings: newest first
      const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadBookings();
    }
  }, [token]);

  const handleCompleteSession = async (bookingId) => {
    try {
      await api.bookings.complete(bookingId);
      toast.success('Booking marked as completed');
      loadBookings();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-companion-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50">Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-companion-black text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-20">
          <MessageCircle size={48} className="text-white/20 mb-4" />
          <h3 className="text-xl font-bold mb-2">Access Restrained</h3>
          <p className="text-sm text-white/50 max-w-sm mb-6 leading-relaxed">
            Please sign in with your seeker or companion profile to manage your scheduled sessions.
          </p>
        </div>
      </div>
    );
  }

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status?.toLowerCase() === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'declined', label: 'Declined' }
  ];

  return (
    <div className="relative min-h-screen bg-companion-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-28 z-10 relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            My Bookings
          </h1>
          <button 
            onClick={loadBookings}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/8 hover:bg-white/5 px-3 py-2 rounded-xl transition-all"
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Tab Row */}
        <div className="flex border-b border-white/8 overflow-x-auto gap-6 mb-8 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-companion-purple border-companion-purple'
                  : 'text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[120px] bg-white/3 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          /* Empty State */
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white/2 border border-white/5 rounded-2xl">
            <MessageCircle size={40} className="text-white/20 mb-4" />
            <h4 className="text-white font-bold text-base mb-1">No bookings found</h4>
            <p className="text-xs text-white/40 max-w-xs mb-5 font-light">
              You do not have any sessions in this category yet.
            </p>
            {user.role === 'seeker' && (
              <Link href="/browse" className="text-xs font-semibold text-companion-violet hover:underline">
                Start browsing providers →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              // Decide display name based on user role (Seeker sees companion's name, Provider sees seeker's name)
              const isSeeker = user.role === 'seeker';
              const counterPartyName = isSeeker ? (b.provider?.name || 'Companion') : (b.seeker?.name || 'Seeker');
              const counterPartyPhoto = isSeeker 
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' 
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

              const formattedDate = new Date(b.startTime).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const isChatEnabled = b.status?.toLowerCase() === 'accepted' || b.status?.toLowerCase() === 'active';
              const isCompletable = isChatEnabled; // Sessions in accepted/active status can be marked completed

              return (
                <GlassCard key={b._id} className="p-6 border border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-white/12 transition-all">
                  {/* Left part: photo + info */}
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={counterPartyPhoto} 
                      alt={counterPartyName}
                      className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-base leading-none">{counterPartyName}</h4>
                        <span className="text-[10px] text-white/50 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full capitalize">
                          {b.type}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 font-light leading-none">
                        Duration: {b.duration} {b.type === 'hourly' ? 'hour(s)' : b.type === 'daily' ? 'day(s)' : 'month(s)'} · Total: ₹{b.amount?.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-white/40 font-light flex items-center gap-1">
                        <Calendar size={11} className="text-companion-cyan" /> {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Right part: status badge + actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <StatusBadge status={b.status} />
                    
                    {isChatEnabled && (
                      <Link href={`/chat/${b._id}`}>
                        <button className="px-4 py-2 bg-companion-purple hover:bg-companion-purple/90 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all">
                          <MessageCircle size={14} /> Open Chat
                        </button>
                      </Link>
                    )}

                    {isCompletable && (
                      <button
                        onClick={() => handleCompleteSession(b._id)}
                        className="p-2 border border-white/8 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 rounded-xl transition-all"
                        title="Mark Completed"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
