// Test all controller exports
console.log('🔍 TESTING CONTROLLER EXPORTS\n');

try {
  const authController = require('./src/controllers/auth.controller');
  console.log('✅ Auth Controller exports:', Object.keys(authController));
  if (Object.keys(authController).length === 0) {
    console.log('❌ Auth Controller has no exports!');
  }
} catch (error) {
  console.error('❌ Auth Controller error:', error.message);
}

try {
  const projectController = require('./src/controllers/project.controller');
  console.log('✅ Project Controller exports:', Object.keys(projectController));
  if (Object.keys(projectController).length === 0) {
    console.log('❌ Project Controller has no exports!');
  }
} catch (error) {
  console.error('❌ Project Controller error:', error.message);
}

try {
  const estimateController = require('./src/controllers/estimate.controller');
  console.log('✅ Estimate Controller exports:', Object.keys(estimateController));
  if (Object.keys(estimateController).length === 0) {
    console.log('❌ Estimate Controller has no exports!');
  }
} catch (error) {
  console.error('❌ Estimate Controller error:', error.message);
}

console.log('\n🔍 TESTING MIDDLEWARE\n');

try {
  const authMiddleware = require('./src/middleware/auth.middleware');
  console.log('✅ Auth Middleware exports:', Object.keys(authMiddleware));
} catch (error) {
  console.error('❌ Auth Middleware error:', error.message);
}

try {
  const validationMiddleware = require('./src/middleware/validation.middleware');
  console.log('✅ Validation Middleware exports:', Object.keys(validationMiddleware));
} catch (error) {
  console.error('❌ Validation Middleware error:', error.message);
}

console.log('\n🔍 TESTING ROUTES\n');

try {
  const authRoutes = require('./src/routes/auth.routes');
  console.log('✅ Auth Routes loaded successfully');
} catch (error) {
  console.error('❌ Auth Routes error:', error.message);
}

try {
  const projectRoutes = require('./src/routes/project.routes');
  console.log('✅ Project Routes loaded successfully');
} catch (error) {
  console.error('❌ Project Routes error:', error.message);
}

try {
  const estimateRoutes = require('./src/routes/estimate.routes');
  console.log('✅ Estimate Routes loaded successfully');
} catch (error) {
  console.error('❌ Estimate Routes error:', error.message);
}