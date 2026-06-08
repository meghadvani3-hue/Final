'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthContext';
import { ShieldAlert, ArrowRight, User, Phone, Mail, Lock } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ParticleCanvas from '@/components/ParticleCanvas';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { user, loading: authLoading, login, register } = useAuth();

  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('seeker'); // 'seeker' | 'provider'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect automatically
  useEffect(() => {
    if (user && !authLoading) {
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (user.role === 'provider') {
        router.push('/dashboard');
      } else {
        router.push('/browse');
      }
    }
  }, [user, authLoading, router, redirectUrl]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authTab === 'login') {
        const loggedInUser = await login(email, password);
        const target = redirectUrl || (loggedInUser.role === 'provider' ? '/dashboard' : '/browse');
        router.push(target);
      } else {
        const registeredUser = await register({ name, email, phone, password, role });
        const target = redirectUrl || (registeredUser.role === 'provider' ? '/dashboard/profile' : '/browse');
        router.push(target);
      }
    } catch (err) {
      // Toast notifications are handled within the AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickTest = (roleType) => {
    if (roleType === 'seeker') {
      setEmail('john@seeker.com');
      setPassword('password123');
      setAuthTab('login');
    } else {
      setEmail('aria@companion.io');
      setPassword('password123');
      setAuthTab('login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50">Loading credentials...</p>
      </div>
    );
  }

  return (
    <div style={{ boxshadow: '0px 10px 20px rgba(222, 6, 6, 0.3)' }} className="relative min-h-screen bg-companion-black text-white overflow-hidden flex flex-col items-center justify-center px-4 py-16">
      {/* Dynamic Background */}
      <ParticleCanvas density="high" color="mixed" showHorizon={false} />

      {/* Header Logo */}
      <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-6 z-20">
        <Link href="/" className="flex items-center gap-1 font-bolder tracking-tight text-white hover:opacity-90 transition-opacity">
          <div>
            <img src="/joking_variant1.png" className="object-contain w-50" alt="Companion Logo" />
          </div>
        </Link>
      </header>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10 mt-10"
      >
        <GlassCard style={{ boxshadow: '10px 10px 20px rgba(222, 6, 6, 0.3)' }} className="p-8 border border-white/15 w-full relative shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Headline */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {authTab === 'login' ? 'Welcome Back' : 'Join Companion.io'}
            </h3>
            <p className="text-sm text-white/50">
              {authTab === 'login'
                ? 'Reconnect with your supportive companions'
                : 'Create an account to start booking sessions'}
            </p>
          </div>

          {/* Tab Controls */}
          <div className="flex border-b border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                authTab === 'login'
                  ? 'text-companion-purple border-b-2 border-companion-purple'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register'); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                authTab === 'register'
                  ? 'text-companion-purple border-b-2 border-companion-purple'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Register
            </button>
          </div>

          {/* Developer Sandbox Shortcuts */}
          <div className="mb-6 bg-white/5 border border-white/8 p-3.5 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-companion-cyan font-semibold mb-2">
              <ShieldAlert size={14} />
              Developer Sandbox Options:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickTest('seeker')}
                className="text-[11px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 py-2 px-2.5 rounded-lg text-left transition-colors"
              >
                ⚡ Load Seeker Account
              </button>
              <button
                type="button"
                onClick={() => fillQuickTest('provider')}
                className="text-[11px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 py-2 px-2.5 rounded-lg text-left transition-colors"
              >
                ⚡ Load Companion Account
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {authTab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Role Selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setRole('seeker')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        role === 'seeker' ? 'bg-companion-purple text-white' : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      I want a Companion
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('provider')}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                        role === 'provider' ? 'bg-companion-purple text-white' : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      I am a Companion
                    </button>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
                      <User size={12} /> Full Name
                    </label>
                    <input
                      type="text"
                      required={authTab === 'register'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                    />
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required={authTab === 'register'}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
                <Mail size={12} /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 flex items-center gap-1">
                <Lock size={12} /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-companion-purple hover:bg-companion-purple/90 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {authTab === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
