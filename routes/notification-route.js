import { Router } from 'express';
import Notification from '../models/notification.js';
import { ensureAuthenticated } from '../middleware/ensureAuthenticated.js';

const router = Router();

// get all notifications for a user
router.get('/user/:userId', ensureAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  try {
    const notifications = await Notification.find({ user_id: userId }).populate('sender_id').populate('event_id').populate('friendRequestId');
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create a new notification
router.post('/', ensureAuthenticated, async (req, res) => {
  const { id, user_id, type, message, sender_id, event_id, friendRequestId } = req.body;
  const notification = new Notification({
    id,
    user_id,
    type,
    message,
    sender_id,
    event_id,
    friendRequestId
  });
  try {
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// update a notification's read status
router.put('/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.is_read = true;
    const updatedNotification = await notification.save();
    res.json(updatedNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete a notification
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  const id = req.params.id;
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await notification.remove();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
