const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');

// Email configuration
const EMAIL_CONFIG = {
  // Default to 9 AM, can be overridden by environment variable
  NOTIFICATION_TIME: process.env.NOTIFICATION_TIME || '0 9 * * *',
  // How many days before due date to send notification
  NOTIFICATION_DAYS_BEFORE: parseInt(process.env.NOTIFICATION_DAYS_BEFORE || '1')
};

// Check if email configuration is available
const isEmailConfigured = () => {
  return process.env.EMAIL_SERVICE && 
         process.env.EMAIL_USER && 
         process.env.EMAIL_PASS;
};

// Create transporter only if email is configured
let transporter = null;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Test email configuration
async function testEmailConfig() {
  if (!isEmailConfigured()) {
    console.log('Email configuration is missing. Please set up EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS environment variables.');
    return false;
  }

  try {
    await transporter.verify();
    console.log('Email configuration is valid!');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error.message);
    return false;
  }
}

function getPriorityColor(priority) {
  switch (priority.toLowerCase()) {
    case 'high':
      return '#ff4444';
    case 'medium':
      return '#ffbb33';
    case 'low':
      return '#00C851';
    default:
      return '#33b5e5';
  }
}

function getStatusEmoji(status) {
  switch (status.toLowerCase()) {
    case 'pending':
      return '⏳';
    case 'in progress':
      return '🚀';
    case 'completed':
      return '✅';
    default:
      return '📝';
  }
}

async function sendNotification(userEmail, task) {
  if (!isEmailConfigured()) {
    console.log('Email notifications are not configured. Skipping notification for:', task.title);
    return;
  }

  try {
    const priorityColor = getPriorityColor(task.priority);
    const statusEmoji = getStatusEmoji(task.status);
    const dueDate = new Date(task.dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `📅 Task Reminder: ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4a90e2;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 5px 5px;
            }
            .task-title {
              font-size: 24px;
              color: #2c3e50;
              margin-bottom: 20px;
            }
            .task-details {
              background-color: white;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .priority {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 3px;
              color: white;
              background-color: ${priorityColor};
            }
            .status {
              display: inline-block;
              margin-left: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Task Reminder</h1>
          </div>
          <div class="content">
            <h2 class="task-title">${task.title}</h2>
            <div class="task-details">
              <p><strong>Due Date:</strong> ${dueDate}</p>
              <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
              <p>
                <strong>Priority:</strong> 
                <span class="priority">${task.priority}</span>
                <span class="status">${statusEmoji} ${task.status}</span>
              </p>
            </div>
            <p>Please make sure to complete this task before the due date.</p>
          </div>
          <div class="footer">
            <p>This is an automated reminder from your Todo App.</p>
            <p>You can manage your tasks at: <a href="${process.env.FRONTEND_URL || '#'}">Todo App</a></p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${userEmail} for task '${task.title}'`);
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}

function scheduleNotifications() {
  if (!isEmailConfigured()) {
    console.log('Email notifications are not configured. Skipping notification scheduler setup.');
    return;
  }

  // Test email configuration before starting scheduler
  testEmailConfig().then(isValid => {
    if (!isValid) {
      console.log('Email configuration test failed. Notifications will not be sent.');
      return;
    }

    // Schedule notifications
    cron.schedule(EMAIL_CONFIG.NOTIFICATION_TIME, async () => {
      try {
        const upcoming = new Date();
        upcoming.setDate(upcoming.getDate() + EMAIL_CONFIG.NOTIFICATION_DAYS_BEFORE);
        upcoming.setHours(23, 59, 59, 999);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasks = await Task.find({
          dueDate: { 
            $gte: today,
            $lte: upcoming 
          },
          status: { $ne: 'Completed' },
        }).populate('userId');

        console.log(`Found ${tasks.length} tasks due in ${EMAIL_CONFIG.NOTIFICATION_DAYS_BEFORE} day(s)`);

        for (const task of tasks) {
          const user = task.userId;
          if (user?.email) {
            await sendNotification(user.email, task);
          }
        }
      } catch (error) {
        console.error('Error in notification scheduler:', error);
      }
    });

    console.log(`Notification scheduler started successfully. Running at: ${EMAIL_CONFIG.NOTIFICATION_TIME}`);
  });
}

module.exports = scheduleNotifications;
