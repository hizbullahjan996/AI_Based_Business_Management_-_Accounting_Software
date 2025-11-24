import os
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import json
from pathlib import Path
import signal

# Import our AI modules
from models.demand_predictor import DemandPredictor
from models.payment_recommender import PaymentRecommender
from models.business_analyzer import BusinessAnalyzer
from utils.database import get_database_connection
from utils.logger import setup_logger
from utils.auth import verify_api_key

# Setup logging
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Business Management Service",
    description="AI-powered demand prediction and business insights",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global middleware to catch unhandled exceptions during request processing
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    # Trace file to help debug unexpected shutdowns
    try:
        trace_path = Path("logs/request_trace.log")
        trace_path.parent.mkdir(parents=True, exist_ok=True)
        with trace_path.open("a", encoding="utf-8") as f:
            f.write(f"ENTER {datetime.utcnow().isoformat()} {request.method} {request.url}\n")

        response = await call_next(request)
        with trace_path.open("a", encoding="utf-8") as f:
            f.write(f"EXIT {datetime.utcnow().isoformat()} {request.method} {request.url} status={response.status_code}\n")
        return response
    except BaseException as e:
        try:
            trace_path = Path("logs/request_trace.log")
            with trace_path.open("a", encoding="utf-8") as f:
                f.write(f"EXCEPTION {datetime.utcnow().isoformat()} {request.method} {request.url} error={str(e)}\n")
        except Exception:
            pass
        # Catch BaseException to log SystemExit/KeyboardInterrupt as well during debugging
        try:
            logger.exception(f"Unhandled exception while processing request {request.method} {request.url}: {e}")
        except Exception:
            # If logging itself fails, print fallback
            print(f"Unhandled exception: {e}")
        # Return generic 500 response; in case of SystemExit this will attempt to respond before exit
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/debug/ping")
async def debug_ping(_=Depends(verify_api_key)):
    """Lightweight debug endpoint to check service responsiveness."""
    logger.info("/debug/ping called")
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/debug/run_predictor")
async def debug_run_predictor(company_id: int = 1, _=Depends(verify_api_key)):
    """Debug endpoint that runs the DemandPredictor's data fetch (not full ML) to isolate failures."""
    try:
        logger.info(f"/debug/run_predictor called for company {company_id}")
        sample_data = demand_predictor._get_sales_data(company_id)
        # Return a small sample to avoid large payloads
        sample = []
        for row in sample_data[:10]:
            if isinstance(row, dict):
                sample.append(row)
            else:
                # If pandas DataFrame rows, convert
                try:
                    sample.append(row._asdict())
                except Exception:
                    sample.append(str(row))

        return {"success": True, "sample_count": len(sample), "sample": sample}
    except BaseException as e:
        logger.exception(f"Debug predictor failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Initialize AI models
demand_predictor = DemandPredictor()
payment_recommender = PaymentRecommender()
business_analyzer = BusinessAnalyzer()

# Pydantic models for API
class DemandPredictionRequest(BaseModel):
    company_id: int
    budget: Optional[float] = None
    days_ahead: int = 90

class PaymentRecommendationRequest(BaseModel):
    company_id: int

class BusinessInsightRequest(BaseModel):
    company_id: int

class BusinessQueryRequest(BaseModel):
    company_id: int
    query: str

class TrainModelRequest(BaseModel):
    company_id: int

# API Routes
@app.get("/")
async def root():
    return {"message": "AI Business Management Service is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/predict/demand")
async def predict_demand(request: DemandPredictionRequest, _=Depends(verify_api_key)):
    """Predict seasonal demand for items based on historical data"""
    try:
        logger.info(f"Processing demand prediction for company {request.company_id}")
        
        # Get predictions from AI model
        predictions = demand_predictor.predict(
            company_id=request.company_id,
            budget=request.budget,
            days_ahead=request.days_ahead
        )
        
        # Generate recommendations
        recommendations = demand_predictor.generate_recommendations(
            predictions, request.budget
        )
        
        return {
            "predictions": predictions,
            "recommendations": recommendations,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Demand prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend/payments")
async def recommend_payments(request: PaymentRecommendationRequest, _=Depends(verify_api_key)):
    """Generate payment recommendations based on customer behavior"""
    try:
        logger.info(f"Processing payment recommendations for company {request.company_id}")
        
        recommendations = payment_recommender.recommend_payments(request.company_id)
        risk_assessment = payment_recommender.assess_payment_risk(request.company_id)
        
        return {
            "recommendations": recommendations,
            "risk_assessment": risk_assessment,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Payment recommendations failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insights/business")
async def get_business_insights(request: BusinessInsightRequest, _=Depends(verify_api_key)):
    """Generate AI-powered business insights"""
    try:
        logger.info(f"Processing business insights for company {request.company_id}")
        
        insights = business_analyzer.generate_insights(request.company_id)
        summary = business_analyzer.generate_summary(request.company_id)
        
        return {
            "insights": insights,
            "summary": summary,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Business insights failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def process_business_query(request: BusinessQueryRequest, _=Depends(verify_api_key)):
    """Process natural language business queries"""
    try:
        logger.info(f"Processing query for company {request.company_id}: {request.query}")
        
        response = business_analyzer.process_natural_query(
            company_id=request.company_id,
            query=request.query
        )
        
        return {
            "response": response["answer"],
            "confidence": response["confidence"],
            "data_sources": response["data_sources"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Query processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_models(request: TrainModelRequest, _=Depends(verify_api_key)):
    """Train AI models with new data"""
    try:
        logger.info(f"Training models for company {request.company_id}")
        
        # Train demand prediction model
        demand_model_trained = demand_predictor.train(company_id=request.company_id)
        
        # Train payment recommendation model
        payment_model_trained = payment_recommender.train(company_id=request.company_id)
        
        # Update business analysis model
        business_model_updated = business_analyzer.update_model(company_id=request.company_id)
        
        return {
            "status": "completed",
            "message": "Models trained successfully",
            "demand_model": demand_model_trained,
            "payment_model": payment_model_trained,
            "business_model": business_model_updated,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Model training failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{company_id}")
async def get_model_status(company_id: int, _=Depends(verify_api_key)):
    """Get status of AI models for a company"""
    try:
        status = {
            "company_id": company_id,
            "demand_model": demand_predictor.get_status(company_id),
            "payment_model": payment_recommender.get_status(company_id),
            "business_model": business_analyzer.get_status(company_id),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return status
        
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize AI models on startup"""
    logger.info("AI Service starting up...")
    try:
        # Initialize database connection
        db_conn = get_database_connection()
        logger.info("Database connection established")
        
        # Load pre-trained models
        models_dir = Path("models/trained")
        if models_dir.exists():
            demand_predictor.load_models(str(models_dir))
            payment_recommender.load_models(str(models_dir))
            business_analyzer.load_models(str(models_dir))
            logger.info("Pre-trained models loaded")
        
        logger.info("AI Service startup completed successfully")
        # Run lightweight self-checks to validate model internals (avoids external HTTP calls that
        # may send signals in this execution environment). These checks fetch sample data only.
        try:
            sample = demand_predictor._get_sales_data(1)
            logger.info(f"Self-check: demand_predictor sample rows: {len(sample) if hasattr(sample, '__len__') else 'unknown'}")
        except Exception as e:
            logger.exception(f"Self-check failed: {e}")

    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise

    # Register signal handlers to log signals (helps debug unexpected shutdowns)
    # Note: avoid overriding the SIGINT handler because uvicorn already manages
    # process signals and replacing SIGINT can cause unexpected termination
    # behavior during request handling. We register SIGTERM and SIGBREAK where
    # supported to gather diagnostic traces without interfering with the server.
    def _handle_signal(sig, frame=None):
        try:
            logger.warning(f"Received signal: {sig}")
            trace_path = Path("logs/request_trace.log")
            trace_path.parent.mkdir(parents=True, exist_ok=True)
            with trace_path.open("a", encoding="utf-8") as f:
                f.write(f"SIGNAL {datetime.utcnow().isoformat()} sig={sig}\n")
        except Exception:
            pass

    # Do NOT register SIGINT handler here to avoid conflicting with the
    # server process manager (uvicorn/gunicorn). Register SIGTERM and SIGBREAK
    # when available to capture termination signals for diagnostics.
    try:
        signal.signal(signal.SIGTERM, _handle_signal)
    except Exception:
        # SIGTERM may not be available on Windows or in some runtimes; ignore
        pass
    try:
        signal.signal(signal.SIGBREAK, _handle_signal)
    except Exception:
        # SIGBREAK may not be present on all platforms; ignore
        pass

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("AI Service shutting down...")
    # Save models if needed
    # Close database connections
    logger.info("AI Service shutdown completed")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )