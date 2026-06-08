const Message = require('../models/Message');
const mongoose = require('mongoose');

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Client joins a specific booking room
    socket.on('join-room', (bookingId) => {
      socket.join(bookingId);
      console.log(`Socket ${socket.id} joined room: ${bookingId}`);
    });

    // Client sends message
    socket.on('send-message', async ({ bookingId, senderId, text }) => {
      try {
        // Basic validation
        if (!text || text.trim() === '') {
          socket.emit('message-error', { message: 'Empty message' });
          return;
        }

        if (!bookingId || !senderId) {
          socket.emit('message-error', { message: 'Missing bookingId or senderId' });
          return;
        }

        // Validate ObjectId format to avoid Mongoose CastErrors
        if (!mongoose.Types.ObjectId.isValid(bookingId) || !mongoose.Types.ObjectId.isValid(senderId)) {
          socket.emit('message-error', { message: 'Invalid bookingId or senderId format' });
          return;
        }

        const sanitizedText = text.trim().slice(0, 2000); // limit length

        const message = new Message({
          bookingId,
          sender: senderId,
          text: sanitizedText
        });

        const saved = await message.save();

        // Broadcast message to all users in the booking room (including sender)
        io.to(bookingId).emit('receive-message', saved);

        // Acknowledge to sender that save succeeded
        socket.emit('message-saved', { _id: saved._id, bookingId });
      } catch (err) {
        console.error('Socket message error:', err);
        // Emit full error message back to sender for debugging (can be toned down for production)
        socket.emit('message-error', { message: err.message });
      }
    });

    // Client is typing indicator
    socket.on('typing', ({ bookingId, isTyping }) => {
      // Broadcast to other users in the room
      socket.to(bookingId).emit('typing', { bookingId, isTyping });
    });

    // Socket disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initSocket };
