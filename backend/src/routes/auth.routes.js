// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin } = require('../middleware/validation.middleware');

// Debug - log what's imported
console.log('📦 Auth Controller exports:', Object.keys(authController));

// Check if controller functions exist
if (!authController.register) {
  console.error('❌ ERROR: authController.register is undefined!');
  process.exit(1);
}
if (!authController.login) {
  console.error('❌ ERROR: authController.login is undefined!');
  process.exit(1);
}
if (!authController.getMe) {
  console.error('❌ ERROR: authController.getMe is undefined!');
  process.exit(1);
}

// Routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;