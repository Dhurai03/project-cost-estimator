// backend/src/routes/estimate.routes.js
const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimate.controller');
const { protect } = require('../middleware/auth.middleware');

// Debug
console.log('📦 Estimate Controller:', Object.keys(estimateController));

// All routes require authentication
router.use(protect);

// Routes
router.post('/', estimateController.createEstimate);
router.get('/', estimateController.getEstimates);
router.get('/stats/summary', estimateController.getEstimateStats);
router.get('/:id/export/pdf', estimateController.exportEstimatePDF);
router.get('/:id/export/csv', estimateController.exportEstimateCSV);
router.get('/:id', estimateController.getEstimate);
router.delete('/:id', estimateController.deleteEstimate);

module.exports = router;