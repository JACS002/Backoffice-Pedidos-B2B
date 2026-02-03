const OrderModel = require("../models/order.model");
const { validateCustomer } = require("../utils/apiClient");
const db = require("../config/db");
const { z } = require("zod");

const orderSchema = z.object({
  customer_id: z.number(),
  items: z
    .array(
      z.object({
        product_id: z.number(),
        qty: z.number().min(1),
      }),
    )
    .min(1),
});

const OrderController = {
  create: async (req, res) => {
    try {
      const { customer_id, items } = orderSchema.parse(req.body);

      // Validar Cliente (Llamada externa)
      const customer = await validateCustomer(customer_id);
      if (!customer)
        return res
          .status(404)
          .json({ error: "Cliente no existe en Customers API" });

      // Crear Orden (Transacción Stock)
      const order = await OrderModel.createOrderTransaction(customer_id, items);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.errors });
      res.status(500).json({ error: error.message });
    }
  },

  confirm: async (req, res) => {
    // El middleware de idempotencia maneja la duplicidad
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);

      if (!order) return res.status(404).json({ error: "Orden no encontrada" });
      if (order.status !== "CREATED")
        return res
          .status(400)
          .json({ error: "La orden no está en estado CREATED" });

      await OrderModel.updateStatus(id, "CONFIRMED");

      // Retornamos orden actualizada
      const updatedOrder = await OrderModel.findById(id);
      res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  cancel: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const [rows] = await connection.query(
        "SELECT * FROM orders WHERE id = ? FOR UPDATE",
        [id],
      );
      const order = rows[0];

      if (!order) throw new Error("Orden no encontrada");

      // Cancelación
      let canCancel = false;
      if (order.status === "CREATED") {
        canCancel = true;
      } else if (order.status === "CONFIRMED") {
        const now = new Date();
        const created = new Date(order.created_at);
        const diffMinutes = (now - created) / 1000 / 60;
        if (diffMinutes <= 10) canCancel = true;
      }

      if (!canCancel) {
        await connection.rollback();
        return res.status(400).json({
          error: "No se puede cancelar (estado inválido o tiempo expirado)",
        });
      }

      // Restaurar Stock
      const [items] = await connection.query(
        "SELECT product_id, qty FROM order_items WHERE order_id = ?",
        [id],
      );
      for (const item of items) {
        await connection.query(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [item.qty, item.product_id],
        );
      }

      // Actualizar Estado
      await connection.query(
        'UPDATE orders SET status = "CANCELED" WHERE id = ?',
        [id],
      );

      await connection.commit();
      res.status(200).json({
        success: true,
        message: "Orden cancelada y stock restaurado",
      });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  },

  getById: async (req, res) => {
    try {
      const order = await OrderModel.findById(req.params.id);
      if (!order) return res.status(404).json({ error: "Orden no encontrada" });
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /orders?status=&from=&to=&cursor=&limit=
  search: async (req, res) => {
    try {
      const { status, from, to, cursor, limit } = req.query;
      const orders = await OrderModel.search({
        status,
        from,
        to,
        cursor,
        limit,
      });

      // Preparamos el siguiente cursor
      const nextCursor =
        orders.length > 0 ? orders[orders.length - 1].id : null;

      res.status(200).json({
        data: orders,
        pagination: {
          next_cursor: nextCursor,
          limit: limit || 10,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = OrderController;
