const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// @route   GET /api/messages/:bookingId
// @desc    Get last 50 messages for a specific booking
// @access  Private
router.get('/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Fetch the booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization: only seeker or provider of the booking can view messages
    const isSeeker = booking.seeker.toString() === req.user.userId;
    const isProvider = booking.provider.toString() === req.user.userId;

    if (!isSeeker && !isProvider) {
      return res.status(403).json({ message: 'Authorization denied. Access to these messages is restricted.' });
    }

    // Retrieve the latest 50 messages, ordered ascending for user display
    const messages = await Message.find({ bookingId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages.reverse());
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
