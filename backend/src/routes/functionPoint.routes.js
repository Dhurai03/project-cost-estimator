const express = require('express');
const router = express.Router();
const functionPointController = require('../controllers/functionPoint.controller');
const { protect } = require('../middleware/auth.middleware');

// Debug - log controller exports
console.log('📦 FunctionPoint Controller exports:', Object.keys(functionPointController));

// All routes require authentication
router.use(protect);

// Main routes
router.route('/')
  .post(functionPointController.createFunctionPoint)
  .get(functionPointController.getFunctionPoints);

// Stats route
router.get('/stats/summary', functionPointController.getFPStats);

// Individual analysis routes
router.route('/:id')
  .get(functionPointController.getFunctionPoint)
  .put(functionPointController.updateFunctionPoint)
  .delete(functionPointController.deleteFunctionPoint);

module.exports = router;