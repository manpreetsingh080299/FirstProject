const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Data store (in production, use a real database)
let tasks = [
  { id: 1, title: 'Learn API development', completed: false, createdAt: new Date() },
  { id: 2, title: 'Build a real project', completed: false, createdAt: new Date() }
];
let nextId = 3;

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to My API! 🚀',
    endpoints: [
      'GET /api/health - Check API status',
      'GET /api/tasks - Get all tasks',
      'POST /api/tasks - Create new task',
      'PUT /api/tasks/:id - Update task',
      'DELETE /api/tasks/:id - Delete task'
    ],
    example: 'Try: curl http://localhost:3001/api/tasks'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString() 
  });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: tasks,
    total: tasks.length
  });
});

// Get single task
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  res.json({
    success: true,
    data: task
  });
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { title, completed = false } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }
  
  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: Boolean(completed),
    createdAt: new Date()
  };
  
  tasks.push(newTask);
  
  res.status(201).json({
    success: true,
    data: newTask
  });
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  if (title !== undefined) {
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title cannot be empty'
      });
    }
    tasks[taskIndex].title = title.trim();
  }
  
  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }
  
  tasks[taskIndex].updatedAt = new Date();
  
  res.json({
    success: true,
    data: tasks[taskIndex]
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedTask,
    message: 'Task deleted successfully'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 API Server is running!');
  console.log(`📍 Local:    http://localhost:${PORT}`);
  console.log(`🏥 Health:   http://localhost:${PORT}/api/health`);
  console.log(`📋 Tasks:    http://localhost:${PORT}/api/tasks`);
  console.log('\n💡 Try these commands:');
  console.log(`   curl http://localhost:${PORT}/api/tasks`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/tasks -H "Content-Type: application/json" -d '{"title":"My new task"}'`);
});

module.exports = app;