const Notification = require('../models/notification');
const { connectToDatabase } = require('../config/connectionURI');

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Add new notification
const createNotification = async (req, res) => {
  const { message ,read} = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    await connectToDatabase();
    const newNotification = new Notification({ message, read });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
        await connectToDatabase();

    await Notification.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
        await connectToDatabase();

    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  deleteNotification,
  markAsRead
};