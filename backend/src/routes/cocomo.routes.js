const express = require('express');
const router = express.Router();
const cocomoController = require('../controllers/cocomo.controller');
const { protect } = require('../middleware/auth.middleware');

// Debug - log controller exports
console.log('📦 COCOMO Controller exports:', Object.keys(cocomoController));

// All routes require authentication
router.use(protect);

// Main routes
router.route('/')
  .post(cocomoController.createCocomo)
  .get(cocomoController.getCocomoAnalyses);

// Stats route
router.get('/stats/summary', cocomoController.getCocomoStats);

// Export route
router.get('/:id/export/pdf', cocomoController.exportCocomoPDF);

// Individual analysis routes
router.route('/:id')
  .get(cocomoController.getCocomoAnalysis)
  .put(cocomoController.updateCocomoAnalysis)
  .delete(cocomoController.deleteCocomoAnalysis);

module.exports = router;