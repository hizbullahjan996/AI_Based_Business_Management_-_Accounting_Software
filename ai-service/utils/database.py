import os
from typing import Optional
import logging
from sqlalchemy import create_engine as sa_create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', '')
SQLITE_URL = os.getenv('SQLITE_URL', 'sqlite:///./database.db')

def get_engine():
    """Create and return a SQLAlchemy engine. Tries PostgreSQL first, falls back to SQLite."""
    if DATABASE_URL:
        try:
            engine = sa_create_engine(DATABASE_URL, pool_pre_ping=True)
            # Test connection
            with engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            logger.info('Connected to PostgreSQL database')
            return engine
        except Exception as e:
            logger.warning(f'PostgreSQL connection failed: {e}, falling back to SQLite')

    # Fallback to SQLite
    try:
        engine = sa_create_engine(SQLITE_URL, connect_args={})
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        logger.info('Connected to SQLite database')
        return engine
    except Exception as e:
        logger.error(f'Failed to create SQLite engine: {e}')
        raise


engine = get_engine()

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()


def get_database_connection():
    """Get database connection for AI service"""
    try:
        return engine.connect()
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise


def get_db_session():
    """Get database session generator"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def execute_query(query_str: str, params: Optional[dict] = None):
    """Execute a database query and return results as list of rows"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text(query_str), params or {})
            try:
                return result.fetchall()
            except Exception:
                # Some statements (DDL) may not return rows
                return []
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        raise


def fetch_business_data(company_id: int, table: str, columns: str = "*", limit: int = 1000):
    """Fetch business data for AI analysis"""
    try:
        query_str = f"""
            SELECT {columns}
            FROM {table}
            WHERE company_id = :company_id
            ORDER BY created_at DESC
            LIMIT :limit
        """
        params = {"company_id": company_id, "limit": limit}
        return execute_query(query_str, params)
    except Exception as e:
        logger.error(f"Failed to fetch {table} data: {e}")
        return []


def get_sales_data(company_id: int):
    return fetch_business_data(
        company_id,
        "sales_invoices",
        "id, total_amount, profit, created_at, party_id",
    )


def get_payment_data(company_id: int):
    return fetch_business_data(
        company_id,
        "payments",
        "id, amount, payment_date, due_date, status, party_id",
    )


def get_expense_data(company_id: int):
    return fetch_business_data(
        company_id,
        "expenses",
        "id, amount, category, created_at, description",
    )


def get_inventory_data(company_id: int):
    return fetch_business_data(
        company_id,
        "inventory_movements",
        "id, item_id, quantity, movement_type, created_at",
    )


def get_customer_data(company_id: int):
    return fetch_business_data(
        company_id,
        "parties",
        "id, name, party_type, phone, email, opening_balance, credit_limit",
    )


def create_ai_tables():
    """Create AI-specific tables if they don't exist"""
    try:
        # AI requests log table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS ai_requests (
            id SERIAL PRIMARY KEY,
            company_id INTEGER NOT NULL,
            request_type VARCHAR(50) NOT NULL,
            success BOOLEAN DEFAULT FALSE,
            response_time INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        execute_query(create_table_query)

        # AI model status table
        model_status_query = """
        CREATE TABLE IF NOT EXISTS ai_model_status (
            id SERIAL PRIMARY KEY,
            company_id INTEGER NOT NULL,
            model_type VARCHAR(50) NOT NULL,
            is_trained BOOLEAN DEFAULT FALSE,
            last_trained TIMESTAMP,
            accuracy_score DECIMAL(5,4),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        execute_query(model_status_query)

        logger.info("AI tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create AI tables: {e}")
        raise


def log_ai_request(company_id: int, request_type: str, success: bool, response_time: Optional[int] = None):
    try:
        query_str = """
        INSERT INTO ai_requests (company_id, request_type, success, response_time)
        VALUES (:company_id, :request_type, :success, :response_time)
        """
        params = {
            "company_id": company_id,
            "request_type": request_type,
            "success": success,
            "response_time": response_time,
        }
        execute_query(query_str, params)
    except Exception as e:
        logger.error(f"Failed to log AI request: {e}")


def update_model_status(company_id: int, model_type: str, is_trained: bool, accuracy: Optional[float] = None):
    try:
        query_str = """
        INSERT INTO ai_model_status (company_id, model_type, is_trained, accuracy_score, updated_at)
        VALUES (:company_id, :model_type, :is_trained, :accuracy_score, CURRENT_TIMESTAMP)
        ON CONFLICT (company_id, model_type)
        DO UPDATE SET
            is_trained = :is_trained,
            accuracy_score = :accuracy_score,
            updated_at = CURRENT_TIMESTAMP
        """
        params = {
            "company_id": company_id,
            "model_type": model_type,
            "is_trained": is_trained,
            "accuracy_score": accuracy,
        }
        execute_query(query_str, params)
    except Exception as e:
        logger.error(f"Failed to update model status: {e}")


def check_database_health():
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


if __name__ == "__main__":
    create_ai_tables()
    print("Database utilities initialized")