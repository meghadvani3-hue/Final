'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, User, Calendar, DollarSign, 
  Power, LogOut, Check, X, ShieldCheck, Clock
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/app/api';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch own bookings
      const bookingsData = await api.bookings.mine();
      setBookings(bookingsData || []);

      // 2. Fetch all providers and extract own profile
      const providersList = await api.providers.list();
      const ownProfile = providersList.data?.find(p => p.userId._id === user?.id || p.userId._id === user?._id);
      if (ownProfile) {
        setProfile(ownProfile);
        setIsLive(ownProfile.isLive);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      // Restrict access to providers
      if (user.role !== 'provider') {
        toast.error("Access denied. Seekers cannot view the provider workspace.");
        router.push('/');
        return;
      }
      loadDashboardData();
    }
  }, [token, user, router]);

  const handleToggleLive = async () => {
    try {
      const res = await api.providers.toggleLive();
      setIsLive(res.isLive);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to update live status');
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await api.bookings.accept(id);
      toast.success('Request accepted');
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDeclineRequest = async (id) => {
    try {
      await api.bookings.decline(id);
      toast.success('Request declined');
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-companion-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50">Loading provider dashboard...</p>
      </div>
    );
  }

  // Calculate statistics
  const completedBookings = bookings.filter(b => b.status?.toLowerCase() === 'completed');
  const pendingRequests = bookings.filter(b => b.status?.toLowerCase() === 'pending');
  const activeSessions = bookings.filter(b => b.status?.toLowerCase() === 'active' || b.status?.toLowerCase() === 'accepted');

  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const sessionsDoneCount = completedBookings.length;
  const avgRatingVal = profile?.avgRating || 5.0;

  return (
    <div className="min-h-screen bg-companion-black text-white flex flex-col md:flex-row">
      
      {/* Left Sidebar (240px wide) */}
      <aside className="w-full md:w-60 bg-black border-r border-white/5 shrink-0 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-bold text-xl tracking-tight text-white">
            Provider<span className="w-1.5 h-1.5 rounded-full bg-companion-purple inline-block self-end mb-1"></span>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-companion-purple text-white shadow-md shadow-companion-purple/15"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-white/60 hover:text-white hover:bg-white/5"
            >
              <User size={18} /> My Profile
            </Link>
            <Link 
              href="/bookings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-white/60 hover:text-white hover:bg-white/5"
            >
              <Calendar size={18} /> Bookings
            </Link>
          </nav>
        </div>

        {/* Bottom Status / Logout */}
        <div className="space-y-4 mt-8">
          {/* Availability Toggle Switch */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Live Mode</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                {isLive ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-semibold text-white/80">{isLive ? "You're Online" : "You're Offline"}</span>
              <button
                type="button"
                onClick={handleToggleLive}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                  isLive ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                    isLive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-white/70 hover:text-red-400 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/50 font-light mt-0.5">Welcome, provider {user?.name}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 border border-white/5 space-y-1.5">
            <p className="text-[10px] uppercase text-white/40 tracking-wider font-semibold">Total Earnings</p>
            <h4 className="text-xl md:text-2xl font-black text-white">₹{totalEarnings.toLocaleString()}</h4>
          </GlassCard>

          <GlassCard className="p-5 border border-white/5 space-y-1.5">
            <p className="text-[10px] uppercase text-white/40 tracking-wider font-semibold">Sessions Done</p>
            <h4 className="text-xl md:text-2xl font-black text-white">{sessionsDoneCount}</h4>
          </GlassCard>

          <GlassCard className="p-5 border border-white/5 space-y-1.5">
            <p className="text-[10px] uppercase text-white/40 tracking-wider font-semibold">Avg Rating</p>
            <h4 className="text-xl md:text-2xl font-black text-white">{avgRatingVal.toFixed(1)} ★</h4>
          </GlassCard>

          <GlassCard className="p-5 border border-white/5 space-y-1.5">
            <p className="text-[10px] uppercase text-white/40 tracking-wider font-semibold">Pending Requests</p>
            <h4 className="text-xl md:text-2xl font-black text-companion-cyan">{pendingRequests.length} request(s)</h4>
          </GlassCard>
        </div>

        {/* Grid layout for Pending Requests + Recent bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Incoming Booking Requests (Left side) */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Incoming Requests</h3>
            
            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/8 rounded-2xl bg-white/2">
                <p className="text-white/30 text-xs font-light">No pending request channels</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <GlassCard key={req._id} className="p-5 border border-white/8 space-y-4 hover:border-white/12 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-bold text-sm truncate">{req.seeker?.name}</h4>
                        <span className="text-xs font-bold text-companion-cyan">₹{req.amount}</span>
                      </div>
                      <p className="text-[11px] text-white/50 capitalize font-light">
                        {req.type} session · {req.duration} {req.type === 'hourly' ? 'hour(s)' : req.type === 'daily' ? 'day(s)' : 'month(s)'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        className="py-2 border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <Check size={14} /> Accept ✓
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req._id)}
                        className="py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <X size={14} /> Decline ✗
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Recent Bookings Table (Right side, wider) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Recent Activity</h3>
            
            <GlassCard className="border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-light">
                  <thead className="bg-white/2 border-b border-white/5 text-white/60 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-4">Seeker</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Duration</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b._id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">{b.seeker?.name || 'Customer'}</td>
                        <td className="px-5 py-4 capitalize text-white/60">{b.type}</td>
                        <td className="px-5 py-4 text-white/60">{b.duration} {b.type === 'hourly' ? 'hr(s)' : 'day(s)'}</td>
                        <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                        <td className="px-5 py-4 font-semibold text-white">₹{b.amount?.toLocaleString()}</td>
                      </tr>
                    ))}

                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-5 py-8 text-center text-white/30 font-light">
                          No booking history recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

        </div>
      </main>
    </div>
  );
}
