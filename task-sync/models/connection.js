const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.connect((err, client, release) => {
  if (err) console.log("Database connection error:", err);
  else console.log("Successfully connected to PostgreSQL database");
  if (release) release();
});

module.exports = {
  client: () => pool.connect(),
  query: (text, params) => pool.query(text, params),
};