const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "challenges_db",
    multipleStatements: true,
  });

  try {
    console.log("Running seed...");

    const seedPath = path.join(__dirname, "../../db/seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");

    await connection.query(seed);
    console.log("✓ Seed completed successfully");
  } catch (error) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
