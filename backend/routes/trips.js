const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

// @route GET /api/trips  — get all trips with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, featured } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured) query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const trips = await Trip.find(query).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/trips/:id
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/trips  — admin only (simple protect for now)
router.post('/', protect, async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Seed some demo trips
router.post('/seed/demo', async (req, res) => {
  try {
    await Trip.deleteMany({});
    const demos = [
      {
        title: 'Bali Serenity Escape', destination: 'Bali, Indonesia',
        description: 'Experience the magic of Bali — rice terraces, temples, and turquoise waters await.',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        price: 45000, duration: 7, maxGroupSize: 12, category: 'beach',
        difficulty: 'easy', featured: true, rating: 4.8, reviewCount: 124,
        highlights: ['Ubud rice terraces', 'Tanah Lot temple', 'Seminyak beach'],
        included: ['Hotel stay', 'Daily breakfast', 'Airport transfers', 'Guide'],
      },
      {
        title: 'Himalayan Trek Adventure', destination: 'Manali, Himachal Pradesh',
        description: 'Conquer the mighty Himalayas with breathtaking trails and stunning vistas.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        price: 18000, duration: 5, maxGroupSize: 8, category: 'adventure',
        difficulty: 'hard', featured: true, rating: 4.9, reviewCount: 89,
        highlights: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple'],
        included: ['Camping gear', 'All meals', 'Trek guide', 'First aid'],
      },
      {
        title: 'Rajasthan Royal Tour', destination: 'Jaipur & Jodhpur, Rajasthan',
        description: 'Step into a royal era — forts, palaces, and vibrant culture of desert land.',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
        price: 22000, duration: 6, maxGroupSize: 15, category: 'cultural',
        difficulty: 'easy', featured: true, rating: 4.7, reviewCount: 201,
        highlights: ['Amber Fort', 'Mehrangarh Fort', 'Hawa Mahal', 'Camel safari'],
        included: ['Heritage hotel', 'Breakfast & dinner', 'AC transport', 'Guide'],
      },
      {
        title: 'Maldives Luxury Retreat', destination: 'Maldives',
        description: 'Crystal-clear lagoons, overwater bungalows, and absolute tranquility.',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
        price: 120000, duration: 5, maxGroupSize: 2, category: 'luxury',
        difficulty: 'easy', featured: false, rating: 5.0, reviewCount: 45,
        highlights: ['Overwater villa', 'Snorkeling & diving', 'Sunset cruise'],
        included: ['All inclusive', 'Seaplane transfer', 'Water sports', 'Spa'],
      },
      {
        title: 'Jim Corbett Wildlife Safari', destination: 'Jim Corbett, Uttarakhand',
        description: 'Get up close with tigers, elephants and rare birds in India\'s oldest national park.',
        image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
        price: 15000, duration: 3, maxGroupSize: 6, category: 'wildlife',
        difficulty: 'easy', featured: false, rating: 4.6, reviewCount: 67,
        highlights: ['Tiger safari', 'Elephant ride', 'Bird watching', 'Night stay'],
        included: ['Resort stay', 'Jeep safari', 'Forest guide', 'All meals'],
      },
    ];
    const trips = await Trip.insertMany(demos);
    res.json({ message: `${trips.length} trips seeded!`, trips });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
