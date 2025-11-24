import axios from 'axios';
import {
  AIResponse,
  DemandPrediction,
  PaymentRecommendation,
  BusinessInsight,
  AIModelStatus,
  DemandPredictionRequest,
  PaymentRecommendationRequest,
  BusinessInsightRequest,
  BusinessQueryRequest
} from '../types/ai';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class AIService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds for AI requests
  });

  constructor() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get demand predictions with budget allocation
   */
  async getDemandPredictions(request: DemandPredictionRequest): Promise<AIResponse<{
    predictions: DemandPrediction[];
    recommendations: any[];
  }>> {
    try {
      const params = new URLSearchParams();
      if (request.budget) {
        params.append('budget', request.budget.toString());
      }

      const response = await this.api.get(`/ai/predictions/demand?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching demand predictions:', error);
      throw error;
    }
  }

  /**
   * Get payment recommendations for customers
   */
  async getPaymentRecommendations(request: PaymentRecommendationRequest): Promise<AIResponse<{
    recommendations: PaymentRecommendation[];
    risk_assessment: {
      overall_risk_level: string;
      total_customers: number;
      high_risk_count: number;
      medium_risk_count: number;
      low_risk_count: number;
      risk_percentage: number;
      total_outstanding_amount: number;
      average_payment_days: number;
      on_time_payment_rate: number;
      recommendations: string[];
    };
  }>> {
    try {
      const response = await this.api.get('/ai/recommendations/payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment recommendations:', error);
      throw error;
    }
  }

  /**
   * Get business insights and recommendations
   */
  async getBusinessInsights(request: BusinessInsightRequest): Promise<AIResponse<{
    insights: BusinessInsight[];
    summary: {
      overall_health: string;
      health_score: number;
      key_metrics: any;
      key_recommendations: string[];
      summary: string;
    };
  }>> {
    try {
      const response = await this.api.get('/ai/insights/business');
      return response.data;
    } catch (error) {
      console.error('Error fetching business insights:', error);
      throw error;
    }
  }

  /**
   * Process natural language business query
   */
  async processBusinessQuery(request: BusinessQueryRequest): Promise<AIResponse<{
    response: string;
    confidence: number;
    data_sources: string[];
  }>> {
    try {
      const response = await this.api.post('/ai/query', {
        query: request.query,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing business query:', error);
      throw error;
    }
  }

  /**
   * Train AI models with new data
   */
  async trainModels(companyId: number): Promise<AIResponse<{
    status: string;
    message: string;
    demand_model: boolean;
    payment_model: boolean;
    business_model: boolean;
  }>> {
    try {
      const response = await this.api.post('/ai/train', {});
      return response.data;
    } catch (error) {
      console.error('Error training models:', error);
      throw error;
    }
  }

  /**
   * Get AI model status
   */
  async getModelStatus(): Promise<AIResponse<{
    status: string;
    last_trained: string | null;
    accuracy: number;
  }>> {
    try {
      const response = await this.api.get('/ai/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching model status:', error);
      throw error;
    }
  }

  /**
   * Check if AI service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.data.status === 'OK';
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }

  /**
   * Get dashboard AI summary statistics
   */
  async getDashboardAIStats(): Promise<{
    total_predictions: number;
    high_confidence_predictions: number;
    payment_risk_customers: number;
    critical_insights: number;
    ai_model_accuracy: number;
    last_ai_update: string;
  }> {
    try {
      // In a real implementation, this would be a dedicated endpoint
      // For now, combine multiple calls to get statistics
      const [demandResponse, paymentResponse, insightsResponse] = await Promise.allSettled([
        this.getDemandPredictions({ company_id: 1, days_ahead: 90 }),
        this.getPaymentRecommendations({ company_id: 1 }),
        this.getBusinessInsights({ company_id: 1 })
      ]);

      let total_predictions = 0;
      let high_confidence_predictions = 0;
      let payment_risk_customers = 0;
      let critical_insights = 0;

      // Process demand predictions
      if (demandResponse.status === 'fulfilled' && demandResponse.value.success) {
        const predictions = demandResponse.value.data.predictions;
        total_predictions = predictions.length;
        high_confidence_predictions = predictions.filter(p => p.confidence > 0.7).length;
      }

      // Process payment recommendations
      if (paymentResponse.status === 'fulfilled' && paymentResponse.value.success) {
        const riskAssessment = paymentResponse.value.data.risk_assessment;
        payment_risk_customers = riskAssessment.high_risk_count;
      }

      // Process business insights
      if (insightsResponse.status === 'fulfilled' && insightsResponse.value.success) {
        const insights = insightsResponse.value.data.insights;
        critical_insights = insights.filter(i => i.priority === 'urgent' || i.priority === 'high').length;
      }

      return {
        total_predictions,
        high_confidence_predictions,
        payment_risk_customers,
        critical_insights,
        ai_model_accuracy: 85.5, // This would come from model status
        last_ai_update: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard AI stats:', error);
      // Return fallback stats
      return {
        total_predictions: 0,
        high_confidence_predictions: 0,
        payment_risk_customers: 0,
        critical_insights: 0,
        ai_model_accuracy: 0,
        last_ai_update: new Date().toISOString()
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;