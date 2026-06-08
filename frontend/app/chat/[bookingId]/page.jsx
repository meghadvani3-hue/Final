'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { api } from '@/app/api';
import { useAuth } from '@/components/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import ParticleCanvas from '@/components/ParticleCanvas';
import toast from 'react-hot-toast';

export default function Chat() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch booking details and message history
  useEffect(() => {
    async function loadChatContext() {
      try {
        const bookingsList = await api.bookings.mine();
        const activeBooking = bookingsList.find(b => b._id === bookingId);
        if (!activeBooking) {
          toast.error("Booking not found");
          router.push('/bookings');
          return;
        }
        setBooking(activeBooking);

        // Fetch history
        const history = await api.messages.getHistory(bookingId);
        setMessages(history || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chat history");
      }
    }

    if (token && bookingId) {
      loadChatContext();
    }
  }, [bookingId, token, router]);

  // Callback for new messages received via WebSocket
  const handleNewMessage = (msg) => {
    setMessages(prev => {
      if (prev.some(m => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  };

  // Callback for typing indicator status changes
  const handleTypingStatus = (isTyping) => {
    setTyping(isTyping);
  };

  // 2. Establish Socket connection using custom hook
  const { sendMessage, emitTyping } = useSocket(
    bookingId,
    token,
    handleNewMessage,
    handleTypingStatus
  );

  // 3. Scroll to bottom whenever messages list grows or typing indicator toggles
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    sendMessage(inputText.trim(), user.id || user._id);
    setInputText('');
    emitTyping(false);
  };

  const handleTypingInput = (e) => {
    setInputText(e.target.value);
    emitTyping(e.target.value.length > 0);
  };

  if (!user || !booking) {
    return (
      <div className="min-h-screen bg-companion-black text-white flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-companion-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-white/50">Opening secure chat channel...</p>
      </div>
    );
  }

  // Get counterparty details
  const isSeeker = user.role === 'seeker';
  const counterParty = isSeeker ? booking.provider : booking.seeker;
  const counterPartyName = counterParty?.name || 'Companion';
  const counterPartyPhoto = isSeeker 
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' 
    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

  return (
    <div className="fixed inset-0 bg-companion-black text-white flex flex-col overflow-hidden select-none">
      {/* Low density canvas starfield in the background */}
      <ParticleCanvas density="low" color="purple" showHorizon={false} />

      {/* Top Header Bar */}
      <header className="z-10 bg-black/60 border-b border-white/6 backdrop-blur-md px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/bookings')}
            className="text-white/60 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={counterPartyPhoto} 
                alt={counterPartyName}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white leading-none">{counterPartyName}</h4>
              <span className="text-[10px] text-green-400 font-medium leading-none flex items-center gap-0.5 mt-0.5">
                Available Now
              </span>
            </div>
          </div>
        </div>

        {/* Pulse active badge */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 border border-green-500/20 text-green-400 pulse-online">
            <Sparkles size={11} /> Session Active
          </span>
        </div>
      </header>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 z-0 flex flex-col">
        <div className="text-center my-6 space-y-1 shrink-0">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Beginning of conversation</p>
          <p className="text-[9px] text-white/20 font-light">🔒 Chat is encrypted and private. Deleted after completion.</p>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = msg.sender === (user.id || user._id);
            const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={msg._id}
                className={`max-w-[75%] flex flex-col ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div 
                  className={`px-4 py-2.5 text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-[0_2px_12px_rgba(124,58,237,0.2)]'
                      : 'bg-white/6 text-white rounded-2xl rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-white/30 mt-1 font-light">
                  {timeString}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typing && (
            <div className="max-w-[70%] flex flex-col self-start items-start">
              <div className="px-4 py-3 bg-white/6 rounded-2xl rounded-bl-sm border border-white/5 flex items-center gap-1.5 h-9">
                <span className="w-2 h-2 rounded-full bg-white/40 bounce-dot-1" />
                <span className="w-2 h-2 rounded-full bg-white/40 bounce-dot-2" />
                <span className="w-2 h-2 rounded-full bg-white/40 bounce-dot-3" />
              </div>
              <span className="text-[9px] text-white/20 mt-1 font-light italic">typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form Bar */}
      <div className="z-10 bg-black/60 border-t border-white/6 backdrop-blur-md px-6 py-4 flex items-center shrink-0">
        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-3">
          <input
            type="text"
            required
            value={inputText}
            onChange={handleTypingInput}
            placeholder="Type a message..."
            className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-companion-purple focus:ring-1 focus:ring-companion-purple transition-all"
          />
          <button
            type="submit"
            className="w-11 h-11 rounded-full bg-companion-purple text-white flex items-center justify-center shadow-lg hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}
