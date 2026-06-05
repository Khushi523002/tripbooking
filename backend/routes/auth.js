const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email,
        phone: user.phone, isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => { res.json(req.user); });

// @route POST /api/auth/create-admin  — create/promote admin account
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, phone, adminSecret } = req.body;
    if (adminSecret !== (process.env.ADMIN_SECRET || 'wanderquest-admin-2024')) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }
    let user = await User.findOne({ email });
    if (user) {
      // Promote existing user to admin
      user.isAdmin = true;
      await user.save();
      return res.json({
        _id: user._id, name: user.name, email: user.email,
        phone: user.phone, isAdmin: true,
        token: generateToken(user._id),
        message: 'Existing user promoted to admin',
      });
    }
    // Create new admin user
    user = await User.create({ name, email, password, phone, isAdmin: true });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, isAdmin: true,
      token: generateToken(user._id),
      message: 'Admin account created successfully',
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route GET /api/auth/users  — ADMIN: get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route PUT /api/auth/users/:id  — ADMIN: update user (toggle admin, edit details)
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, isAdmin } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route DELETE /api/auth/users/:id  — ADMIN: delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
