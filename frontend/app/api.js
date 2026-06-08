import axiosInstance from '@/lib/axios';

const API_BASE_URL = 'http://localhost:3001';

// In-memory / localStorage fallback database for seamless demo experience
const MOCK_PROVIDERS = [
  {
    _id: 'p1',
    userId: { _id: 'u_p1', name: 'Aria Song', email: 'aria@companion.io', phone: '1111111111', role: 'provider' },
    bio: 'A gentle listener here to hear your thoughts, share a cozy conversation, and help you wind down after a long day. Specializing in late-night chats, relationship venting, and calming anxiety.',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['Listener', 'Vent Partner', 'Night Owl', 'Virtual BF/GF'],
    hourlyRate: 499,
    dailyRate: 2999,
    monthlyRate: 49999,
    avgRating: 4.9,
    totalReviews: 42,
    isLive: true
  },
  {
    _id: 'p2',
    userId: { _id: 'u_p2', name: 'Kabir Malhotra', email: 'kabir@companion.io', phone: '2222222222', role: 'provider' },
    bio: 'Focused on helping you find clarity, build habits, and stay accountable to your dreams. I combine deep empathy with active listening to help you tackle lifes challenges.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['Life Coach', 'Motivator', 'Listener'],
    hourlyRate: 799,
    dailyRate: 4999,
    monthlyRate: 89999,
    avgRating: 4.8,
    totalReviews: 28,
    isLive: true
  },
  {
    _id: 'p3',
    userId: { _id: 'u_p3', name: 'Zoe Chen', email: 'zoe@companion.io', phone: '3333333333', role: 'provider' },
    bio: 'Let’s team up, play some games, or chat about your favorite anime. Good vibes guaranteed! Always online for quick gaming sessions, casual friendly banter, or just hanging out virtually.',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['Gaming Buddy', 'Virtual BF/GF', 'Study Buddy'],
    hourlyRate: 599,
    dailyRate: 3499,
    monthlyRate: 59999,
    avgRating: 5.0,
    totalReviews: 54,
    isLive: true
  },
  {
    _id: 'p4',
    userId: { _id: 'u_p4', name: 'Rohan Sen', email: 'rohan@companion.io', phone: '4444444444', role: 'provider' },
    bio: 'Need to get something off your chest? I am here to listen without judgment. Vent about your work, relationships, or anything that is bothering you in a completely safe space.',
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['Vent Partner', 'Listener', 'Motivator'],
    hourlyRate: 399,
    dailyRate: 2499,
    monthlyRate: 39999,
    avgRating: 4.7,
    totalReviews: 19,
    isLive: false
  },
  {
    _id: 'p5',
    userId: { _id: 'u_p5', name: 'Elena Rostova', email: 'elena@companion.io', phone: '5555555555', role: 'provider' },
    bio: 'Let’s study together, stay focused, and keep each other motivated through those tough exam weeks. I can help keep you on track, listen to your concerns, or just co-work silently.',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=600'
    ],
    tags: ['Study Buddy', 'Motivator', 'Listener', 'Night Owl'],
    hourlyRate: 499,
    dailyRate: 2999,
    monthlyRate: 49999,
    avgRating: 4.9,
    totalReviews: 31,
    isLive: true
  }
];

// Initialize Mock database in localStorage if not exists
const initMockDB = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('companion_mock_providers')) {
    localStorage.setItem('companion_mock_providers', JSON.stringify(MOCK_PROVIDERS));
  }
  if (!localStorage.getItem('companion_mock_users')) {
    localStorage.setItem('companion_mock_users', JSON.stringify([
      { id: 'u_seeker', name: 'John Seeker', email: 'john@seeker.com', phone: '9999999999', role: 'seeker', isVerified: true },
      { id: 'u_p1', name: 'Aria Song', email: 'aria@companion.io', phone: '1111111111', role: 'provider', isVerified: true },
      { id: 'u_p2', name: 'Kabir Malhotra', email: 'kabir@companion.io', phone: '2222222222', role: 'provider', isVerified: true },
      { id: 'u_p3', name: 'Zoe Chen', email: 'zoe@companion.io', phone: '3333333333', role: 'provider', isVerified: true },
      { id: 'u_p4', name: 'Rohan Sen', email: 'rohan@companion.io', phone: '4444444444', role: 'provider', isVerified: true },
      { id: 'u_p5', name: 'Elena Rostova', email: 'elena@companion.io', phone: '5555555555', role: 'provider', isVerified: true }
    ]));
  }
  if (!localStorage.getItem('companion_mock_bookings')) {
    localStorage.setItem('companion_mock_bookings', JSON.stringify([]));
  }
  if (!localStorage.getItem('companion_mock_messages')) {
    localStorage.setItem('companion_mock_messages', JSON.stringify([]));
  }
};

