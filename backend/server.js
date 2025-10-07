const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const analysisRoutes = require('./routes/analysis');
const s3Routes = require('./routes/s3');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Make upload available to routes
app.locals.upload = upload;

// Routes
app.use('/api/analyze', analysisRoutes);
app.use('/api/s3', s3Routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test Analyzer API running on port ${PORT}`);
  console.log(`📊 AI Provider: ${process.env.AI_PROVIDER || 'anthropic'}`);
});

module.exports = app;
