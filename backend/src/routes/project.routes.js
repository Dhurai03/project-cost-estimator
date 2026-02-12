const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateProject } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(validateProject, createProject)
  .get(getProjects);

router.get('/stats/summary', getProjectStats);

router.route('/:id')
  .get(getProject)
  .put(validateProject, updateProject)
  .delete(deleteProject);

module.exports = router;