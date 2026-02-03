const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    multipleStatements: true,
  });

  try {
    console.log("Running migrations...");

    const schemaPath = path.join(__dirname, "../../db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await connection.query(schema);
    console.log("✓ Migrations completed successfully");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
