const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const functionPointRoutes = require('./routes/functionPoint.routes');
const cocomoRoutes = require('./routes/cocomo.routes');
const analogyRoutes = require('./routes/analogy.routes');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const estimateRoutes = require('./routes/estimate.routes');

// Import middleware
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(helmet({
  noCache: true // Enable no-cache headers
}));

const cors = require('cors');

app.use(cors({
  origin: [
    'https://project-cost-estimator.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', "DELETE", 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Disable caching for all routes in development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/function-points', functionPointRoutes);
app.use('/api/cocomo', cocomoRoutes);
app.use('/api/analogy', analogyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;