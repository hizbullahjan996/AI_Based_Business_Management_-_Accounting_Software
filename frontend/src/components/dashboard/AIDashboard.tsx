import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Lightbulb,
  Warning,
  CheckCircle,
  Schedule,
  AttachMoney,
  Psychology,
  AutoAwesome,
  ExpandMore,
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';
import {
  DemandPrediction,
  PaymentRecommendation,
  BusinessInsight,
  DashboardAIStats
} from '../../types/ai';
import DemandPredictionCard from './DemandPredictionCard';
import PaymentRecommendationCard from './PaymentRecommendationCard';
import BusinessInsightsCard from './BusinessInsightsCard';
import AIQueryAssistant from './AIQueryAssistant';

const AIDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardAIStats | null>(null);
  const [demandPredictions, setDemandPredictions] = useState<DemandPrediction[]>([]);
  const [paymentRecommendations, setPaymentRecommendations] = useState<PaymentRecommendation[]>([]);
  const [businessInsights, setBusinessInsights] = useState<BusinessInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiHealth, setAIHealth] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check AI service health first
      const isHealthy = await aiService.checkHealth();
      setAIHealth(isHealthy);

      if (!isHealthy) {
        setError('AI Service is currently unavailable. Using fallback data.');
      }

      // Load dashboard stats
      const dashboardStats = await aiService.getDashboardAIStats();
      setStats(dashboardStats);

      // Load AI predictions and recommendations in parallel
      const [demandResponse, paymentResponse, insightsResponse] = await Promise.allSettled([
        aiService.getDemandPredictions({ company_id: 1, days_ahead: 90 }),
        aiService.getPaymentRecommendations({ company_id: 1 }),
        aiService.getBusinessInsights({ company_id: 1 })
      ]);

      // Process demand predictions
      if (demandResponse.status === 'fulfilled' && demandResponse.value.success) {
        setDemandPredictions(demandResponse.value.data.predictions);
      }

      // Process payment recommendations
      if (paymentResponse.status === 'fulfilled' && paymentResponse.value.success) {
        setPaymentRecommendations(paymentResponse.value.data.recommendations);
      }

      // Process business insights
      if (insightsResponse.status === 'fulfilled' && insightsResponse.value.success) {
        setBusinessInsights(insightsResponse.value.data.insights);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load AI dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleTrainModels = async () => {
    try {
      await aiService.trainModels(1);
      // Refresh data after training
      loadDashboardData();
    } catch (error) {
      console.error('Model training failed:', error);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* AI Status Alert */}
      {!aiHealth && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Service Limited
          </Typography>
          <Typography variant="body2">
            AI features may have reduced functionality. We recommend checking your internet connection.
          </Typography>
        </Alert>
      )}

      {/* Header with Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <Psychology sx={{ mr: 2, verticalAlign: 'middle' }} />
            AI Business Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get AI-powered insights and predictions for your business
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh Data
          </Button>
          <Button
            variant="contained"
            onClick={handleTrainModels}
            startIcon={<AutoAwesome />}
          >
            Train Models
          </Button>
        </Box>
      </Box>

      {/* AI Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Predictions
                </Typography>
                <Typography variant="h4">
                  {stats.total_predictions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.high_confidence_predictions} high confidence
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Payment Risk Customers
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.payment_risk_customers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Require attention
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Critical Insights
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.critical_insights}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Need immediate action
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  AI Model Accuracy
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.ai_model_accuracy}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(stats.last_ai_update).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Demand Predictions */}
        <Grid item xs={12} lg={6}>
          <DemandPredictionCard 
            predictions={demandPredictions}
            loading={loading}
          />
        </Grid>

        {/* Payment Recommendations */}
        <Grid item xs={12} lg={6}>
          <PaymentRecommendationCard 
            recommendations={paymentRecommendations}
            loading={loading}
          />
        </Grid>

        {/* Business Insights */}
        <Grid item xs={12}>
          <BusinessInsightsCard 
            insights={businessInsights}
            loading={loading}
          />
        </Grid>

        {/* AI Query Assistant */}
        <Grid item xs={12}>
          <AIQueryAssistant />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIDashboard;