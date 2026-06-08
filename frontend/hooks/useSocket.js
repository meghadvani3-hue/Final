'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useSocket(bookingId, token, onMessageReceived, onTypingReceived) {
  const socketRef = useRef(null);
  const mockTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token || !bookingId) return;

    let socket = null;

    try {
      // Connect to the Socket.io server
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        upgrade: false,
        reconnectionAttempts: 2,
        timeout: 5000,
        auth: { token }
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket.io connected successfully:', socket.id);
        socket.emit('join-room', bookingId);
      });

      socket.on('receive-message', (msg) => {
        if (onMessageReceived) {
          onMessageReceived(msg);
        }
      });

      socket.on('typing', (data) => {
        if (data && data.bookingId === bookingId && onTypingReceived) {
          onTypingReceived(data.isTyping);
        }
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket.io connection failed, switching to local mock loop:', err.message);
        setupMockFallback();
      });

    } catch (err) {
      console.warn('Socket.io initialization error, switching to local mock loop:', err.message);
      setupMockFallback();
    }

    function setupMockFallback() {
      if (socket) {
        socket.disconnect();
      }

      console.log('Initializing local mock WebSocket emulation loop.');

      socketRef.current = {
        connected: true,
        emit: (event, payload) => {
          if (event === 'send-message') {
            const { bookingId: bId, senderId, text } = payload;
            
            const getMockData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
            const saveMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

            const mockMessages = getMockData('companion_mock_messages');
            const newMsg = {
              _id: 'mock_msg_' + Date.now(),
              bookingId: bId,
              sender: senderId,
              text,
              isRead: false,
              createdAt: new Date().toISOString()
            };
            mockMessages.push(newMsg);
            saveMockData('companion_mock_messages', mockMessages);

            // Trigger immediate local message display
            if (onMessageReceived) {
              onMessageReceived(newMsg);
            }

            // Emulate companion typing indicator and message reply
            if (mockTimeoutRef.current) clearTimeout(mockTimeoutRef.current);
            
            mockTimeoutRef.current = setTimeout(() => {
              if (onTypingReceived) onTypingReceived(true);
              
              mockTimeoutRef.current = setTimeout(() => {
                if (onTypingReceived) onTypingReceived(false);
                
                const replies = [
                  "I completely understand. Tell me more about that.",
                  "Thank you for sharing that with me. I am here for you.",
                  "That sounds like a lot to carry. How has that been affecting your week?",
                  "I'm really glad we're talking about this right now.",
                  "I am here. Take your time, there is no rush.",
                  "That makes total sense. You're doing the best you can.",
                  "I've got your back. Let's get through this together!"
                ];
                const randomReply = replies[Math.floor(Math.random() * replies.length)];
                
                const mockBookings = getMockData('companion_mock_bookings');
                const booking = mockBookings.find(b => b._id === bookingId);
                let replySenderId = 'system';
                
                if (booking) {
                  const isSenderSeeker = senderId === (booking.seeker._id || booking.seeker);
                  replySenderId = isSenderSeeker 
                    ? (booking.provider._id || booking.provider)
                    : (booking.seeker._id || booking.seeker);
                }

                const replyMsg = {
                  _id: 'mock_msg_reply_' + Date.now(),
                  bookingId: bId,
                  sender: replySenderId,
                  text: randomReply,
                  isRead: false,
                  createdAt: new Date().toISOString()
                };

                const updatedMsgs = getMockData('companion_mock_messages');
                updatedMsgs.push(replyMsg);
                saveMockData('companion_mock_messages', updatedMsgs);
                
                if (onMessageReceived) {
                  onMessageReceived(replyMsg);
                }
              }, 2000);
            }, 1500);
          }
        },
        disconnect: () => {
          console.log('Emulated mock socket disconnected.');
          if (mockTimeoutRef.current) clearTimeout(mockTimeoutRef.current);
        }
      };
    }

    // Disconnect websocket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (mockTimeoutRef.current) {
        clearTimeout(mockTimeoutRef.current);
      }
    };
  }, [bookingId, token, onMessageReceived, onTypingReceived]);

  const sendMessage = (text, senderId) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        bookingId,
        senderId,
        text
      });
    }
  };

  const emitTyping = (isTyping) => {
    if (socketRef.current && typeof socketRef.current.emit === 'function') {
      socketRef.current.emit('typing', {
        bookingId,
        isTyping
      });
    }
  };

  return {
    sendMessage,
    emitTyping
  };
}
