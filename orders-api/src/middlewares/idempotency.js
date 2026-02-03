const db = require("../config/db");

const idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers["x-idempotency-key"];
  if (!key) return next();

  try {
    // Buscar si ya existe la llave
    const [rows] = await db.query(
      "SELECT response_body, status FROM idempotency_keys WHERE `key` = ?",
      [key],
    );

    if (rows.length > 0) {
      // Si existe y ya fue procesada, devolvemos lo guardado
      const cached = rows[0];
      console.log(`Idempotency hit: ${key}`);
      return res.status(200).json(JSON.parse(cached.response_body));
    }

    // Si no existe, interceptamos el método res.json para guardar la respuesta al final
    const originalJson = res.json;
    res.json = function (body) {
      // Guardar en DB asíncronamente (sin bloquear respuesta)
      db.query(
        "INSERT INTO idempotency_keys (`key`, response_body, status) VALUES (?, ?, ?)",
        [key, JSON.stringify(body), "PROCESSED"],
      ).catch((err) => console.error("Error guardando idempotency key:", err));

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = idempotencyMiddleware;