// Call init helper
initMockDB();

// Helper to get items
const getMockData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const saveMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Axios-based request helper with backend fallback
async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('companion_token') : null;

  try {
    const isFormData = options.body instanceof FormData;
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    };

    if (options.body) {
      config.data = options.body;
    }

    const res = await axiosInstance(config);
    return res.data;
  } catch (error) {
    // If it's a network/server error (server offline or no response), we trigger fallback
    if (!error.response) {
      console.warn(`API request to ${endpoint} failed (network/server offline). Using mock fallback...`, error.message);
      return handleMockFallback(endpoint, options, token);
    }
    
    // Otherwise, it was a real response error from the server (e.g. 400, 403, 404, 500)
    throw new Error(error.response.data?.message || error.message || `API error: ${error.response.status}`);
  }
}

// Transparent client-side fallback implementation
function handleMockFallback(endpoint, options, token) {
  const method = options.method || 'GET';
  const mockUsers = getMockData('companion_mock_users');
  const mockProviders = getMockData('companion_mock_providers');
  const mockBookings = getMockData('companion_mock_bookings');
  const mockMessages = getMockData('companion_mock_messages');

  // Helper to decode a fake JWT (we just store JSON as token in mock mode)
  const getCurrentMockUser = () => {
    if (!token) return null;
    try {
      const session = JSON.parse(token);
      return mockUsers.find(u => u.id === session.userId) || null;
    } catch {
      return null;
    }
  };

  // 1. Auth routes
  if (endpoint.startsWith('/api/auth/register')) {
    const { name, email, phone, password, role } = options.body;
    const existing = mockUsers.find(u => u.email === email.toLowerCase());
    if (existing) throw new Error('User already exists');

    const newUser = {
      id: 'mock_u_' + Date.now(),
      name,
      email: email.toLowerCase(),
      phone,
      role: role || 'seeker',
      isVerified: true
    };
    
    mockUsers.push(newUser);
    saveMockData('companion_mock_users', mockUsers);

    // If provider, create an empty provider profile too
    if (newUser.role === 'provider') {
      const newProfile = {
        _id: 'mock_p_' + Date.now(),
        userId: newUser,
        bio: '',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'],
        tags: [],
        hourlyRate: 0,
        dailyRate: 0,
        monthlyRate: 0,
        avgRating: 0,
        totalReviews: 0,
        isLive: false
      };
      mockProviders.push(newProfile);
      saveMockData('companion_mock_providers', mockProviders);
    }

    const fakeToken = JSON.stringify({ userId: newUser.id, role: newUser.role });
    return { token: fakeToken, user: newUser };
  }

  if (endpoint.startsWith('/api/auth/login')) {
    const { email } = options.body;
    const user = mockUsers.find(u => u.email === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');

    const fakeToken = JSON.stringify({ userId: user.id, role: user.role });
    return { token: fakeToken, user };
  }

  if (endpoint.startsWith('/api/auth/me')) {
    const user = getCurrentMockUser();
    if (!user) throw new Error('Unauthorized');
    return { user };
  }

  // 2. Provider profiles
  if (endpoint.startsWith('/api/providers')) {
    // GET /api/providers/:id (single detail)
    if (method === 'GET' && endpoint.includes('/api/providers/')) {
      const id = endpoint.split('/').pop().split('?')[0];
      const provider = mockProviders.find(p => p._id === id || p.userId._id === id);
      if (!provider) throw new Error('Provider profile not found');
      return provider;
    }

    // PUT /api/providers/toggle-live
    if (method === 'PUT' && endpoint.includes('/toggle-live')) {
      const user = getCurrentMockUser();
      if (!user || user.role !== 'provider') throw new Error('Unauthorized');
      
      const profile = mockProviders.find(p => p.userId._id === user.id);
      if (!profile) throw new Error('Profile not found');

      profile.isLive = !profile.isLive;
      saveMockData('companion_mock_providers', mockProviders);
      return { message: 'Live toggled', isLive: profile.isLive, profile };
    }

    // POST /api/providers/profile (create/update own profile)
    if (method === 'POST' && endpoint.includes('/profile')) {
      const user = getCurrentMockUser();
      if (!user || user.role !== 'provider') throw new Error('Unauthorized');

      let bio, tags, hourlyRate, dailyRate, monthlyRate;
      let photoUrls = [];

      if (options.body instanceof FormData) {
        bio = options.body.get('bio');
        const tagsRaw = options.body.get('tags');
        tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];
        hourlyRate = Number(options.body.get('hourlyRate') || 0);
        dailyRate = Number(options.body.get('dailyRate') || 0);
        monthlyRate = Number(options.body.get('monthlyRate') || 0);
        
        // Simulating mock photos: keep remaining existing photos, and mock newly added ones
        const existingPhotos = options.body.getAll('existingPhotos');
        const newFilesCount = options.body.getAll('photos').length;
        const mockNewPhotos = Array.from({ length: newFilesCount }).map((_, i) => 
          `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=600`
        );
        photoUrls = [...existingPhotos, ...mockNewPhotos];
        if (photoUrls.length === 0) {
          photoUrls = ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'];
        }
      } else {
        const body = options.body || {};
        bio = body.bio;
        tags = body.tags || [];
        hourlyRate = Number(body.hourlyRate || 0);
        dailyRate = Number(body.dailyRate || 0);
        monthlyRate = Number(body.monthlyRate || 0);
      }

      let profileIndex = mockProviders.findIndex(p => p.userId._id === user.id);
      let profile;

      if (profileIndex >= 0) {
        profile = mockProviders[profileIndex];
        profile.bio = bio;
        profile.tags = tags;
        profile.hourlyRate = hourlyRate;
        profile.dailyRate = dailyRate;
        profile.monthlyRate = monthlyRate;
        if (photoUrls.length > 0) profile.photos = photoUrls;
        mockProviders[profileIndex] = profile;
      } else {
        profile = {
          _id: 'mock_p_' + Date.now(),
          userId: user,
          bio,
          photos: photoUrls.length > 0 ? photoUrls : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'],
          tags,
          hourlyRate,
          dailyRate,
          monthlyRate,
          avgRating: 5.0,
          totalReviews: 1,
          isLive: true
        };
        mockProviders.push(profile);
      }

      saveMockData('companion_mock_providers', mockProviders);
      return { message: 'Profile updated successfully', profile };
    }

    // GET /api/providers (list with query filters)
    if (method === 'GET') {
      // Parse query params manually
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const minPrice = Number(urlParams.get('minPrice') || 0);
      const maxPrice = Number(urlParams.get('maxPrice') || Infinity);
      const tagsParam = urlParams.get('tags');
      const isLiveParam = urlParams.get('isLive');

      let filtered = [...mockProviders];

      if (isLiveParam === 'true') {
        filtered = filtered.filter(p => p.isLive === true);
      }
      if (minPrice > 0) {
        filtered = filtered.filter(p => p.hourlyRate >= minPrice);
      }
      if (maxPrice < Infinity && maxPrice > 0) {
        filtered = filtered.filter(p => p.hourlyRate <= maxPrice);
      }
      if (tagsParam) {
        const queryTags = tagsParam.split(',').map(t => t.trim().toLowerCase());
        filtered = filtered.filter(p => 
          p.tags.some(t => queryTags.includes(t.toLowerCase()))
        );
      }

      return {
        total: filtered.length,
        page: 1,
        pages: 1,
        limit: 10,
        data: filtered
      };
    }
  }

  // 3. Bookings
  if (endpoint.startsWith('/api/bookings')) {
    // GET /api/bookings/mine
    if (method === 'GET' && endpoint.includes('/mine')) {
      const user = getCurrentMockUser();
      if (!user) throw new Error('Unauthorized');

      // Populate bookings with seeker and provider details
      return mockBookings
        .filter(b => b.seeker._id === user.id || b.provider._id === user.id)
        .map(b => {
          const seekerUser = mockUsers.find(u => u.id === b.seeker._id || u.id === b.seeker) || b.seeker;
          const providerProfile = mockProviders.find(p => p.userId._id === b.provider || p.userId._id === b.provider._id);
          const providerUser = providerProfile ? providerProfile.userId : (mockUsers.find(u => u.id === b.provider) || b.provider);
          
          return {
            ...b,
            seeker: seekerUser,
            provider: providerUser
          };
        });
    }

    // PUT /api/bookings/:id/accept
    if (method === 'PUT' && endpoint.includes('/accept')) {
      const id = endpoint.split('/')[3];
      const booking = mockBookings.find(b => b._id === id);
      if (!booking) throw new Error('Booking not found');
      booking.status = 'accepted';
      saveMockData('companion_mock_bookings', mockBookings);
      return { message: 'Booking accepted successfully', booking };
    }

    // PUT /api/bookings/:id/decline
    if (method === 'PUT' && endpoint.includes('/decline')) {
      const id = endpoint.split('/')[3];
      const booking = mockBookings.find(b => b._id === id);
      if (!booking) throw new Error('Booking not found');
      booking.status = 'declined';
      saveMockData('companion_mock_bookings', mockBookings);
      return { message: 'Booking declined successfully', booking };
    }

    // PUT /api/bookings/:id/complete
    if (method === 'PUT' && endpoint.includes('/complete')) {
      const id = endpoint.split('/')[3];
      const booking = mockBookings.find(b => b._id === id);
      if (!booking) throw new Error('Booking not found');
      booking.status = 'completed';
      saveMockData('companion_mock_bookings', mockBookings);
      return { message: 'Booking completed successfully', booking };
    }

    // POST /api/bookings (create booking request)
    if (method === 'POST') {
      const user = getCurrentMockUser();
      if (!user) throw new Error('Unauthorized');

      const { provider: providerId, type, duration, startTime } = options.body;
      const targetProvider = mockProviders.find(p => p.userId._id === providerId || p._id === providerId);
      if (!targetProvider) throw new Error('Provider not found');

      // Calculate rates
      let rate = targetProvider.hourlyRate;
      if (type === 'daily') rate = targetProvider.dailyRate || (targetProvider.hourlyRate * 8);
      if (type === 'monthly') rate = targetProvider.monthlyRate || (targetProvider.dailyRate * 25);

      const amount = rate * duration;

      const newBooking = {
        _id: 'mock_b_' + Date.now(),
        seeker: { _id: user.id, name: user.name, email: user.email, phone: user.phone },
        provider: targetProvider.userId,
        type,
        duration,
        startTime,
        amount,
        status: 'pending',
        isPaid: false,
        createdAt: new Date().toISOString()
      };

      mockBookings.push(newBooking);
      saveMockData('companion_mock_bookings', mockBookings);
      return { message: 'Booking created successfully', booking: newBooking };
    }
  }

  // 4. Payments
  if (endpoint.startsWith('/api/payment')) {
    // POST /api/payment/create-order
    if (endpoint.includes('/create-order')) {
      const { bookingId } = options.body;
      const booking = mockBookings.find(b => b._id === bookingId);
      if (!booking) throw new Error('Booking not found');

      return {
        orderId: 'mock_order_' + Date.now(),
        amount: booking.amount * 100, // Razorpay in paise
        currency: 'INR',
        keyId: 'rzp_test_mock'
      };
    }

    // POST /api/payment/verify
    if (endpoint.includes('/verify')) {
      const { bookingId } = options.body;
      const booking = mockBookings.find(b => b._id === bookingId);
      if (!booking) throw new Error('Booking not found');

      booking.isPaid = true;
      booking.status = 'accepted'; // Payment auto-accepts booking
      saveMockData('companion_mock_bookings', mockBookings);
      return {
        success: true,
        message: 'Payment verified successfully',
        booking
      };
    }
  }

  // 5. Messages
  if (endpoint.startsWith('/api/messages')) {
    const bookingId = endpoint.split('/').pop().split('?')[0];
    return mockMessages.filter(m => m.bookingId === bookingId);
  }

  throw new Error(`Endpoint ${endpoint} not supported in mock mode`);
}

