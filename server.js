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
// Add a release
app.post("/releases", async (req, res) => {
  const { artist_name, title, format } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO releases (artist_name, title, format)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [artist_name, title, format]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add release");
  }
});

// Get all releases
app.get("/releases", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM releases ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch releases");
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
