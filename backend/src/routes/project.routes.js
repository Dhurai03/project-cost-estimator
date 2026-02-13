const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateProject } = require('../middleware/validation.middleware');

// Debug - log what's imported
console.log('📦 Project Controller exports:', Object.keys(projectController));

// All routes require authentication
router.use(protect);

// Project routes
router.route('/')
  .post(validateProject, projectController.createProject)
  .get(projectController.getProjects);

router.get('/stats/summary', projectController.getProjectStats);

router.route('/:id')
  .get(projectController.getProject)
  .put(validateProject, projectController.updateProject)
  .delete(projectController.deleteProject);

module.exports = router;