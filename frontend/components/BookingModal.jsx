'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/app/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import GlassCard from './GlassCard';
import { loadRazorpayScript } from '@/lib/razorpay';

export default function BookingModal({ isOpen, onClose, provider }) {
  const [sessionType, setSessionType] = useState('hourly'); // 'hourly' | 'daily' | 'monthly'
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('input'); // 'input' | 'paying' | 'success'
  const router = useRouter();

  useEffect(() => {
    // Reset duration to 1 when session type changes
    setDuration(1);
  }, [sessionType]);

  if (!provider) return null;

  const { _id, userId, hourlyRate, dailyRate, monthlyRate, photos } = provider;
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


  const handleBookingAndPayment = async () => {
    setLoading(true);
    setPaymentStep('paying');
    try {
      // 1. Create Booking Request
      const bookingRes = await api.bookings.create({
        provider: userId._id || _id,
        type: sessionType,
        duration,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // default: starting tomorrow
      });

      const bookingId = bookingRes.booking._id;

      // 2. Create Razorpay Order
      const orderRes = await api.payment.createOrder(bookingId);
      
      const { orderId, amount, currency, keyId } = orderRes;

      // If keyId is mock or Razorpay script fails, simulate mock payment flow
      if (keyId === 'rzp_test_mock' || !window.Razorpay) {
        toast.success("Sandbox mode active: Simulating payment flow...");
        setTimeout(async () => {
          try {
            await api.payment.verify({
              razorpayOrderId: 'mock_order_id_' + Date.now(),
              razorpayPaymentId: 'mock_pay_id_' + Date.now(),
              razorpaySignature: 'mock_sig_' + Date.now(),
              bookingId
            });
            setPaymentStep('success');
            toast.success("Booking confirmed successfully!");
            setTimeout(() => {
              onClose();
              router.push('/bookings');
            }, 2000);
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
            setPaymentStep('input');
          } finally {
            setLoading(false);
          }
        }, 1500);
        return;
      }

      // 3. Open Real Razorpay Checkout
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load payment gateway. Try again later.");
        setPaymentStep('input');
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Nexora',
        description: `Booking ${name} (${sessionType} session)`,
        image: displayPhoto,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify signature
            const verifyRes = await api.payment.verify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId
            });
            
            if (verifyRes.success) {
              setPaymentStep('success');
              toast.success("Payment successful! Session booked.");
              setTimeout(() => {
                onClose();
                router.push('/bookings');
              }, 2000);
            } else {
              throw new Error("Verification response failed");
            }
          } catch (err) {
            toast.error("Signature verification failed. Please contact support.");
            setPaymentStep('input');
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@companion.io'
        },
        theme: {
          color: '#5e0dea' // purple theme
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setPaymentStep('input');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.message || "Booking creation failed. Are you signed in as a Seeker?");
      setPaymentStep('input');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-md z-10"
          >
            <GlassCard className="p-7 border border-white/12 relative">
              {/* Close Button */}
              <button 
                onClick={onClose}
                disabled={loading}
                className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>

              {paymentStep === 'input' && (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={displayPhoto} 
                      alt={name} 
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-white font-bold text-lg">{name}</h4>
                      <p className="text-xs text-white/50">Book a new companionship session</p>
                    </div>
                  </div>

                  {/* Toggle Session Type */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/60 mb-2">Session Rate Plan</label>
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

                    {/* Duration Selection */}
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

                    {/* Price Breakdown */}
                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2 text-sm font-light">
                      <div className="flex justify-between text-white/50">
                        <span>Rate Plan:</span>
                        <span className="text-white font-normal">₹{rate} / {sessionType === 'hourly' ? 'hr' : sessionType === 'daily' ? 'day' : 'mo'}</span>
                      </div>
                      <div className="flex justify-between text-white/50">
                        <span>Duration:</span>
                        <span className="text-white font-normal">{duration} {sessionType === 'hourly' ? 'hour(s)' : sessionType === 'daily' ? 'day(s)' : 'month(s)'}</span>
                      </div>
                      <hr className="border-white/10 my-2" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-white/70">Total Amount:</span>
                        <span className="text-companion-cyan text-lg font-bold">₹{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      type="button"
                      onClick={handleBookingAndPayment}
                      className="w-full bg-companion-purple hover:bg-companion-purple/90 text-white font-bold py-3.5 rounded-xl shadow-[0_0_25px_rgba(124,58,237,0.35)] transition-all flex items-center justify-center gap-2 mt-4 hover:scale-[1.01]"
                    >
                      Book Now & Pay →
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-1">
                      <Lock size={12} className="text-companion-cyan" />
                      <span>🔒 Secure payment via Razorpay Gateway</span>
                    </div>
                  </div>
                </>
              )}

              {paymentStep === 'paying' && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <Loader2 size={40} className="animate-spin text-companion-cyan" />
                  <h4 className="text-white font-bold text-lg mt-2">Processing Payment...</h4>
                  <p className="text-xs text-white/50 max-w-xs leading-relaxed">
                    Connecting to secure server. Please do not close this window or refresh the page.
                  </p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    ✓
                  </div>
                  <h4 className="text-white font-bold text-xl mt-2">Booking Confirmed!</h4>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles size={13} /> Secure Verification Complete
                  </p>
                  <p className="text-xs text-white/50 max-w-xs mt-1 leading-relaxed">
                    Your session with <strong>{name}</strong> is booked. Redirecting to your active bookings...
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
