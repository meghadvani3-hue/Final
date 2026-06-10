'use client';

import { useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, query, orderBy, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

export function useSocket(bookingId, token, onMessageReceived, onTypingReceived) {
  const mockTimeoutRef = useRef(null);
  
  // Reactively retrieve user from auth store to bypass manual base64 JWT decoding
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!token || !bookingId || !userId) return;

    let unsubscribeMessages = null;
    let unsubscribeTyping = null;

    try {
      // 1. Subscribe to Firestore messages for this booking in real-time
      const messagesRef = collection(db, 'bookings', bookingId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (onMessageReceived) {
              onMessageReceived({
                _id: data._id,
                bookingId: data.bookingId,
                sender: data.sender,
                text: data.text,
                isRead: data.isRead || false,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
              });
            }
          }
        });
      }, (err) => {
        console.error('Firestore messages subscription failed:', err.message);
        toast.error(`Real-time chat error: ${err.message}`);
        setupMockFallback();
      });

      // 2. Subscribe to typing indicators
      const typingRef = collection(db, 'bookings', bookingId, 'typing');
      unsubscribeTyping = onSnapshot(typingRef, (snapshot) => {
        let isSomeoneTyping = false;
        snapshot.forEach((doc) => {
          // Ignore current user's typing state
          if (doc.id !== userId) {
            const data = doc.data();
            if (data.isTyping) {
              // Ensure status is recent (within 15 seconds) to avoid stuck states
              const updatedAt = new Date(data.updatedAt).getTime();
              if (Date.now() - updatedAt < 15000) {
                isSomeoneTyping = true;
              }
            }
          }
        });
        if (onTypingReceived) {
          onTypingReceived(isSomeoneTyping);
        }
      });

    } catch (err) {
      console.error('Firebase setup error:', err.message);
      toast.error(`Firebase Connection Error: ${err.message}`);
      setupMockFallback();
    }

    function setupMockFallback() {
      console.log('Initializing local mock WebSocket emulation loop.');
      
      // Clean up previous listeners if they were somehow partially active
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTyping) unsubscribeTyping();
    }

    // Clean up connections/listeners on unmount
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTyping) unsubscribeTyping();
      if (mockTimeoutRef.current) clearTimeout(mockTimeoutRef.current);
    };
  }, [bookingId, token, userId, onMessageReceived, onTypingReceived]);

  // Send message using REST API, which saves to MongoDB and updates Firestore
  const sendMessage = async (text, senderId) => {
    if (!bookingId || !text) return;
    try {
      const response = await axiosInstance.post('/api/messages', {
        bookingId,
        text
      });

      // Optimistic Update: Add message to client UI immediately upon successful HTTP response
      if (response.data && onMessageReceived) {
        onMessageReceived(response.data);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    }
  };

  // Emit typing status by writing to Firestore typing subcollection
  const emitTyping = async (isTyping) => {
    if (!userId || !bookingId) return;
    try {
      const typingDocRef = doc(db, 'bookings', bookingId, 'typing', userId);
      await setDoc(typingDocRef, {
        isTyping,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to emit typing state to Firestore:', err.message);
    }
  };

  return {
    sendMessage,
    emitTyping
  };
}
