const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/health", (req, res) => {
  res.json({ status: "Backend is running!" });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection failed");
  }
});

app.get("/setup-db", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id SERIAL PRIMARY KEY,
        artist_name TEXT NOT NULL,
        title TEXT NOT NULL,
        format TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    res.json({ message: "releases table created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to create table");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
