const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "root",
  database: process.env.DB_NAME || "challenges_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("Conexión a DB configurada para host:", process.env.DB_HOST);

module.exports = pool;