// Websocket / Mock Socket helper
export function connectChatSocket(token, bookingId, onMessage, onTyping) {
  if (typeof window === 'undefined') return null;

  try {
    const io = require('socket.io-client');
    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      upgrade: false
    });

    socket.emit('join-room', bookingId);

    socket.on('receive-message', (msg) => {
      onMessage(msg);
    });

    socket.on('typing', (data) => {
      if (data.bookingId === bookingId) {
        onTyping(data.isTyping);
      }
    });

    return socket;
  } catch (err) {
    console.warn("Failed to connect Socket.io server. Initializing local mock WebSocket loop...");
    
    // Mock WebSocket implementation using a loop and intervals
    const mockSocket = {
      emit: (event, payload) => {
        if (event === 'send-message') {
          const { bookingId, senderId, text } = payload;
          const mockMessages = getMockData('companion_mock_messages');
          const newMsg = {
            _id: 'mock_msg_' + Date.now(),
            bookingId,
            sender: senderId,
            text,
            isRead: false,
            createdAt: new Date().toISOString()
          };
          mockMessages.push(newMsg);
          saveMockData('companion_mock_messages', mockMessages);

          // Deliver original message immediately
          onMessage(newMsg);

          // Simulate automatic reply typing/response
          setTimeout(() => {
            onTyping(true);
            setTimeout(() => {
              onTyping(false);
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
              
              // Get the recipient (provider or seeker ID)
              const mockBookings = getMockData('companion_mock_bookings');
              const booking = mockBookings.find(b => b._id === bookingId);
              let replySenderId = 'system';
              if (booking) {
                // If sender was seeker, reply is from provider
                const isSenderSeeker = senderId === (booking.seeker._id || booking.seeker);
                replySenderId = isSenderSeeker 
                  ? (booking.provider._id || booking.provider)
                  : (booking.seeker._id || booking.seeker);
              }

              const replyMsg = {
                _id: 'mock_msg_reply_' + Date.now(),
                bookingId,
                sender: replySenderId,
                text: randomReply,
                isRead: false,
                createdAt: new Date().toISOString()
              };

              const updatedMsgs = getMockData('companion_mock_messages');
              updatedMsgs.push(replyMsg);
              saveMockData('companion_mock_messages', updatedMsgs);
              
              onMessage(replyMsg);
            }, 2000);
          }, 1500);
        }

        if (event === 'typing') {
          // In mock mode, we ignore seeker typing events since there's no remote user,
          // but we simulate provider replies above.
        }
      },
      disconnect: () => {
        console.log("Disconnected mock socket.");
      }
    };
    
    return mockSocket;
  }
}

