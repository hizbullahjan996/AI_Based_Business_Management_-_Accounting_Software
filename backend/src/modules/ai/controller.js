const aiService = require('./service');
const { query, queryOne } = require('../../core/database');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/ai-controller.log' }),
    new winston.transports.Console(),
  ],
});

class AIController {
  async getDemandPredictions(req, res) {
    try {
      const { companyId } = req.user;
      const { budget } = req.query;

      const result = await aiService.getDemandPredictions(companyId, budget);

      // Log the AI request for analytics
      await this.logAIRequest(companyId, 'demand_prediction', result.success);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getDemandPredictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get demand predictions',
        error: error.message,
      });
    }
  }

  async getPaymentRecommendations(req, res) {
    try {
      const { companyId } = req.user;

      const result = await aiService.getPaymentRecommendations(companyId);

      // Log the AI request
      await this.logAIRequest(companyId, 'payment_recommendation', result.success);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getPaymentRecommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment recommendations',
        error: error.message,
      });
    }
  }

  async getBusinessInsights(req, res) {
    try {
      const { companyId } = req.user;

      const result = await aiService.getBusinessInsights(companyId);

      // Log the AI request
      await this.logAIRequest(companyId, 'business_insights', result.success);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getBusinessInsights:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get business insights',
        error: error.message,
      });
    }
  }

  async processBusinessQuery(req, res) {
    try {
      const { companyId } = req.user;
      const { query } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Query is required',
        });
      }

      const result = await aiService.processBusinessQuery(companyId, query);

      // Log the AI request
      await this.logAIRequest(companyId, 'business_query', result.success);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in processBusinessQuery:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process business query',
        error: error.message,
      });
    }
  }

  async trainModels(req, res) {
    try {
      const { companyId } = req.user;

      // Check if user has admin role for training
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can train AI models',
        });
      }

      const result = await aiService.trainModels(companyId);

      // Log the training request
      await this.logAIRequest(companyId, 'model_training', result.success);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in trainModels:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to train AI models',
        error: error.message,
      });
    }
  }

  async getModelStatus(req, res) {
    try {
      const { companyId } = req.user;

      const result = await aiService.getModelStatus(companyId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getModelStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get model status',
        error: error.message,
      });
    }
  }

  // Helper method to log AI requests for analytics
  async logAIRequest(companyId, requestType, success) {
    try {
      const sql = `
        INSERT INTO ai_requests (company_id, request_type, success, created_at)
        VALUES ($1, $2, $3, NOW())
      `;
      await query(sql, [companyId, requestType, success]);
    } catch (error) {
      logger.error('Failed to log AI request:', error);
      // Don't throw error here as it's not critical
    }
  }
}

module.exports = new AIController();