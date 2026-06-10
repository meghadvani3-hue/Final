const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const ProviderProfile = require('./models/ProviderProfile');
const Booking = require('./models/Booking');
const Message = require('./models/Message');

const providersData = [
  {
    name: 'Aria Song',
    email: 'aria@companion.io',
    phone: '1111111111',
    password: 'password123',
    role: 'provider',
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
    name: 'Kabir Malhotra',
    email: 'kabir@companion.io',
    phone: '2222222222',
    password: 'password123',
    role: 'provider',
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
    name: 'Zoe Chen',
    email: 'zoe@companion.io',
    phone: '3333333333',
    password: 'password123',
    role: 'provider',
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
    name: 'Rohan Sen',
    email: 'rohan@companion.io',
    phone: '4444444444',
    password: 'password123',
    role: 'provider',
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
    name: 'Elena Rostova',
    email: 'elena@companion.io',
    phone: '5555555555',
    password: 'password123',
    role: 'provider',
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

const seedDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/companion';
    console.log(`Connecting to MongoDB at ${dbURI}...`);
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB. Clearing old database records...');

    // Clear old records
    await User.deleteMany({});
    await ProviderProfile.deleteMany({});
    await Booking.deleteMany({});
    await Message.deleteMany({});
    console.log('Collections cleared.');

    // Create a Seeker user
    const salt = await bcrypt.genSalt(12);
    const seekerPasswordHash = await bcrypt.hash('password123', salt);
    
    const seeker = new User({
      name: 'John Seeker',
      email: 'john@seeker.com',
      phone: '9999999999',
      passwordHash: seekerPasswordHash,
      role: 'seeker',
      isVerified: true
    });
    await seeker.save();
    console.log(`Created Seeker: ${seeker.name} (${seeker.email})`);

    // Create Providers
    for (const p of providersData) {
      const providerPasswordHash = await bcrypt.hash(p.password, salt);
      const user = new User({
        name: p.name,
        email: p.email.toLowerCase(),
        phone: p.phone,
        passwordHash: providerPasswordHash,
        role: 'provider',
        isVerified: true
      });
      await user.save();
      console.log(`Created User: ${user.name} (${user.email})`);

      const profile = new ProviderProfile({
        userId: user._id,
        bio: p.bio,
        photos: p.photos,
        tags: p.tags,
        hourlyRate: p.hourlyRate,
        dailyRate: p.dailyRate,
        monthlyRate: p.monthlyRate,
        isLive: p.isLive,
        avgRating: p.avgRating,
        totalReviews: p.totalReviews
      });
      await profile.save();
      console.log(`Created Profile for ${user.name}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
