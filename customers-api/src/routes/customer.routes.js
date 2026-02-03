const express = require("express");
const router = express.Router();
const CustomerController = require("../controllers/customer.controller");
const { internalAuth } = require("../middlewares/auth.middleware");

// --- Rutas Públicas ---

// CRUD Clientes
router.post("/customers", CustomerController.create); // Crear
router.get("/customers", CustomerController.search); // Buscar (Search/Cursor)
router.get("/customers/:id", CustomerController.getById); // Detalle
router.put("/customers/:id", CustomerController.update); // Actualizar
router.delete("/customers/:id", CustomerController.delete); // Eliminar

// --- Ruta Interna (Protegida) ---
// Usada por Orders API y Lambda Orchestrator
router.get("/internal/customers/:id", internalAuth, CustomerController.getById);

module.exports = router;