// Named Exports for API Methods
export const api = {
  auth: {
    register: (userData) => request('/api/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/api/auth/login', { method: 'POST', body: credentials }),
    me: () => request('/api/auth/me')
  },
  providers: {
    list: (filters = {}) => {
      const query = new URLSearchParams();
      if (filters.minPrice) query.append('minPrice', filters.minPrice);
      if (filters.maxPrice) query.append('maxPrice', filters.maxPrice);
      if (filters.tags && filters.tags.length > 0) query.append('tags', filters.tags.join(','));
      if (filters.isLive) query.append('isLive', 'true');
      
      const queryString = query.toString();
      return request(`/api/providers${queryString ? '?' + queryString : ''}`);
    },
    get: (id) => request(`/api/providers/${id}`),
    updateProfile: (profileData) => {
      let isForm = profileData instanceof FormData;
      return request('/api/providers/profile', {
        method: 'POST',
        body: profileData
      });
    },
    toggleLive: () => request('/api/providers/toggle-live', { method: 'PUT' })
  },
  bookings: {
    create: (bookingData) => request('/api/bookings', { method: 'POST', body: bookingData }),
    mine: () => request('/api/bookings/mine'),
    accept: (id) => request(`/api/bookings/${id}/accept`, { method: 'PUT' }),
    decline: (id) => request(`/api/bookings/${id}/decline`, { method: 'PUT' }),
    complete: (id) => request(`/api/bookings/${id}/complete`, { method: 'PUT' })
  },
  payment: {
    createOrder: (bookingId) => request('/api/payment/create-order', { method: 'POST', body: { bookingId } }),
    verify: (paymentData) => request('/api/payment/verify', { method: 'POST', body: paymentData })
  },
  messages: {
    getHistory: (bookingId) => request(`/api/messages/${bookingId}`)
  }
};
