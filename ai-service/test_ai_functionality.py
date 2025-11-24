#!/usr/bin/env python3
"""
Test AI Functionality - Demonstrate AI features with sample data
This script shows how the AI system works for new businesses with limited data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import asyncio
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from models.demand_predictor import DemandPredictor
from models.payment_recommender import PaymentRecommender
from models.business_analyzer import BusinessAnalyzer

def test_demand_prediction():
    """Test demand prediction for a new business"""
    print("\n" + "="*60)
    print("TESTING TESTING DEMAND PREDICTION")
    print("="*60)
    
    # Initialize demand predictor
    predictor = DemandPredictor()
    
    # Test for company with limited data (new business)
    company_id = 1
    budget = 300000  # 300k PKR budget
    
    print(f"Company ID: {company_id}")
    print(f"Budget: Rs {budget:,}")
    print(f"Predictions for next 90 days...")
    
    # Get predictions
    predictions = predictor.predict(company_id, budget, 90)
    
    print(f"\nGenerated {len(predictions)} predictions:")
    print("-" * 80)
    
    for i, pred in enumerate(predictions[:3], 1):  # Show first 3
        print(f"\n{i}. {pred['item_name']}")
        print(f"   Confidence: {pred['confidence']:.1%}")
        print(f"   30-day demand: {pred['predicted_demand_30d']}")
        print(f"   60-day demand: {pred['predicted_demand_60d']}")
        print(f"   90-day demand: {pred['predicted_demand_90d']}")
        if 'investment_required' in pred:
            print(f"   Investment needed: Rs {pred['investment_required']:,.0f}")
            print(f"   Expected profit: Rs {pred['expected_profit']:,.0f}")
            print(f"   ROI: {pred['roi_percentage']:.1f}%")
        print(f"   Reason: {pred['reason']}")
    
    # Get recommendations
    recommendations = predictor.generate_recommendations(predictions, budget)
    print(f"\nGenerated {len(recommendations)} recommendations:")
    print("-" * 80)
    
    for i, rec in enumerate(recommendations, 1):
        print(f"\n{i}. {rec['type'].upper()}")
        print(f"   Title: {rec['title']}")
        print(f"   Description: {rec['description']}")
        if 'total_investment' in rec:
            print(f"   Total investment: Rs {rec['total_investment']:,.0f}")
            print(f"   Expected profit: Rs {rec['expected_profit']:,.0f}")
    
    return predictions, recommendations

def test_payment_recommendations():
    """Test payment recommendations for customers"""
    print("\n" + "="*60)
    print("TESTING TESTING PAYMENT RECOMMENDATIONS")
    print("="*60)
    
    recommender = PaymentRecommender()
    company_id = 1
    
    print(f"Company ID: {company_id}")
    print("Analyzing customer payment patterns...")
    
    # Get payment recommendations
    recommendations = recommender.recommend_payments(company_id)
    
    print(f"\nGenerated {len(recommendations)} customer recommendations:")
    print("-" * 80)
    
    for i, rec in enumerate(recommendations[:3], 1):  # Show first 3
        print(f"\n{i}. {rec['customer_name']}")
        print(f"   Current balance: Rs {rec['current_credit_balance']:,.0f}")
        print(f"   Recommended payment: Rs {rec['recommended_payment']:,.0f}")
        print(f"   Frequency: {rec['recommended_frequency']}")
        print(f"   Risk level: {rec['risk_level'].upper()}")
        print(f"   Payment history: {rec['payment_history_score']:.1%} on time")
        print(f"   Avg payment days: {rec['avg_payment_days']:.1f}")
        print(f"   Priority: {rec['priority'].upper()}")
        print(f"   Strategy: {rec['payment_strategy']['approach']}")
    
    # Get risk assessment
    risk_assessment = recommender.assess_payment_risk(company_id)
    print(f"\nRisk Assessment:")
    print("-" * 50)
    print(f"Overall risk level: {risk_assessment['overall_risk_level'].upper()}")
    print(f"High risk customers: {risk_assessment['high_risk_count']}")
    print(f"Medium risk customers: {risk_assessment['medium_risk_count']}")
    print(f"Low risk customers: {risk_assessment['low_risk_count']}")
    print(f"Risk percentage: {risk_assessment['risk_percentage']:.1f}%")
    print(f"Total outstanding: Rs {risk_assessment['total_outstanding_amount']:,.0f}")
    
    return recommendations, risk_assessment

def test_business_insights():
    """Test business insights generation"""
    print("\n" + "="*60)
    print("TESTING TESTING BUSINESS INSIGHTS")
    print("="*60)
    
    analyzer = BusinessAnalyzer()
    company_id = 1
    
    print(f"Company ID: {company_id}")
    print("Analyzing business performance...")
    
    # Get business insights
    insights = analyzer.generate_insights(company_id)
    
    print(f"\nGenerated {len(insights)} business insights:")
    print("-" * 80)
    
    for i, insight in enumerate(insights[:3], 1):  # Show first 3
        print(f"\n{i}. {insight['title']}")
        print(f"   Type: {insight['type'].replace('_', ' ').title()}")
        print(f"   Priority: {insight['priority'].upper()}")
        print(f"   Impact: {insight['impact_potential'].upper()}")
        print(f"   Description: {insight['description']}")
        
        if 'current_performance' in insight:
            print(f"   Current: {insight['current_performance']}")
        if 'target_performance' in insight:
            print(f"   Target: {insight['target_performance']}")
        
        print(f"   Recommendations:")
        for j, rec in enumerate(insight['recommendations'][:2], 1):  # Show first 2
            print(f"     {j}. {rec}")
    
    # Get business summary
    summary = analyzer.generate_summary(company_id)
    print(f"\nBusiness Health Summary:")
    print("-" * 50)
    print(f"Overall health: {summary['overall_health'].upper()}")
    print(f"Health score: {summary['health_score']}/100")
    print(f"Average monthly sales: Rs {summary['key_metrics']['average_monthly_sales']:,.0f}")
    print(f"Average profit margin: {summary['key_metrics']['average_profit_margin']:.1f}%")
    print(f"Expense ratio: {summary['key_metrics']['expense_ratio']:.1f}%")
    print(f"Customer retention: {summary['key_metrics']['customer_retention_rate']:.1%}")
    
    print(f"\nKey Recommendations:")
    for i, rec in enumerate(summary['key_recommendations'], 1):
        print(f"  {i}. {rec}")
    
    return insights, summary

def test_natural_language_queries():
    """Test natural language query processing"""
    print("\n" + "="*60)
    print("TESTING TESTING NATURAL LANGUAGE QUERIES")
    print("="*60)
    
    analyzer = BusinessAnalyzer()
    company_id = 1
    
    # Test queries
    test_queries = [
        "What is my profit margin?",
        "How are my sales doing?",
        "Which customers are late with payments?",
        "What are my biggest expenses?",
        "How can I improve my business?"
    ]
    
    print("Testing various business queries:")
    print("-" * 60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Query: '{query}'")
        response = analyzer.process_natural_query(company_id, query)
        print(f"   AI Response: {response['answer']}")
        print(f"   Confidence: {response['confidence']:.1%}")
        print(f"   Data sources: {', '.join(response['data_sources'])}")

def test_new_business_scenario():
    """Demonstrate AI functionality for a very new business"""
    print("\n" + "="*60)
    print("NEW NEW BUSINESS SCENARIO (1 MONTH OLD)")
    print("="*60)
    
    predictor = DemandPredictor()
    recommender = PaymentRecommender()
    analyzer = BusinessAnalyzer()
    
    company_id = 999  # New business ID
    print(f"Simulating business that's only 1 month old (Company ID: {company_id})")
    print("This demonstrates how AI works with minimal historical data...")
    
    # Test demand prediction with minimal data
    print("\n1. DEMAND PREDICTION (Minimal Data):")
    predictions = predictor.predict(company_id, budget=150000, days_ahead=60)
    print(f"   Generated {len(predictions)} predictions using industry benchmarks")
    for pred in predictions[:2]:
        print(f"     • {pred['item_name']} (confidence: {pred['confidence']:.1%})")
    
    # Test payment recommendations with minimal data
    print("\n2. PAYMENT RECOMMENDATIONS (New Customers):")
    recommendations = recommender.recommend_payments(company_id)
    print(f"   Generated {len(recommendations)} recommendations using standard practices")
    for rec in recommendations[:2]:
        print(f"     • {rec['customer_name']} (risk: {rec['risk_level']})")
    
    # Test business insights for new business
    print("\n3. BUSINESS INSIGHTS (Getting Started):")
    insights = analyzer.generate_insights(company_id)
    print(f"   Generated {len(insights)} foundational insights")
    for insight in insights[:2]:
        print(f"     • {insight['title']} (priority: {insight['priority']})")
    
    print("\nSUCCESS AI successfully provides meaningful insights even with minimal data!")

def main():
    """Main test function"""
    print("AI FUNCTIONALITY TEST")
    print("=" * 60)
    print("Testing AI-powered business management features")
    print("Demonstrating how AI works for both established and new businesses")
    print("=" * 60)
    
    try:
        # Test core AI features
        predictions, demand_recs = test_demand_prediction()
        payment_recs, risk_assessment = test_payment_recommendations()
        insights, summary = test_business_insights()
        
        # Test natural language processing
        test_natural_language_queries()
        
        # Test new business scenario
        test_new_business_scenario()
        
        # Summary
        print("\n" + "="*60)
        print("SUCCESS AI FUNCTIONALITY TEST COMPLETED SUCCESSFULLY")
        print("="*60)
        print("\nKey Features Demonstrated:")
        print("PASS: Demand prediction with budget allocation")
        print("✓ Payment risk assessment and recommendations")
        print("✓ Business insights and health analysis")
        print("✓ Natural language query processing")
        print("✓ Support for new businesses with minimal data")
        print("✓ Fallback mechanisms when data is insufficient")
        
        print("\nAI System Benefits:")
        print("• Provides meaningful insights even for new businesses")
        print("• Uses industry benchmarks when data is limited")
        print("• Progressive learning as more data becomes available")
        print("• Comprehensive business analysis and recommendations")
        print("• User-friendly natural language interface")
        
        print(f"\nTest completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"\nFAILED Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()