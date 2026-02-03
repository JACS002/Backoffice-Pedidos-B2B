const db = require("../config/db");

const CustomerModel = {
  // Buscar por ID
  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
    return rows[0];
  },

  // Crear cliente
  create: async ({ name, email, phone }) => {
    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone],
    );
    return { id: result.insertId, name, email, phone };
  },

  // Actualizar cliente
  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.name) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.email) {
      fields.push("email = ?");
      values.push(data.email);
    }
    if (data.phone) {
      fields.push("phone = ?");
      values.push(data.phone);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await db.query(query, values);
    return result.affectedRows > 0;
  },

  // Eliminar cliente
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM customers WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },

  // Búsqueda con Cursor y Límite
  search: async ({ search, cursor, limit = 10 }) => {
    let query = "SELECT * FROM customers WHERE 1=1";
    const params = [];

    // Filtro de búsqueda (nombre o email)
    if (search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // Paginación por cursor
    if (cursor) {
      query += " AND id > ?";
      params.push(parseInt(cursor));
    }

    query += " LIMIT ?";
    params.push(parseInt(limit));

    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = CustomerModel;
