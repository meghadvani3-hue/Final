const express = require('express');
const router = express.Router();
const { getMessaging } = require('../config/firebase');
const { check, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const User = require('../models/User');
const admin = require('../config/firebase');
const ProviderProfile = require('../models/ProviderProfile');
const auth = require('../middleware/auth');

// @route   POST /api/bookings
// @desc    Create a booking (Seeker bookings a Provider)
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('provider', 'Provider user ID is required').notEmpty(),
      check('type', 'Booking type must be hourly, daily, or monthly').isIn(['hourly', 'daily', 'monthly']),
      check('duration', 'Duration must be a positive number').isFloat({ min: 0.1 }),
      check('startTime', 'Start time must be a valid date').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { provider, type, duration, startTime } = req.body;

    // Prevent booking oneself
    if (provider === req.user.userId) {
      return res.status(400).json({ message: 'You cannot book yourself' });
    }

    try {
      // Find provider profile to get rates
      const providerProfile = await ProviderProfile.findOne({ userId: provider });
      if (!providerProfile) {
        return res.status(404).json({ message: 'Provider profile not found' });
      }

      // Calculate amount based on rate type
      let rate = 0;
      if (type === 'hourly') {
        rate = providerProfile.hourlyRate || 0;
      } else if (type === 'daily') {
        rate = providerProfile.dailyRate || 0;
      } else if (type === 'monthly') {
        rate = providerProfile.monthlyRate || 0;
      }

      const amount = rate * duration;

      const booking = new Booking({
        seeker: req.user.userId,
        provider,
        type,
        duration,
        startTime,
        amount,
        status: 'pending'
      });

      await booking.save();
      try {
        const providerUser = await User.findById(provider);
        if (providerUser && providerUser.fcmToken) {
          await getMessaging().send({
            token: providerUser.fcmToken,
            notification: {
              title: '🔔 New Booking Request!',
              body: 'A seeker has booked your service. Open Nexora to respond.'
            }
          });
          console.log('Notification sent to provider');
        }
      } catch (notifErr) {
        console.error('Notification error:', notifErr.message);
      }

      res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET /api/bookings/mine
// @desc    Get all bookings for the logged-in user (as seeker or provider)
// @access  Private
router.get('/mine', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ seeker: req.user.userId }, { provider: req.user.userId }]
    })
      .populate('seeker', 'name email phone')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/bookings/:id/accept
// @desc    Accept a booking request (Provider only)
// @access  Private
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify current user is the provider of this booking
    if (booking.provider.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Authorization denied. Only the provider can accept this booking.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept booking. Current status is ${booking.status}` });
    }

    booking.status = 'accepted';
    await booking.save();

    res.json({ message: 'Booking accepted successfully', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/bookings/:id/decline
// @desc    Decline a booking request (Provider only)
// @access  Private
router.put('/:id/decline', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify current user is the provider of this booking
    if (booking.provider.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Authorization denied. Only the provider can decline this booking.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Cannot decline booking. Current status is ${booking.status}` });
    }

    booking.status = 'declined';
    await booking.save();

    res.json({ message: 'Booking declined successfully', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/bookings/:id/complete
// @desc    Mark a booking as completed (Seeker or Provider)
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify current user is either seeker or provider of this booking
    const isSeeker = booking.seeker.toString() === req.user.userId;
    const isProvider = booking.provider.toString() === req.user.userId;

    if (!isSeeker && !isProvider) {
      return res.status(403).json({ message: 'Authorization denied. Only booking parties can complete this booking.' });
    }

    booking.status = 'completed';
    await booking.save();

    res.json({ message: 'Booking marked as completed', booking });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
