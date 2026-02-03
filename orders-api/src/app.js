const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI Documentation
const swaggerDocument = YAML.load(path.join(__dirname, "../openapi.yaml"));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Orders API Documentation",
  }),
);

// Health check
app.get("/health", (req, res) => res.send("Orders API OK"));

// Rutas
app.use(productRoutes);
app.use(orderRoutes);

module.exports = app;

// Solo iniciar el servidor si este archivo es ejecutado directamente
if (require.main === module) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Orders API corriendo en puerto ${PORT}`);
    console.log(
      `Documentación disponible en: http://localhost:${PORT}/api-docs`,
    );
  });
}
