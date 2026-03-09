const express = require('express');
const router = express.Router();
const analogyController = require('../controllers/analogy.controller');
const { protect } = require('../middleware/auth.middleware');

// Debug - log controller exports
console.log('📦 Analogy Controller exports:', Object.keys(analogyController));

// All routes require authentication
router.use(protect);

// Main routes
router.route('/')
  .post(analogyController.createAnalogy)
  .get(analogyController.getAnalogyAnalyses);

// Find similar projects for a specific project
router.post('/find-similar/:projectId', analogyController.findSimilarProjects);

// Individual analysis routes
router.route('/:id')
  .get(analogyController.getAnalogyAnalysis)
  .put(analogyController.updateAnalogyAnalysis)
  .delete(analogyController.deleteAnalogyAnalysis);

module.exports = router;