const db = require("../config/db");

const ProductModel = {
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  },

  create: async ({ sku, name, price_cents, stock }) => {
    const [res] = await db.query(
      "INSERT INTO products (sku, name, price_cents, stock) VALUES (?,?,?,?)",
      [sku, name, price_cents, stock],
    );
    return { id: res.insertId, sku, name, price_cents, stock };
  },

  update: async (id, data) => {
    // Implementación para PATCH
    const fields = [];
    const values = [];
    if (data.price_cents !== undefined) {
      fields.push("price_cents = ?");
      values.push(data.price_cents);
    }
    if (data.stock !== undefined) {
      fields.push("stock = ?");
      values.push(data.stock);
    }

    if (fields.length === 0) return null;
    values.push(id);

    const [res] = await db.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return res.affectedRows > 0;
  },

  search: async ({ search, cursor, limit = 10 }) => {
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];
    if (search) {
      query += " AND (name LIKE ? OR sku LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (cursor) {
      query += " AND id > ?";
      params.push(cursor);
    }
    query += " LIMIT ?";
    params.push(parseInt(limit));
    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = ProductModel;
