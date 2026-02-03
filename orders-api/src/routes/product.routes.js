const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");

// CRUD de Productos
router.post("/products", ProductController.create);
router.get("/products", ProductController.search);
router.get("/products/:id", ProductController.getById);
router.patch("/products/:id", ProductController.update);

module.exports = router;
