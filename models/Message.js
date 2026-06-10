const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Add index to optimize document retrieval and avoid COLLSCAN
MessageSchema.index({ bookingId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
