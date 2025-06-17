const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { authenticateUser } = require('./middleware/auth');
const scheduleNotifications = require('./utils/notifications');

// Load environment variables
dotenv.config();

// Robust directory creation to handle ENOTDIR errors
function ensureDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    if (!fs.lstatSync(dirPath).isDirectory()) {
      fs.unlinkSync(dirPath); // Remove file if exists
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('Removed file and created directory:', dirPath);
    }
  } else {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('Created directory:', dirPath);
  }
}

// Define upload directories
const uploadDirs = {
  avatar: path.join(__dirname, 'public', 'avatar'),
  uploads: path.join(__dirname, 'public', 'uploads')
};

// Create all required directories robustly
try {
  // Create public directory first
  const publicDir = path.join(__dirname, 'public');
  ensureDirectory(publicDir);

  // Create upload directories
  Object.values(uploadDirs).forEach(dir => ensureDirectory(dir));
  
  console.log('All required directories created successfully');
} catch (error) {
  console.error('Failed to create required directories:', error);
  process.exit(1); // Exit if we can't create the directories
}

// Debug: Log environment variables
console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginOpenerPolicy: false, // Disable COOP header
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://timely-hummingbird-648821.netlify.app', // Netlify frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Trust proxy for rate limiter
app.set('trust proxy', 1);

// Add detailed request logging middleware
app.use((req, res, next) => {
  console.log('=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('=====================');
  next();
});

app.use(express.json());

// Serve static files from the public directory
const publicPath = path.join(__dirname, '../public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Serve uploaded files (task images)
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve avatar files
const avatarPath = path.join(__dirname, '../public/avatar');
app.use('/avatar', express.static(avatarPath));

// API Documentation route
app.get('/', (req, res) => {
  res.json({
    name: "Todo API",
    version: "1.0.0",
    description: "RESTful API for Todo Application",
    endpoints: {
      auth: {
        register: {
          method: "POST",
          path: "/api/auth/register",
          body: {
            email: "string (required)",
            password: "string (required)"
          },
          description: "Register a new user"
        },
        login: {
          method: "POST",
          path: "/api/auth/login",
          body: {
            email: "string (required)",
            password: "string (required)"
          },
          description: "Login to get JWT token"
        }
      },
      tasks: {
        create: {
          method: "POST",
          path: "/api/tasks",
          auth: "Bearer token required",
          body: {
            title: "string (required)",
            description: "string (optional)",
            dueDate: "Date (optional)",
            priority: "string (Low/Medium/High)",
            status: "string (Pending/In Progress/Completed)"
          },
          description: "Create a new task"
        },
        getAll: {
          method: "GET",
          path: "/api/tasks",
          auth: "Bearer token required",
          query: {
            status: "string (optional) - Filter by status",
            sortBy: "string (optional) - Sort by dueDate/createdAt/priority",
            q: "string (optional) - Search in title and description"
          },
          description: "Get all tasks with optional filtering and sorting"
        },
        update: {
          method: "PUT",
          path: "/api/tasks/:id",
          auth: "Bearer token required",
          body: "Same as create task (all fields optional)",
          description: "Update an existing task"
        },
        delete: {
          method: "DELETE",
          path: "/api/tasks/:id",
          auth: "Bearer token required",
          description: "Delete a task"
        }
      },
      health: {
        method: "GET",
        path: "/api/health",
        description: "Check API health status"
      }
    },
    examples: {
      register: {
        request: {
          method: "POST",
          url: "/api/auth/register",
          body: {
            email: "user@example.com",
            password: "securepassword123"
          }
        }
      },
      createTask: {
        request: {
          method: "POST",
          url: "/api/tasks",
          headers: {
            "Authorization": "Bearer your_jwt_token"
          },
          body: {
            title: "Complete Project",
            description: "Finish the todo app project",
            dueDate: "2024-03-20",
            priority: "High",
            status: "In Progress"
          }
        }
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateUser, taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Task creation endpoint
app.post('/api/tasks', authenticateUser, async (req, res) => {
  try {
    console.log('=== TASK CREATION REQUEST ===');
    console.log('User ID:', req.userId);
    console.log('Request Body:', req.body);
    
    const { title, description, dueDate, priority, category } = req.body;
    
    if (!title) {
      console.log('Validation Error: Title is required');
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      category,
      userId: req.userId
    });

    console.log('Creating task:', task);
    const savedTask = await task.save();
    console.log('Task created successfully:', savedTask);
    
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: 'Failed to create task', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Set port
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';
    console.log('MongoDB URI:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Frontend available at http://localhost:${PORT}`);
    });
    
    // Schedule notifications after server starts
    scheduleNotifications();
  } catch (err) {
    console.error('Failed to start server:', err);
    console.error('Please make sure MongoDB is running and accessible');
    console.error('You can either:');
    console.error('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.error('2. Use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for Vercel
module.exports = app;
