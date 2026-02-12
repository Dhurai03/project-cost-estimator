const express = require('express');
const router = express.Router();
const {
  createEstimate,
  getEstimates,
  getEstimate,
  updateEstimate,
  deleteEstimate,
  exportEstimatePDF,
  exportEstimateCSV,
  getEstimateStats
} = require('../controllers/estimate.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateEstimate } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(validateEstimate, createEstimate)
  .get(getEstimates);

router.get('/stats/summary', getEstimateStats);

router.route('/:id')
  .get(getEstimate)
  .put(validateEstimate, updateEstimate)
  .delete(deleteEstimate);

router.get('/:id/export/pdf', exportEstimatePDF);
router.get('/:id/export/csv', exportEstimateCSV);

module.exports = router;