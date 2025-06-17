// Add this near the top of your Express app configuration
app.set('trust proxy', 1); // Trust first proxy

// Update your rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});

app.use(limiter);

// Update your task creation route with better error handling
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    console.log('=== TASK CREATION REQUEST ===');
    console.log('Headers:', {
      ...req.headers,
      authorization: req.headers.authorization ? '[REDACTED]' : 'none'
    });
    console.log('User:', req.user);
    console.log('Body:', req.body);

    // Validate required fields
    const { title, description, status, priority, dueDate } = req.body;
    
    if (!title) {
      console.log('Validation failed: Title is missing');
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!status) {
      console.log('Validation failed: Status is missing');
      return res.status(400).json({ error: 'Status is required' });
    }
    
    if (!priority) {
      console.log('Validation failed: Priority is missing');
      return res.status(400).json({ error: 'Priority is required' });
    }

    // Create the task with user ID
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id // Make sure to include the user ID
    });

    console.log('Creating task:', task);

    // Save the task
    const savedTask = await task.save();
    console.log('Task created successfully:', savedTask);

    res.status(201).json(savedTask);
  } catch (error) {
    console.error('=== TASK CREATION ERROR ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(400).json({ 
      error: 'Failed to create task',
      details: error.message 
    });
  }
}); 