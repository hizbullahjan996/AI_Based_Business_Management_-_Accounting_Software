const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/database.log' }),
    new winston.transports.Console(),
  ],
});

let db;
let pool;

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
      // PostgreSQL for production
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      pool.on('connect', () => {
        logger.info('Connected to PostgreSQL database');
      });

      pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', err);
        process.exit(-1);
      });

      // Test connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
    } else {
      // SQLite for development/offline
      db = new sqlite3.Database(process.env.SQLITE_DB_PATH || './database.sqlite', (err) => {
        if (err) {
          logger.error('Error opening SQLite database:', err.message);
        } else {
          logger.info('Connected to SQLite database');
        }
      });
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (pool) return pool;
  return db;
};

const closeDB = async () => {
  if (pool) {
    await pool.end();
    logger.info('PostgreSQL pool closed');
  } else if (db) {
    db.close((err) => {
      if (err) {
        logger.error('Error closing SQLite database:', err.message);
      } else {
        logger.info('SQLite database closed');
      }
    });
  }
};

// Query helper functions
const query = async (text, params) => {
  if (pool) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  } else {
    return new Promise((resolve, reject) => {
      db.all(text, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    });
  }
};

const queryOne = async (text, params) => {
  if (pool) {
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res.rows[0];
    } finally {
      client.release();
    }
  } else {
    return new Promise((resolve, reject) => {
      db.get(text, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  query,
  queryOne,
};