const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const customerRoutes = require("./routes/customer.routes");

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
    customSiteTitle: "Customers API Documentation",
  }),
);

// Health check
app.get("/health", (req, res) => res.send("Customers API OK"));

// Rutas de clientes
app.use(customerRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Customers API corriendo en puerto ${PORT}`);
  console.log(`Documentación disponible en: http://localhost:${PORT}/api-docs`);
});
