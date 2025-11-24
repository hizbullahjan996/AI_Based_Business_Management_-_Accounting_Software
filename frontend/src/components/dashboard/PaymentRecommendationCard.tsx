import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance,
  Schedule,
  Warning,
  CheckCircle,
  Error,
  Info,
  Phone,
  Email,
} from '@mui/icons-material';
import { PaymentRecommendation } from '../../types/ai';

interface Props {
  recommendations: PaymentRecommendation[];
  loading: boolean;
}

const PaymentRecommendationCard: React.FC<Props> = ({ recommendations, loading }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const getCollectionMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('phone')) return <Phone fontSize="small" />;
    if (method.toLowerCase().includes('email')) return <Email fontSize="small" />;
    return <Info fontSize="small" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
            Payment Recommendations
          </Typography>
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Payment Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Smart payment collection strategies based on customer behavior
        </Typography>

        {recommendations.length === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">
              No payment recommendations available. Add customer payment data to receive AI insights.
            </Typography>
          </Alert>
        ) : (
          <List>
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <ListItem key={index} divider={index < recommendations.length - 1}>
                <ListItemIcon>
                  {recommendation.risk_level === 'high' ? (
                    <Error color="error" />
                  ) : recommendation.risk_level === 'medium' ? (
                    <Warning color="warning" />
                  ) : (
                    <CheckCircle color="success" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {recommendation.customer_name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          size="small"
                          label={`${recommendation.risk_level.toUpperCase()} RISK`}
                          color={getRiskColor(recommendation.risk_level)}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={recommendation.priority.toUpperCase()}
                          color={getPriorityColor(recommendation.priority)}
                          variant="filled"
                        />
                      </Box>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          icon={<AccountBalance />}
                          label={`Balance: ${formatCurrency(recommendation.current_credit_balance)}`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          icon={<Schedule />}
                          label={`Pay: ${formatCurrency(recommendation.recommended_payment)}`}
                          color="primary"
                        />
                        <Chip
                          size="small"
                          icon={<Schedule />}
                          label={formatFrequency(recommendation.recommended_frequency)}
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Payment History:</strong> {(recommendation.payment_history_score * 100).toFixed(0)}% on time 
                        ({recommendation.avg_payment_days.toFixed(1)} days avg)
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Strategy:</strong> {recommendation.payment_strategy.approach}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Follow-up:</strong>
                        </Typography>
                        {recommendation.payment_strategy.follow_up_intervals.map((days, idx) => (
                          <Chip
                            key={idx}
                            size="small"
                            label={`${days}d`}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Methods:</strong>
                        </Typography>
                        {recommendation.payment_strategy.collection_methods.map((method, idx) => (
                          <Tooltip key={idx} title={recommendation.payment_strategy.communication_style}>
                            <Chip
                              size="small"
                              icon={getCollectionMethodIcon(method)}
                              label={method.replace('_', ' ')}
                              variant="outlined"
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {recommendations.length > 3 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Showing top 3 recommendations. Total: {recommendations.length} customers
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentRecommendationCard;