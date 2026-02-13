const { body } = require('express-validator');

exports.validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .toLowerCase()
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

exports.validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .toLowerCase()
    .trim(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

exports.validateProject = [
  body('name')
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Project name cannot exceed 100 characters'),
  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
  body('projectType')
    .notEmpty().withMessage('Project type is required')
    .isIn(['Software', 'Construction', 'Event', 'Manufacturing']).withMessage('Invalid project type'),
  body('teamSize')
    .notEmpty().withMessage('Team size is required')
    .isInt({ min: 1 }).withMessage('Team size must be at least 1'),
  body('complexityLevel')
    .notEmpty().withMessage('Complexity level is required')
    .isIn(['Low', 'Medium', 'High']).withMessage('Invalid complexity level'),
  body('laborCostPerHour')
    .notEmpty().withMessage('Labor cost per hour is required')
    .isFloat({ min: 0 }).withMessage('Labor cost must be a positive number'),
  body('materialCost')
    .notEmpty().withMessage('Material cost is required')
    .isFloat({ min: 0 }).withMessage('Material cost must be a positive number'),
  body('equipmentCost')
    .notEmpty().withMessage('Equipment cost is required')
    .isFloat({ min: 0 }).withMessage('Equipment cost must be a positive number'),
  body('miscExpenses')
    .notEmpty().withMessage('Miscellaneous expenses are required')
    .isFloat({ min: 0 }).withMessage('Miscellaneous expenses must be a positive number')
];

// ✅ FIX: Add this missing validation
exports.validateEstimate = [
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isMongoId().withMessage('Invalid project ID'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['Draft', 'Final', 'Archived']).withMessage('Invalid status')
];