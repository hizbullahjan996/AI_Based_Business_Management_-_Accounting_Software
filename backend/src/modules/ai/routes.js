const express = require('express');
const { authenticate, authorize } = require('../../shared/middleware/auth');
const aiController = require('./controller');

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// Seasonal demand prediction
router.get('/predictions/demand', authorize(['admin', 'manager']), aiController.getDemandPredictions);

// Payment recommendations
router.get('/recommendations/payments', authorize(['admin', 'manager']), aiController.getPaymentRecommendations);

// Business insights
router.get('/insights/business', authorize(['admin', 'manager']), aiController.getBusinessInsights);

// AI-powered business query assistant
router.post('/query', authorize(['admin', 'manager']), aiController.processBusinessQuery);

// Update AI models with new data
router.post('/train', authorize(['admin']), aiController.trainModels);

// Get AI model status
router.get('/status', authorize(['admin']), aiController.getModelStatus);

module.exports = router;