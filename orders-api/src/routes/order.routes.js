const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const idempotencyMiddleware = require("../middlewares/idempotency");

// CRUD de Órdenes
router.post("/orders", OrderController.create);
router.get("/orders", OrderController.search);
router.get("/orders/:id", OrderController.getById);

// Acciones sobre órdenes (con idempotencia)
router.post(
  "/orders/:id/confirm",
  idempotencyMiddleware,
  OrderController.confirm,
);
router.post(
  "/orders/:id/cancel",
  idempotencyMiddleware,
  OrderController.cancel,
);

module.exports = router;
