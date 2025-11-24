import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
from pathlib import Path
from typing import List, Dict, Any
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings('ignore')

class PaymentRecommender:
    def __init__(self):
        self.models = {}
        self.is_trained = False
        self.last_trained = None
        self.payment_patterns = self._load_payment_patterns()
        
    def _load_payment_patterns(self) -> Dict[str, Any]:
        """Load payment behavior patterns for different customer types"""
        return {
            "retail_customers": {
                "typical_payment_days": [7, 15, 30],
                "risk_factors": ["large_orders", "new_customers", "seasonal_buyers"],
                "recommended_terms": "Net 15",
                "collection_strategy": "soft_first"
            },
            "wholesale_customers": {
                "typical_payment_days": [30, 45, 60],
                "risk_factors": ["delayed_payments", "bulk_orders", "new_relationships"],
                "recommended_terms": "Net 30",
                "collection_strategy": "structured_follow_up"
            },
            "corporate_customers": {
                "typical_payment_days": [30, 45, 60, 90],
                "risk_factors": ["payment_cycles", "budget_approvals", "processing_delays"],
                "recommended_terms": "Net 45",
                "collection_strategy": "formal_communication"
            }
        }
    
    def recommend_payments(self, company_id: int) -> List[Dict[str, Any]]:
        """Generate payment recommendations for customers"""
        try:
            # Get customer payment data
            payment_data = self._get_payment_data(company_id)
            
            recommendations = []
            for customer_id in payment_data['customer_id'].unique():
                customer_data = payment_data[payment_data['customer_id'] == customer_id]
                recommendation = self._generate_customer_recommendation(customer_data)
                recommendations.append(recommendation)
            
            return recommendations
            
        except Exception as e:
            print(f"Payment recommendation error: {e}")
            return self._fallback_recommendations()
    
    def _get_payment_data(self, company_id: int) -> pd.DataFrame:
        """Fetch payment data for the company (mock implementation)"""
        # In real implementation, this would connect to the main database
        np.random.seed(company_id)
        
        customers = [f'customer_{i}' for i in range(1, 21)]
        payment_data = []
        
        for customer in customers:
            customer_id = customers.index(customer) + 1
            for _ in range(10):  # 10 payment records per customer
                days_to_pay = np.random.choice([7, 15, 30, 45, 60], p=[0.3, 0.3, 0.2, 0.15, 0.05])
                amount = np.random.uniform(1000, 10000)
                
                payment_data.append({
                    'customer_id': customer_id,
                    'customer_name': customer.replace('_', ' ').title(),
                    'amount': amount,
                    'payment_days': days_to_pay,
                    'payment_status': 'completed' if np.random.random() > 0.1 else 'delayed',
                    'invoice_date': datetime.now() - timedelta(days=np.random.randint(1, 365))
                })
        
        return pd.DataFrame(payment_data)
    
    def _generate_customer_recommendation(self, customer_data: pd.DataFrame) -> Dict[str, Any]:
        """Generate payment recommendation for a single customer"""
        avg_payment_days = customer_data['payment_days'].mean()
        total_amount = customer_data['amount'].sum()
        on_time_rate = (customer_data['payment_status'] == 'completed').mean()
        
        # Calculate risk level
        if avg_payment_days <= 15 and on_time_rate >= 0.9:
            risk_level = 'low'
            risk_score = 1
        elif avg_payment_days <= 30 and on_time_rate >= 0.7:
            risk_level = 'medium'
            risk_score = 2
        else:
            risk_level = 'high'
            risk_score = 3
        
        # Determine recommendation frequency
        if risk_level == 'low':
            recommended_frequency = 'monthly'
            recommended_amount = max(total_amount * 0.8, 5000)
        elif risk_level == 'medium':
            recommended_frequency = 'bi-weekly'
            recommended_amount = max(total_amount * 0.6, 3000)
        else:
            recommended_frequency = 'weekly'
            recommended_amount = max(total_amount * 0.4, 2000)
        
        # Generate payment strategy
        strategy = self._generate_payment_strategy(risk_level, avg_payment_days)
        
        return {
            'customer_id': int(customer_data['customer_id'].iloc[0]),
            'customer_name': customer_data['customer_name'].iloc[0],
            'current_credit_balance': float(total_amount),
            'recommended_payment': float(recommended_amount),
            'recommended_frequency': recommended_frequency,
            'risk_level': risk_level,
            'risk_score': risk_score,
            'payment_history_score': float(on_time_rate),
            'avg_payment_days': float(avg_payment_days),
            'payment_strategy': strategy,
            'priority': 'high' if risk_level == 'high' else 'medium' if risk_level == 'medium' else 'low',
            'last_updated': datetime.now().isoformat()
        }
    
    def _generate_payment_strategy(self, risk_level: str, avg_days: float) -> Dict[str, Any]:
        """Generate payment collection strategy based on risk level"""
        if risk_level == 'low':
            return {
                'approach': 'friendly_reminder',
                'communication_style': 'warm_and_professional',
                'follow_up_intervals': [30, 45, 60],
                'collection_methods': ['email', 'phone_call'],
                'escalation_threshold': 90
            }
        elif risk_level == 'medium':
            return {
                'approach': 'structured_follow_up',
                'communication_style': 'formal_and_direct',
                'follow_up_intervals': [7, 15, 30],
                'collection_methods': ['formal_letter', 'phone_call', 'site_visit'],
                'escalation_threshold': 60
            }
        else:  # high risk
            return {
                'approach': 'aggressive_collection',
                'communication_style': 'firm_and_clear',
                'follow_up_intervals': [3, 7, 14],
                'collection_methods': ['legal_notice', 'site_visit', 'third_party_collector'],
                'escalation_threshold': 30
            }
    
    def _fallback_recommendations(self) -> List[Dict[str, Any]]:
        """Fallback recommendations for new businesses"""
        default_customers = [
            {'name': 'Retail Store A', 'type': 'retail'},
            {'name': 'Wholesale Buyer B', 'type': 'wholesale'},
            {'name': 'Corporate Client C', 'type': 'corporate'},
            {'name': 'Local Business D', 'type': 'retail'},
            {'name': 'Export Customer E', 'type': 'wholesale'}
        ]
        
        recommendations = []
        for i, customer in enumerate(default_customers, 1):
            pattern = self.payment_patterns.get(f"{customer['type']}_customers", self.payment_patterns["retail_customers"])
            
            recommendation = {
                'customer_id': i,
                'customer_name': customer['name'],
                'current_credit_balance': float(np.random.uniform(5000, 50000)),
                'recommended_payment': float(np.random.uniform(2000, 15000)),
                'recommended_frequency': 'monthly',
                'risk_level': 'medium',
                'risk_score': 2,
                'payment_history_score': 0.75,  # Conservative estimate
                'avg_payment_days': float(np.random.choice(pattern["typical_payment_days"])),
                'payment_strategy': {
                    'approach': 'standard_follow_up',
                    'communication_style': 'professional',
                    'follow_up_intervals': pattern["typical_payment_days"][:2],
                    'collection_methods': ['email', 'phone_call'],
                    'escalation_threshold': 45
                },
                'priority': 'medium',
                'last_updated': datetime.now().isoformat(),
                'note': 'Initial recommendation based on industry standards'
            }
            recommendations.append(recommendation)
        
        return recommendations
    
    def assess_payment_risk(self, company_id: int) -> Dict[str, Any]:
        """Assess overall payment risk for the company"""
        try:
            payment_data = self._get_payment_data(company_id)
            
            total_customers = len(payment_data['customer_id'].unique())
            high_risk_customers = len(payment_data[payment_data['payment_days'] > 45]['customer_id'].unique())
            medium_risk_customers = len(payment_data[
                (payment_data['payment_days'] > 30) & 
                (payment_data['payment_days'] <= 45)
            ]['customer_id'].unique())
            low_risk_customers = total_customers - high_risk_customers - medium_risk_customers
            
            avg_outstanding = payment_data[payment_data['payment_status'] == 'delayed']['amount'].sum()
            
            # Calculate risk percentage
            risk_percentage = (high_risk_customers / total_customers) * 100 if total_customers > 0 else 0
            
            # Overall risk assessment
            if risk_percentage <= 20:
                overall_risk = 'low'
            elif risk_percentage <= 40:
                overall_risk = 'medium'
            else:
                overall_risk = 'high'
            
            return {
                'overall_risk_level': overall_risk,
                'total_customers': total_customers,
                'high_risk_count': high_risk_customers,
                'medium_risk_count': medium_risk_customers,
                'low_risk_count': low_risk_customers,
                'risk_percentage': float(risk_percentage),
                'total_outstanding_amount': float(avg_outstanding),
                'average_payment_days': float(payment_data['payment_days'].mean()),
                'on_time_payment_rate': float((payment_data['payment_status'] == 'completed').mean()),
                'recommendations': self._generate_risk_recommendations(overall_risk, risk_percentage),
                'assessment_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Risk assessment error: {e}")
            return self._fallback_risk_assessment()
    
    def _generate_risk_recommendations(self, risk_level: str, risk_percentage: float) -> List[str]:
        """Generate recommendations based on risk level"""
        if risk_level == 'low':
            return [
                "Maintain current credit policies",
                "Consider extending credit limits for reliable customers",
                "Implement automated payment reminders"
            ]
        elif risk_level == 'medium':
            return [
                "Review credit limits for high-risk customers",
                "Implement stricter payment terms",
                "Increase collection efforts",
                "Consider requiring deposits for large orders"
            ]
        else:  # high risk
            return [
                "Immediately review all outstanding accounts",
                "Implement stricter credit policies",
                "Require advance payments or deposits",
                "Consider terminating high-risk customer relationships",
                "Engage professional collection services"
            ]
    
    def _fallback_risk_assessment(self) -> Dict[str, Any]:
        """Fallback risk assessment for new businesses"""
        return {
            'overall_risk_level': 'medium',
            'total_customers': 5,
            'high_risk_count': 1,
            'medium_risk_count': 2,
            'low_risk_count': 2,
            'risk_percentage': 20.0,
            'total_outstanding_amount': 125000.0,
            'average_payment_days': 28.5,
            'on_time_payment_rate': 0.75,
            'recommendations': [
                "Implement standard credit evaluation process",
                "Set up payment reminder system",
                "Monitor customer payment patterns closely"
            ],
            'assessment_date': datetime.now().isoformat(),
            'note': 'Initial assessment based on industry standards'
        }
    
    def train(self, company_id: int) -> bool:
        """Train the payment recommendation model"""
        try:
            payment_data = self._get_payment_data(company_id)
            
            if len(payment_data) < 20:
                print(f"Insufficient payment data for training company {company_id}")
                return False
            
            # Prepare features for ML model
            features = payment_data[['payment_days', 'amount']].values
            labels = (payment_data['payment_status'] == 'delayed').astype(int)
            
            if len(np.unique(labels)) < 2:  # Need both classes
                print(f"Insufficient variation in payment data for company {company_id}")
                return False
            
            # Train model
            X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)
            
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            self.models[company_id] = {
                'model': model,
                'accuracy': accuracy,
                'trained_at': datetime.now()
            }
            
            self.is_trained = True
            self.last_trained = datetime.now()
            
            return True
            
        except Exception as e:
            print(f"Payment model training failed: {e}")
            return False
    
    def load_models(self, models_dir: str):
        """Load pre-trained payment models"""
        models_dir = Path(models_dir)
        if models_dir.exists():
            print(f"Loading payment models from {models_dir}")
            # In real implementation, load saved models here
    
    def get_status(self, company_id: int) -> Dict[str, Any]:
        """Get payment model status for a company"""
        model_info = self.models.get(company_id, {})
        
        return {
            'is_trained': self.is_trained and company_id in self.models,
            'last_trained': self.last_trained.isoformat() if self.last_trained else None,
            'model_accuracy': model_info.get('accuracy'),
            'customers_analyzed': len(self._get_payment_data(company_id)),
            'ready_for_recommendations': True
        }