'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, User, Calendar, 
  Upload, Sparkles, Plus, Image as ImageIcon, Trash2
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/app/api';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const { user, token, updateProfileInState } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  
  // File uploads - unified array of photos: { id, type: 'existing' | 'new', url, file }
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const availableTags = [
    'Listener', 'Vent Partner', 'Gaming Buddy', 
    'Life Coach', 'Study Buddy', 'Virtual BF/GF', 
    'Motivator', 'Night Owl'
  ];

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) return;
        setName(user.name);

        const providersList = await api.providers.list();
        const ownProfile = providersList.data?.find(p => p.userId._id === user.id || p.userId._id === user._id);
        
        if (ownProfile) {
          setBio(ownProfile.bio || '');
          setSelectedTags(ownProfile.tags || []);
          setHourlyRate(ownProfile.hourlyRate || '');
          setDailyRate(ownProfile.dailyRate || '');
          setMonthlyRate(ownProfile.monthlyRate || '');
          const initialPhotos = (ownProfile.photos || []).map(url => ({
            id: url,
            type: 'existing',
            url
          }));
          setPhotos(initialPhotos);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      if (user?.role !== 'provider') {
        toast.error("Seekers cannot configure companion rates.");
        router.push('/');
        return;
      }
      loadProfile();
    }
  }, [token, user, router]);

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 photos.");
      return;
    }

    const newPhotos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      type: 'new',
      file,
      url: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('tags', selectedTags.join(','));
      formData.append('hourlyRate', Number(hourlyRate));
      formData.append('dailyRate', Number(dailyRate));
      formData.append('monthlyRate', Number(monthlyRate));

      // Append remaining existing photo URLs
      photos
        .filter(p => p.type === 'existing')
        .forEach(p => {
          formData.append('existingPhotos', p.url);
        });

      // Append newly uploaded files
      photos
        .filter(p => p.type === 'new')
        .forEach(p => {
          formData.append('photos', p.file);
        });

      const res = await api.providers.updateProfile(formData);
      toast.success(res.message || 'Profile saved successfully!');
      
      // Update display name if changed? The route updates the provider profile.
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-companion-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50">Loading profile editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-companion-black text-white flex flex-col md:flex-row pb-12 md:pb-0">
      
      {/* Left Sidebar (240px wide) */}
      <aside className="w-full md:w-60 bg-black border-r border-white/5 shrink-0 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-1 font-bold text-xl tracking-tight text-white">
            Nexora<span className="w-1.5 h-1.5 rounded-full bg-companion-purple inline-block self-end mb-1"></span>
          </Link>

          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-white/60 hover:text-white hover:bg-white/5"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-companion-purple text-white shadow-md shadow-companion-purple/15"
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
      </aside>

      {/* Main Form Area */}
      <main className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Edit Profile</h1>
          <p className="text-sm text-white/50 font-light mt-0.5">Customize your companion profile, rate plans, and upload photos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Photo Upload Section */}
          <GlassCard className="p-6 border border-white/8 space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80 flex items-center gap-2">
              <ImageIcon size={16} className="text-companion-cyan" /> Profile Photos
            </h3>
            
            <div 
              onClick={triggerFileInput}
              className="border-2 border-dashed border-companion-purple/30 hover:border-companion-purple/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white/2 hover:bg-white/3 transition-all"
            >
              <Upload size={32} className="text-companion-violet mb-3" />
              <p className="text-sm font-medium text-white/90">Drop photos here or click to browse</p>
              <p className="text-[10px] text-white/40 mt-1 font-light">Upload up to 5 photos. High-resolution portrait images work best.</p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>

            {/* Thumbnail previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-5 gap-3 pt-2">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Form details section */}
          <GlassCard className="p-6 border border-white/8 space-y-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Basic Information</h3>
            
            {/* Display Name (Readonly/from user auth for safety) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/60">Display Name</label>
              <input
                type="text"
                disabled
                value={name}
                className="w-full bg-white/2 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/40 cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-white/60">Bio Description</label>
              <textarea
                required
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A gentle listener here to share cozy conversations..."
                className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Specialty Pill Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/60">My Specialties (Tags)</label>
              <div className="flex flex-wrap gap-2.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${
                        isSelected 
                          ? 'bg-companion-purple border-companion-purple text-white shadow-md shadow-companion-purple/15' 
                          : 'bg-white/3 border-white/10 text-white/60 hover:text-white/80'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Rates Section */}
          <GlassCard className="p-6 border border-white/8 space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80">Pricing Rates (₹)</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 bg-white/3 border border-white/5 p-4 rounded-xl">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Hourly Plan</label>
                <input
                  type="number"
                  required
                  placeholder="₹/hr"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 focus:border-companion-purple py-2 text-base text-white font-extrabold focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 bg-white/3 border border-white/5 p-4 rounded-xl">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Daily Plan</label>
                <input
                  type="number"
                  required
                  placeholder="₹/day"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 focus:border-companion-purple py-2 text-base text-white font-extrabold focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 bg-white/3 border border-white/5 p-4 rounded-xl">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Monthly Plan</label>
                <input
                  type="number"
                  required
                  placeholder="₹/month"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  className="w-full bg-transparent border-b border-white/15 focus:border-companion-purple py-2 text-base text-white font-extrabold focus:outline-none transition-all"
                />
              </div>
            </div>
          </GlassCard>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-companion-purple hover:bg-companion-purple/90 text-white font-bold py-4 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            {saving ? 'Saving Profile...' : 'Save Profile →'}
          </button>

        </form>
      </main>

    </div>
  );
}
