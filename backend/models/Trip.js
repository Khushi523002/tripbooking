const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  destination: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days
  maxGroupSize: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'moderate', 'hard'], default: 'easy' },
  category: { type: String, enum: ['adventure', 'beach', 'cultural', 'wildlife', 'luxury'], required: true },
  highlights: [{ type: String }],
  included: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  availableDates: [{ type: Date }],
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
