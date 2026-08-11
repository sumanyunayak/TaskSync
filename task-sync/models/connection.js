const { Pool } = require("pg");

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.connect((err, client, release) => {
  if (err) console.log("Database connection error:", err);
  else console.log("Successfully connected database");
  
  if (release) release();
});

module.exports = {
  client: () => pool.connect(),
  query: (text, params) => pool.query(text, params),
};