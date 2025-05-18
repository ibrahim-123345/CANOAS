const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

