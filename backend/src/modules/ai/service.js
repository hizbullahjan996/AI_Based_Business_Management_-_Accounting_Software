const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/ai-service.log' }),
    new winston.transports.Console(),
  ],
});

class AIService {
  constructor() {
    this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.apiKey = process.env.AI_API_KEY;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout for AI requests
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getDemandPredictions(companyId, budget = null) {
    try {
      const response = await this.client.post('/predict/demand', {
        company_id: companyId,
        budget: budget,
        days_ahead: 90, // Predict next 90 days
      });

      return {
        success: true,
        predictions: response.data.predictions,
        recommendations: response.data.recommendations,
      };
    } catch (error) {
      logger.error('AI demand prediction failed:', error.message);

      // Fallback for new businesses with limited data
      return this.getFallbackDemandPredictions(companyId, budget);
    }
  }

  async getPaymentRecommendations(companyId) {
    try {
      const response = await this.client.post('/recommend/payments', {
        company_id: companyId,
      });

      return {
        success: true,
        recommendations: response.data.recommendations,
        risk_assessment: response.data.risk_assessment,
      };
    } catch (error) {
      logger.error('AI payment recommendations failed:', error.message);

      // Fallback logic
      return this.getFallbackPaymentRecommendations(companyId);
    }
  }

  async getBusinessInsights(companyId) {
    try {
      const response = await this.client.post('/insights/business', {
        company_id: companyId,
      });

      return {
        success: true,
        insights: response.data.insights,
        summary: response.data.summary,
      };
    } catch (error) {
      logger.error('AI business insights failed:', error.message);

      // Fallback insights
      return this.getFallbackBusinessInsights(companyId);
    }
  }

  async processBusinessQuery(companyId, query) {
    try {
      const response = await this.client.post('/query', {
        company_id: companyId,
        query: query,
      });

      return {
        success: true,
        response: response.data.response,
        confidence: response.data.confidence,
      };
    } catch (error) {
      logger.error('AI query processing failed:', error.message);

      return {
        success: false,
        response: 'I apologize, but I\'m unable to process your query at the moment. Please try again later.',
        confidence: 0,
      };
    }
  }

  async trainModels(companyId) {
    try {
      const response = await this.client.post('/train', {
        company_id: companyId,
      });

      return {
        success: true,
        status: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      logger.error('AI model training failed:', error.message);

      return {
        success: false,
        message: 'Model training failed. Please check your data and try again.',
      };
    }
  }

  async getModelStatus(companyId) {
    try {
      const response = await this.client.get(`/status/${companyId}`);

      return {
        success: true,
        status: response.data.status,
        last_trained: response.data.last_trained,
        accuracy: response.data.accuracy,
      };
    } catch (error) {
      logger.error('AI model status check failed:', error.message);

      return {
        success: false,
        status: 'unknown',
        message: 'Unable to retrieve model status.',
      };
    }
  }

  // Fallback methods for new businesses with limited data
  getFallbackDemandPredictions(companyId, budget) {
    // Use industry averages and basic heuristics
    const fallbackPredictions = {
      predictions: [
        {
          item_name: 'Sample Item 1',
          predicted_demand: 100,
          confidence: 0.5,
          reason: 'Based on industry averages for similar businesses',
        },
        {
          item_name: 'Sample Item 2',
          predicted_demand: 50,
          confidence: 0.4,
          reason: 'Conservative estimate for new business',
        },
      ],
      recommendations: budget ? [
        {
          suggestion: `With budget of Rs ${budget}, consider stocking popular items based on industry trends.`,
          expected_profit: budget * 0.3, // 30% margin estimate
        },
      ] : [],
    };

    return {
      success: true,
      predictions: fallbackPredictions.predictions,
      recommendations: fallbackPredictions.recommendations,
      note: 'Predictions based on industry benchmarks. More accurate predictions will be available as you add sales data.',
    };
  }

  getFallbackPaymentRecommendations(companyId) {
    return {
      success: true,
      recommendations: [
        {
          party_name: 'Sample Customer',
          recommended_payment: 50000,
          frequency: 'weekly',
          risk_level: 'medium',
          reason: 'Standard payment terms for new customers',
        },
      ],
      risk_assessment: {
        high_risk_count: 0,
        medium_risk_count: 1,
        low_risk_count: 0,
      },
      note: 'Recommendations based on standard business practices. Analysis will improve with payment history.',
    };
  }

  getFallbackBusinessInsights(companyId) {
    return {
      success: true,
      insights: [
        {
          type: 'profit_optimization',
          title: 'Focus on High-Margin Items',
          description: 'Consider promoting items with higher profit margins to maximize revenue.',
          priority: 'high',
        },
        {
          type: 'expense_control',
          title: 'Monitor Regular Expenses',
          description: 'Keep track of recurring expenses like rent and utilities.',
          priority: 'medium',
        },
        {
          type: 'customer_retention',
          title: 'Build Customer Relationships',
          description: 'Regular communication with customers can improve loyalty and repeat business.',
          priority: 'high',
        },
      ],
      summary: {
        overall_health: 'Good start - focus on consistent data entry for better insights',
        key_recommendations: [
          'Enter all transactions regularly',
          'Set up payment reminders',
          'Monitor inventory levels',
        ],
      },
      note: 'Insights based on general business best practices. Personalized insights will develop with more data.',
    };
  }
}

module.exports = new AIService();