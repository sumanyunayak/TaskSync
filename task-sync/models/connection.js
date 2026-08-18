const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

// Use DATABASE_URL when available (Render/Production), fallback to local PG vars
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST || "localhost",
      database: process.env.PGDATABASE,
      password: process.env.PGPASSWORD,
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER || "postgres",
    };

const pool = new Pool({
  ...poolConfig,
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