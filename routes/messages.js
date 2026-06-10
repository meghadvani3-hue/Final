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

// @route   POST /api/messages
// @desc    Send a message (saves to MongoDB and writes to Firestore for real-time sync)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    const senderId = req.user.userId;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Fetch booking details to verify authorization
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isSeeker = booking.seeker.toString() === senderId;
    const isProvider = booking.provider.toString() === senderId;

    if (!isSeeker && !isProvider) {
      return res.status(403).json({ message: 'Authorization denied. Access to these messages is restricted.' });
    }

    const sanitizedText = text.trim().slice(0, 2000);

    // Save to MongoDB
    const newMessage = new Message({
      bookingId,
      sender: senderId,
      text: sanitizedText
    });
    const savedMessage = await newMessage.save();

    // Write to Firebase Firestore for real-time synchronization
    const { db } = require('../config/firebase');
    if (db) {
      try {
        await db.collection('bookings')
          .doc(bookingId)
          .collection('messages')
          .doc(savedMessage._id.toString())
          .set({
            _id: savedMessage._id.toString(),
            bookingId,
            sender: senderId,
            text: sanitizedText,
            isRead: false,
            createdAt: savedMessage.createdAt.toISOString(),
            updatedAt: savedMessage.updatedAt.toISOString()
          });
      } catch (firestoreError) {
        console.error('Failed to sync message to Firestore:', firestoreError.message);
      }
    } else {
      console.warn('Firestore DB not available. Message saved only to MongoDB.');
    }

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
