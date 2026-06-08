'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Menu, X, ShieldAlert, LogOut, LayoutDashboard, Calendar } from 'lucide-react';
import GlassCard from './GlassCard';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  
  // Registration form states
  const [role, setRole] = useState('seeker'); // 'seeker' | 'provider'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const { user, login, register, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authTab === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, phone, password, role });
      }
      setAuthModalOpen(false);
      // Reset forms
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (err) {
      // toast is triggered inside AuthContext
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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse', href: '/browse' },
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Bookings', href: '/bookings', seekerOnly: true },
    { name: 'Dashboard', href: '/dashboard', providerOnly: true }
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.seekerOnly && (!user || user.role !== 'seeker')) return false;
    if (link.providerOnly && (!user || user.role !== 'provider')) return false;
    return true;
  });

  return (
    <>
      <motion.nav
      style={{ boxshadow: '10px 10px 20px rgba(250, 5, 5, 0.25)' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-black/60 backdrop-blur-md border-b border-white/6' 
            : 'bg-transparent border-b border-transparent box-shadow: 0px 10px 20px rgba(222, 6, 6, 0.3);'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between" >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-bolder tracking-tight text-white">
          <div>
            <img src='/logo2.png' className='object-contain w-50'></img>
          </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {filteredLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${
                  pathname === link.href 
                    ? 'text-companion-cyan font-medium' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {user.role === 'provider' ? 'Companion' : 'Seeker'}
                </span>
                <span className="text-sm text-white/80 font-medium">{user.name}</span>
                {user.role === 'provider' ? (
                  <Link href="/dashboard">
                    <button className="text-white/60 hover:text-white p-2 transition-colors" title="Dashboard">
                      <LayoutDashboard size={18} />
                    </button>
                  </Link>
                ) : (
                  <Link href="/bookings">
                    <button className="text-white/60 hover:text-white p-2 transition-colors" title="My Bookings">
                      <Calendar size={18} />
                    </button>
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-red-400 border border-white/10 hover:border-red-400/30 px-3 py-1.5 rounded-full bg-white/3 transition-colors"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                  className="text-sm font-medium text-white/80 hover:text-white px-4 py-2 border border-transparent hover:border-white/10 rounded-full transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthTab('register'); setAuthModalOpen(true); }}
                  className="text-sm font-medium bg-companion-purple hover:bg-companion-purple/80 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] text-white px-5 py-2.5 rounded-full transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <span className="text-[10px] text-white/55 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {user.name.split(' ')[0]}
              </span>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-companion-dark/95 border-b border-white/10 backdrop-blur-lg overflow-hidden"
              style={{ boxshadow: '0px 10px 20px rgba(222, 6, 6, 0.3)' }}
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {filteredLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium transition-colors ${
                      pathname === link.href ? 'text-companion-cyan' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <hr className="border-white/10 my-1" />

                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm text-white/70" >
                      <span>Logged in as <strong>{user.name}</strong></span>
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{user.role}</span>
                    </div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="w-full py-2.5 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-xl font-medium text-sm transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setMobileMenuOpen(false); setAuthTab('login'); setAuthModalOpen(true); }}
                      className="py-2.5 border border-white/10 hover:bg-white/5 text-white rounded-xl font-medium text-sm transition-all"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setAuthTab('register'); setAuthModalOpen(true); }}
                      className="py-2.5 bg-companion-purple hover:bg-companion-purple/80 text-white rounded-xl font-medium text-sm text-center transition-all"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal (Login / Register) */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-md z-10"
            >
              <GlassCard className="p-8 border border-white/15 w-full relative">
                {/* Close Button */}
                <button 
                  onClick={() => setAuthModalOpen(false)}
                  className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {authTab === 'login' ? 'Welcome Back' : 'Join Companion.io'}
                  </h3>
                  <p className="text-sm text-white/50">
                    {authTab === 'login' 
                      ? 'Reconnect with your supportive companions' 
                      : 'Create an account to start booking sessions'}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6">
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                      authTab === 'login' ? 'text-companion-purple border-b-2 border-companion-purple' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 pb-3 text-sm font-semibold transition-all ${
                      authTab === 'register' ? 'text-companion-purple border-b-2 border-companion-purple' : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Quick Seed Shortcuts */}
                <div className="mb-6 bg-white/5 border border-white/8 p-3 rounded-xl" style={{ boxshadow: '0px 10px 20px rgba(222, 6, 6, 0.3)' }}>
                  <div className="flex items-center gap-1.5 text-xs text-companion-cyan font-semibold mb-2">
                    <ShieldAlert size={14} />
                    Developer Sandbox Options:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fillQuickTest('seeker')}
                      className="text-[11px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 py-1.5 px-2 rounded-lg text-left"
                    >
                      ⚡ Load Seeker Account
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickTest('provider')}
                      className="text-[11px] bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 py-1.5 px-2 rounded-lg text-left"
                    >
                      ⚡ Load Companion Account
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authTab === 'register' && (
                    <>
                      {/* Role selection */}
                      <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => setRole('seeker')}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                            role === 'seeker' ? 'bg-companion-purple text-white' : 'text-white/50 hover:text-white/70'
                          }`}
                        >
                          I want a Provider
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('provider')}
                          className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                            role === 'provider' ? 'bg-companion-purple text-white' : 'text-white/50 hover:text-white/70'
                          }`}
                        >
                          I am a Provider
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-companion-purple hover:bg-companion-purple/90 text-white font-medium py-3 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.01]"
                  >
                    {authTab === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
