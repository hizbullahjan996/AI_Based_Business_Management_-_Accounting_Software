import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import { TrendingUp, ShoppingCart } from '@mui/icons-material';

const DemandPredictionCard: React.FC = () => {
  return (
    <Card sx={{
      height: '100%',
      background: 'rgba(255, 255, 255, 0.95)',
      '&:hover': { transform: 'translateY(-4px)', transition: '0.3s' }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            AI Demand Prediction
          </Typography>
          <Chip
            label="AI POWERED"
            size="small"
            sx={{
              ml: 1,
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Item A - Expected Demand (90 days)
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
            1,085 units
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={72}
              sx={{
                flex: 1,
                mr: 2,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50',
                  borderRadius: 4,
                }
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 35 }}>
              72%
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Investment Needed
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Rs 108,500
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Expected Profit
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              Rs 32,550
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            ROI
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
            30.0%
          </Typography>
        </Box>

        <Box sx={{
          p: 2,
          background: '#f0f8ff',
          borderRadius: 1,
          border: '1px solid #e3f2fd'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            💡 AI Recommendation:
          </Typography>
          <Typography variant="body2">
            Focus on high-confidence items for maximum ROI. Consider seasonal stock adjustments.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          sx={{ mt: 2 }}
          startIcon={<ShoppingCart />}
        >
          View Full Predictions
        </Button>
      </CardContent>
    </Card>
  );
};

export default DemandPredictionCard;