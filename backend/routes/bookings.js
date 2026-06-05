const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/bookings — create booking
router.post('/', protect, async (req, res) => {
  try {
    const { tripId, travelers, travelDate, specialRequests } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const booking = await Booking.create({
      user: req.user._id, trip: tripId, travelers, travelDate,
      totalAmount: trip.price * travelers, specialRequests, status: 'pending',
    });
    await booking.populate('trip', 'title destination image duration');
    res.status(201).json(booking);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// GET /api/bookings/my — user's bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('trip', 'title destination image price duration')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings/all — ADMIN: all bookings
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('trip', 'title destination image price duration')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/bookings/:id — get single booking (admin or owner)
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trip').populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!req.user.isAdmin && booking.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id — ADMIN: full update (edit any field)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('trip', 'title destination').populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/bookings/:id — ADMIN: delete booking
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    await booking.deleteOne();
    res.json({ message: 'Booking deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/activate — ADMIN: pending → active
router.put('/:id/activate', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'active';
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/confirm — ADMIN: confirm + send trip details
router.put('/:id/confirm', protect, adminOnly, async (req, res) => {
  try {
    const { agencyName, agencyContact, adminNote, meetingPoint, reportingTime,
            guideContact, vehicleDetails, hotelName, hotelContact, emergencyContact,
            itinerarySummary, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('trip', 'title destination').populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'confirmed';
    booking.agencyName = agencyName || '';
    booking.agencyContact = agencyContact || '';
    booking.adminNote = adminNote || '';
    booking.meetingPoint = meetingPoint || '';
    booking.reportingTime = reportingTime || '';
    booking.guideContact = guideContact || '';
    booking.vehicleDetails = vehicleDetails || '';
    booking.hotelName = hotelName || '';
    booking.hotelContact = hotelContact || '';
    booking.emergencyContact = emergencyContact || '';
    booking.itinerarySummary = itinerarySummary || '';
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    booking.notificationRead = false;
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/reject — ADMIN: reject
router.put('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const { adminNote } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'rejected';
    booking.adminNote = adminNote || '';
    booking.notificationRead = false;
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/read — user read notification
router.put('/:id/read', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    booking.notificationRead = true;
    await booking.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/bookings/:id/cancel — user cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
