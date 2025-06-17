const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Multer setup for photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/avatar'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Manual registration with photo
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const photo = req.file ? `/avatar/${req.file.filename}` : undefined;
    const user = new User({ email, password, name, photo });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed', details: err });
  }
});

// Google OAuth registration/login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        email: payload.email,
        name: payload.name,
        photo: payload.picture,
        googleId: payload.sub,
      });
      await user.save();
    }
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user });
  } catch (err) {
    res.status(400).json({ error: 'Google authentication failed', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Profile update (name and photo)
router.put('/profile', upload.single('photo'), async (req, res) => {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const update = { name: req.body.name };
    if (req.file) {
      update.photo = `/avatar/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update profile', details: err.message });
  }
});

module.exports = router;
