const express = require('express');
const Task = require('../models/Task');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    } catch (error) {
      console.error('Error in multer filename:', error);
      cb(error);
    }
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
      }
    } catch (error) {
      console.error('Error in multer fileFilter:', error);
      cb(error);
    }
  }
});

// Create task with optional image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.userId,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    };
    
    const task = new Task(taskData);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(400).json({ error: 'Failed to create task', details: err.message });
  }
});

// Read with filtering, sorting, and search
router.get('/', async (req, res) => {
  try {
    const { status, sortBy, q } = req.query;
    const query = { userId: req.userId };
    if (status) query.status = status;
    if (q) query.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') }
    ];
    const sortOptions = {
      'dueDate': 'dueDate',
      'createdAt': 'createdAt',
      'priority': 'priority',
    };
    const tasks = await Task.find(query).sort(sortOptions[sortBy] || 'createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update task with optional image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    };
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Max size is 5MB.';
    }
    return res.status(400).json({ error: message });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
});

module.exports = router;
