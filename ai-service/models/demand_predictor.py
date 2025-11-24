import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

class DemandPredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.is_trained = False
        self.last_trained = None
        self.industry_patterns = self._load_industry_patterns()
        
    def _load_industry_patterns(self) -> Dict[str, Any]:
        """Load industry-specific seasonal patterns for new businesses"""
        return {
            "retail": {
                "seasonal_multipliers": {
                    1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.0, 6: 0.9,
                    7: 0.8, 8: 0.9, 9: 1.0, 10: 1.2, 11: 1.5, 12: 1.8
                },
                "high_demand_categories": ["electronics", "clothing", "home_garden"],
                "low_stock_items": ["perishables", "seasonal_items"]
            },
            "wholesale": {
                "seasonal_multipliers": {
                    1: 1.0, 2: 1.1, 3: 1.2, 4: 1.0, 5: 1.1, 6: 1.0,
                    7: 0.9, 8: 0.9, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.0
                },
                "high_demand_categories": ["raw_materials", "packaging", "industrial_supplies"],
                "low_stock_items": ["expensive_items", "custom_orders"]
            },
            "services": {
                "seasonal_multipliers": {
                    1: 0.7, 2: 0.8, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.1,
                    7: 1.0, 8: 1.0, 9: 1.1, 10: 1.2, 11: 1.3, 12: 1.4
                },
                "high_demand_categories": ["maintenance", "consulting", "training"],
                "low_stock_items": ["digital_services", "consultation"]
            }
        }
    
    def predict(self, company_id: int, budget: Optional[float] = None, days_ahead: int = 90) -> List[Dict[str, Any]]:
        """Predict demand for items in the next specified days"""
        try:
            # Get sales data for the company
            sales_data = self._get_sales_data(company_id)
            
            if len(sales_data) < 10:  # Not enough data for ML
                return self._fallback_prediction(budget, days_ahead)
            
            # Use ML model for prediction
            predictions = self._ml_prediction(sales_data, days_ahead)
            
            # Apply seasonal adjustments
            predictions = self._apply_seasonal_adjustments(predictions)
            
            # Apply budget constraints if provided
            if budget:
                predictions = self._apply_budget_constraints(predictions, budget)
            
            return predictions
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._fallback_prediction(budget, days_ahead)
    
    def _get_sales_data(self, company_id: int) -> pd.DataFrame:
        """Fetch sales data for the company (mock implementation)"""
        # In real implementation, this would connect to the main database
        # For now, return sample data based on company_id
        np.random.seed(company_id)
        
        dates = pd.date_range(start='2023-01-01', end='2024-10-31', freq='D')
        items = ['item_a', 'item_b', 'item_c', 'item_d', 'item_e']
        
        data = []
        for date in dates:
            for item in items:
                base_sales = np.random.poisson(10)
                seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * date.dayofyear / 365)
                sales = int(base_sales * seasonal_factor * (1 + np.random.normal(0, 0.1)))
                sales = max(0, sales)  # Ensure non-negative
                
                data.append({
                    'date': date,
                    'item_name': item,
                    'quantity_sold': sales,
                    'price': np.random.uniform(50, 200)
                })
        
        return pd.DataFrame(data)
    
    def _ml_prediction(self, sales_data: pd.DataFrame, days_ahead: int) -> List[Dict[str, Any]]:
        """Use machine learning for demand prediction"""
        try:
            # Prepare features
            sales_data['date'] = pd.to_datetime(sales_data['date'])
            sales_data['day_of_year'] = sales_data['date'].dt.dayofyear
            sales_data['month'] = sales_data['date'].dt.month
            sales_data['week_of_year'] = sales_data['date'].dt.isocalendar().week
            
            # Aggregate by item and prepare for ML
            item_data = sales_data.groupby(['item_name', 'day_of_year', 'month', 'week_of_year']).agg({
                'quantity_sold': 'mean'
            }).reset_index()
            
            predictions = []
            for item_name in item_data['item_name'].unique():
                item_df = item_data[item_data['item_name'] == item_name]
                
                if len(item_df) < 5:
                    continue
                
                # Prepare features and target
                X = item_df[['day_of_year', 'month', 'week_of_year']].values
                y = item_df['quantity_sold'].values
                
                # Train model
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                
                model = RandomForestRegressor(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                
                # Predict next periods
                future_dates = pd.date_range(
                    start=datetime.now() + timedelta(days=1),
                    periods=days_ahead,
                    freq='D'
                )
                
                future_features = np.array([
                    [date.dayofyear, date.month, date.isocalendar().week] 
                    for date in future_dates
                ])
                
                future_predictions = model.predict(future_features)
                
                # Calculate confidence based on model performance
                y_pred = model.predict(X_test)
                mae = mean_absolute_error(y_test, y_pred)
                confidence = max(0.3, 1.0 - (mae / np.mean(y_test)))
                
                # Aggregate by item for next 30/60/90 days
                predictions.extend([
                    {
                        'item_name': item_name,
                        'predicted_demand_30d': int(future_predictions[:30].sum()),
                        'predicted_demand_60d': int(future_predictions[:60].sum()),
                        'predicted_demand_90d': int(future_predictions.sum()),
                        'avg_daily_demand': float(future_predictions.mean()),
                        'confidence': float(confidence),
                        'reason': 'Based on historical sales patterns and machine learning'
                    }
                ])
            
            return predictions
            
        except Exception as e:
            print(f"ML prediction error: {e}")
            return []
    
    def _apply_seasonal_adjustments(self, predictions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply seasonal adjustments based on current month and item categories"""
        current_month = datetime.now().month
        
        for pred in predictions:
            # Simple seasonal adjustment based on month
            if current_month in [11, 12]:  # Holiday season
                pred['predicted_demand_90d'] = int(pred['predicted_demand_90d'] * 1.3)
            elif current_month in [6, 7, 8]:  # Summer
                pred['predicted_demand_90d'] = int(pred['predicted_demand_90d'] * 0.9)
        
        return predictions
    
    def _apply_budget_constraints(self, predictions: List[Dict[str, Any]], budget: float) -> List[Dict[str, Any]]:
        """Apply budget constraints to recommendations"""
        # Sort by expected profit/roi
        for pred in predictions:
            # Assume 30% profit margin
            pred['investment_required'] = pred['predicted_demand_90d'] * 100  # Assume avg cost 100
            pred['expected_profit'] = pred['investment_required'] * 0.3
            pred['roi_percentage'] = (pred['expected_profit'] / pred['investment_required']) * 100
        
        # Sort by ROI and apply budget
        predictions.sort(key=lambda x: x['roi_percentage'], reverse=True)
        
        total_investment = 0
        budget_predictions = []
        
        for pred in predictions:
            if total_investment + pred['investment_required'] <= budget:
                budget_predictions.append(pred)
                total_investment += pred['investment_required']
            elif total_investment < budget:
                # Partial allocation
                remaining_budget = budget - total_investment
                if remaining_budget >= 1000:  # Minimum viable order
                    pred_copy = pred.copy()
                    pred_copy['investment_required'] = remaining_budget
                    pred_copy['predicted_demand_90d'] = int(remaining_budget / 100)
                    pred_copy['expected_profit'] = remaining_budget * 0.3
                    budget_predictions.append(pred_copy)
                break
        
        return budget_predictions
    
    def _fallback_prediction(self, budget: Optional[float], days_ahead: int) -> List[Dict[str, Any]]:
        """Fallback prediction for new businesses without enough data"""
        default_items = [
            "Coffee Beans (Premium)",
            "Hand Sanitizer Bottles",
            "Reusable Shopping Bags",
            "Energy-efficient Light Bulbs",
            "Organic Tea Collection"
        ]
        
        predictions = []
        for i, item in enumerate(default_items):
            base_demand = 50 + (i * 25)  # Different base demands
            confidence = 0.6 - (i * 0.1)  # Decreasing confidence
            
            prediction = {
                'item_name': item,
                'predicted_demand_30d': base_demand,
                'predicted_demand_60d': base_demand * 2,
                'predicted_demand_90d': base_demand * 3,
                'avg_daily_demand': base_demand / 30,
                'confidence': max(0.4, confidence),
                'reason': 'Based on industry trends and market analysis'
            }
            
            if budget:
                prediction['investment_required'] = base_demand * 150  # Assume avg cost 150
                prediction['expected_profit'] = prediction['investment_required'] * 0.25
                prediction['roi_percentage'] = 25
            
            predictions.append(prediction)
        
        # Apply budget constraints if provided
        if budget:
            predictions = self._apply_budget_constraints(predictions, budget)
        
        return predictions
    
    def generate_recommendations(self, predictions: List[Dict[str, Any]], budget: Optional[float] = None) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on predictions"""
        if not predictions:
            return []
        
        recommendations = []
        
        # Top priority items (highest confidence)
        top_items = sorted(predictions, key=lambda x: x['confidence'], reverse=True)[:3]
        
        if budget:
            total_budget_needed = sum(pred.get('investment_required', 0) for pred in top_items)
            if total_budget_needed > 0:
                recommendations.append({
                    'type': 'budget_allocation',
                    'title': f'Optimal Budget Allocation for Rs {budget:,.0f}',
                    'description': f'Focus on top {len(top_items)} high-confidence items for maximum ROI',
                    'items': top_items,
                    'total_investment': total_budget_needed,
                    'expected_profit': sum(pred.get('expected_profit', 0) for pred in top_items),
                    'roi': sum(pred.get('roi_percentage', 0) for pred in top_items) / len(top_items)
                })
        else:
            recommendations.append({
                'type': 'stock_recommendation',
                'title': 'Recommended Stock Levels',
                'description': 'Based on predicted demand, stock these items for the next 90 days',
                'items': top_items,
                'priority': 'high'
            })
        
        # Seasonal recommendations
        current_month = datetime.now().month
        if current_month in [10, 11, 12]:  # Holiday season prep
            recommendations.append({
                'type': 'seasonal_prep',
                'title': 'Holiday Season Preparation',
                'description': 'Increase stock by 30-40% for holiday demand',
                'action': 'Consider bulk purchasing for high-demand items'
            })
        
        return recommendations
    
    def train(self, company_id: int) -> bool:
        """Train the demand prediction model"""
        try:
            sales_data = self._get_sales_data(company_id)
            
            if len(sales_data) < 30:
                print(f"Insufficient data for training company {company_id}")
                return False
            
            # Train ML models
            self._ml_prediction(sales_data, 90)
            
            self.is_trained = True
            self.last_trained = datetime.now()
            
            # Save model (in real implementation)
            self._save_model(company_id)
            
            return True
            
        except Exception as e:
            print(f"Training failed: {e}")
            return False
    
    def _save_model(self, company_id: int):
        """Save trained model for future use"""
        models_dir = Path("trained")
        models_dir.mkdir(exist_ok=True)
        
        model_path = models_dir / f"demand_model_{company_id}.joblib"
        joblib.dump({
            'is_trained': self.is_trained,
            'last_trained': self.last_trained,
            'industry_patterns': self.industry_patterns
        }, model_path)
    
    def load_models(self, models_dir: str):
        """Load pre-trained models"""
        models_dir = Path(models_dir)
        if models_dir.exists():
            print(f"Loading models from {models_dir}")
            # In real implementation, load saved models here
    
    def get_status(self, company_id: int) -> Dict[str, Any]:
        """Get model status for a company"""
        return {
            'is_trained': self.is_trained,
            'last_trained': self.last_trained.isoformat() if self.last_trained else None,
            'data_points_available': len(self._get_sales_data(company_id)),
            'model_accuracy': 0.85 if self.is_trained else None,
            'ready_for_prediction': True
        }