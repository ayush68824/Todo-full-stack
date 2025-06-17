const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Multer setup for photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'avatar');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Manual registration with photo
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const photo = req.file ? `/avatar/${req.file.filename}` : undefined;
    const user = new User({ email, password, name, photo });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: 'Registration failed', details: err.message || err });
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
    console.error('Google auth error:', err);
    res.status(400).json({ error: 'Google authentication failed', details: err.message || err });
  }
});

// Login route with improved error handling
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Login successful:', { userId: user._id });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Profile update with improved error handling
router.put('/profile', authenticateUser, upload.single('photo'), async (req, res) => {
  try {
    console.log('Profile update attempt:', { 
      userId: req.userId,
      hasFile: !!req.file,
      fileName: req.file?.filename,
      body: req.body
    });
    
    if (!req.userId) {
      console.log('Profile update failed: No user ID in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      console.log('Profile update failed: User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const update = {};
    if (req.body.name) {
      update.name = req.body.name;
      console.log('Updating name:', req.body.name);
    }

    if (req.file) {
      try {
        const photoPath = `/avatar/${req.file.filename}`;
        update.photo = photoPath;
        console.log('Photo uploaded successfully:', photoPath);
      } catch (fileError) {
        console.error('Error handling file upload:', fileError);
        return res.status(500).json({ 
          error: 'Failed to process photo upload',
          details: fileError.message 
        });
      }
    }

    console.log('Updating user with data:', update);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!updatedUser) {
      console.log('Profile update failed: User not found after update');
      return res.status(404).json({ error: 'User not found after update' });
    }

    console.log('Profile update successful:', { 
      userId: req.userId,
      updatedFields: Object.keys(update)
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', {
      error: err.message,
      stack: err.stack,
      userId: req.userId
    });
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: err.message
    });
  }
});

module.exports = router;
