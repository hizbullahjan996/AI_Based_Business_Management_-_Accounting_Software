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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Inventory,
  People,
  Warning,
  ExpandMore,
  CheckCircle,
  Schedule,
  Target,
} from '@mui/icons-material';
import { BusinessInsight } from '../../types/ai';

interface Props {
  insights: BusinessInsight[];
  loading: boolean;
}

const BusinessInsightsCard: React.FC<Props> = ({ insights, loading }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'profit_optimization':
        return <AttachMoney color="success" />;
      case 'expense_control':
        return <TrendingDown color="error" />;
      case 'inventory_management':
        return <Inventory color="primary" />;
      case 'customer_retention':
        return <People color="secondary" />;
      case 'market_opportunity':
        return <TrendingUp color="success" />;
      case 'market_challenge':
        return <TrendingDown color="error" />;
      default:
        return <Lightbulb color="warning" />;
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

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <Target color="error" />;
      case 'medium': return <Target color="warning" />;
      case 'low': return <Target color="success" />;
      default: return <Target />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
            Business Insights
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
          <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Business Insights
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          AI-powered recommendations to optimize your business performance
        </Typography>

        {insights.length === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">
              No business insights available yet. The AI is analyzing your business data to provide personalized recommendations.
            </Typography>
          </Alert>
        ) : (
          <List>
            {insights.map((insight, index) => (
              <Accordion key={index} disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {getInsightIcon(insight.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {insight.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip
                              size="small"
                              label={insight.priority.toUpperCase()}
                              color={getPriorityColor(insight.priority)}
                              variant="filled"
                            />
                            <Chip
                              size="small"
                              icon={getImpactIcon(insight.impact_potential)}
                              label={`${insight.impact_potential.toUpperCase()} IMPACT`}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {insight.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 6 }}>
                    {insight.current_performance && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Current:</strong> {insight.current_performance}
                      </Typography>
                    )}
                    {insight.target_performance && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Target:</strong> {insight.target_performance}
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Recommended Actions:
                    </Typography>
                    <List dense>
                      {insight.recommendations.map((recommendation, recIndex) => (
                        <ListItem key={recIndex} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={recommendation}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {insight.expected_roi && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.dark">
                          <strong>Expected ROI:</strong> {insight.expected_roi}
                        </Typography>
                      </Box>
                    )}

                    {insight.implementation_difficulty && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Implementation Difficulty:</strong> {insight.implementation_difficulty}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        )}

        {insights.length > 5 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            Showing {Math.min(insights.length, 5)} insights. Total: {insights.length} insights generated
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessInsightsCard;