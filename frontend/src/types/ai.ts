// AI-related TypeScript interfaces
export interface DemandPrediction {
  item_name: string;
  predicted_demand_30d: number;
  predicted_demand_60d: number;
  predicted_demand_90d: number;
  avg_daily_demand: number;
  confidence: number;
  reason: string;
  investment_required?: number;
  expected_profit?: number;
  roi_percentage?: number;
}

export interface PaymentRecommendation {
  customer_id: number;
  customer_name: string;
  current_credit_balance: number;
  recommended_payment: number;
  recommended_frequency: string;
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  payment_history_score: number;
  avg_payment_days: number;
  payment_strategy: {
    approach: string;
    communication_style: string;
    follow_up_intervals: number[];
    collection_methods: string[];
    escalation_threshold: number;
  };
  priority: 'high' | 'medium' | 'low';
  last_updated: string;
}

export interface BusinessInsight {
  type: 'profit_optimization' | 'expense_control' | 'inventory_management' | 'customer_retention' | 'market_opportunity';
  title: string;
  description: string;
  current_performance?: string;
  target_performance?: string;
  recommendations: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
  impact_potential: 'low' | 'medium' | 'high';
  implementation_difficulty?: 'low' | 'medium' | 'high';
  expected_roi?: string;
}

export interface AIModelStatus {
  is_trained: boolean;
  last_trained: string | null;
  data_points_available?: number;
  model_accuracy?: number;
  ready_for_prediction: boolean;
}

export interface AIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface DemandPredictionRequest {
  company_id: number;
  budget?: number;
  days_ahead: number;
}

export interface PaymentRecommendationRequest {
  company_id: number;
}

export interface BusinessInsightRequest {
  company_id: number;
}

export interface BusinessQueryRequest {
  company_id: number;
  query: string;
}

export interface DashboardAIStats {
  total_predictions: number;
  high_confidence_predictions: number;
  payment_risk_customers: number;
  critical_insights: number;
  ai_model_accuracy: number;
  last_ai_update: string;
}