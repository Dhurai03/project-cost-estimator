const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimate.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateEstimate } = require('../middleware/validation.middleware');

// Debug - log what's imported
console.log('📦 Estimate Controller exports:', Object.keys(estimateController));

// All routes require authentication
router.use(protect);

router.route('/')
  .post(validateEstimate, estimateController.createEstimate)
  .get(estimateController.getEstimates);

router.get('/stats/summary', estimateController.getEstimateStats);

router.route('/:id')
  .get(estimateController.getEstimate)
  .put(validateEstimate, estimateController.updateEstimate)
  .delete(estimateController.deleteEstimate);

router.get('/:id/export/pdf', estimateController.exportEstimatePDF);
router.get('/:id/export/csv', estimateController.exportEstimateCSV);

module.exports = router;