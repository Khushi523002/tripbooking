const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  travelers: { type: Number, required: true, min: 1 },
  travelDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'confirmed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  specialRequests: { type: String, default: '' },
  // Agency & trip details filled by admin on confirm
  agencyName: { type: String, default: '' },
  agencyContact: { type: String, default: '' },
  meetingPoint: { type: String, default: '' },
  reportingTime: { type: String, default: '' },
  guideContact: { type: String, default: '' },
  vehicleDetails: { type: String, default: '' },
  hotelName: { type: String, default: '' },
  hotelContact: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  itinerarySummary: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  notificationRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
