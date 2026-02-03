const db = require("../config/db");

const OrderModel = {
  createOrderTransaction: async (customerId, items) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let totalCents = 0;
      const orderItemsData = [];

      // Verificar Stock y Calcular Totales
      for (const item of items) {
        const [products] = await connection.query(
          "SELECT price_cents, stock FROM products WHERE id = ? FOR UPDATE",
          [item.product_id],
        );

        if (products.length === 0)
          throw new Error(`Producto ${item.product_id} no existe`);
        const product = products[0];

        if (product.stock < item.qty) {
          throw new Error(
            `Stock insuficiente para producto ${item.product_id}`,
          );
        }

        // Descontar Stock
        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.qty, item.product_id],
        );

        const subtotal = product.price_cents * item.qty;
        totalCents += subtotal;

        orderItemsData.push({
          product_id: item.product_id,
          qty: item.qty,
          unit_price: product.price_cents,
          subtotal: subtotal,
        });
      }

      // Crear Orden
      const [orderResult] = await connection.query(
        'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, "CREATED", ?)',
        [customerId, totalCents],
      );
      const orderId = orderResult.insertId;

      // Insertar Items
      for (const item of orderItemsData) {
        await connection.query(
          "INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES (?, ?, ?, ?, ?)",
          [orderId, item.product_id, item.qty, item.unit_price, item.subtotal],
        );
      }

      await connection.commit();
      return {
        id: orderId,
        total_cents: totalCents,
        status: "CREATED",
        items: orderItemsData,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  findById: async (id) => {
    // Obtener cabecera
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) return null;

    // Obtener items
    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id],
    );

    return { ...orders[0], items };
  },

  updateStatus: async (id, status) => {
    const [res] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
    return res.affectedRows > 0;
  },

  search: async ({ status, from, to, cursor, limit = 10 }) => {
    let query = "SELECT * FROM orders WHERE 1=1";
    const params = [];

    // Filtro por estado
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    // Filtro por fecha desde (from)
    if (from) {
      query += " AND created_at >= ?";
      params.push(from);
    }

    // Filtro por fecha hasta (to)
    if (to) {
      query += " AND created_at <= ?";
      params.push(to);
    }

    // Paginación con cursor
    if (cursor) {
      query += " AND id > ?";
      params.push(cursor);
    }

    query += " ORDER BY id ASC LIMIT ?";
    params.push(parseInt(limit));

    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = OrderModel;
