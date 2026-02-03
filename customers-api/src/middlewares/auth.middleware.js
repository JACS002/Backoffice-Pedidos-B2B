// Middleware de Seguridad para rutas internas
const internalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token || token !== process.env.SERVICE_TOKEN) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid Service Token" });
  }
  next();
};

module.exports = { internalAuth };
