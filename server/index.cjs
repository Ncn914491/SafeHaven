const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// __dirname is already available in CommonJS

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.example.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://safehaven-frontend-441114248968.us-central1.run.app']
    : ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true
}));

// Compression and parsing middleware
app.use(compression());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Emergency alerts API endpoints
app.get('/api/alerts', (req, res) => {
  // This would typically fetch from your database
  res.json({ 
    message: 'Emergency alerts endpoint',
    data: []
  });
});

app.post('/api/alerts', (req, res) => {
  // This would typically save to your database
  res.json({ 
    message: 'Alert created successfully',
    data: req.body
  });
});

// SOS endpoints
app.post('/api/sos', (req, res) => {
  // Handle SOS message creation
  res.json({ 
    message: 'SOS message received',
    data: req.body
  });
});

// Shelter endpoints
app.get('/api/shelters', (req, res) => {
  res.json({ 
    message: 'Shelters endpoint',
    data: []
  });
});

// Reports endpoints
app.get('/api/reports', (req, res) => {
  res.json({ 
    message: 'Reports endpoint',
    data: []
  });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SafeHaven server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

module.exports = app;
