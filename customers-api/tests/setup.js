// Configuración de variables de entorno para tests
process.env.NODE_ENV = "test";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "3306";
process.env.DB_USER = process.env.DB_USER || "root";
process.env.DB_PASS = process.env.DB_PASS || "root";
process.env.DB_NAME = process.env.DB_NAME || "challenges_db";
process.env.INTERNAL_API_SECRET =
  process.env.INTERNAL_API_SECRET || "token_secreto_interno_123";
process.env.SERVICE_TOKEN =
  process.env.SERVICE_TOKEN || "token_secreto_interno_123";

// Aumentar timeout para tests que hacen llamadas a DB
jest.setTimeout(10000);

// Cerrar conexión a DB después de todos los tests
afterAll(async () => {
  const db = require("../src/config/db");
  await db.end();
});
