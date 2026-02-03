const CustomerModel = require("../models/customer.model");
const { z } = require("zod");

// Esquema de validación
const customerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(5),
});

// Esquema parcial para actualizaciones (PUT/PATCH)
const updateSchema = customerSchema.partial();

const CustomerController = {
  // GET /customers/:id y /internal/customers/:id
  getById: async (req, res) => {
    try {
      const customer = await CustomerModel.findById(req.params.id);
      if (!customer)
        return res.status(404).json({ error: "Cliente no encontrado" });
      res.status(200).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /customers
  create: async (req, res) => {
    try {
      const data = customerSchema.parse(req.body);
      const newCustomer = await CustomerModel.create(data);
      res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.errors });
      if (error.code === "ER_DUP_ENTRY")
        return res.status(409).json({ error: "Email ya existe" });
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /customers/:id
  update: async (req, res) => {
    try {
      const data = updateSchema.parse(req.body);
      const updated = await CustomerModel.update(req.params.id, data);

      if (!updated)
        return res
          .status(404)
          .json({ error: "Cliente no encontrado o sin cambios" });

      res.status(200).json({ success: true, message: "Cliente actualizado" });
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.errors });
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /customers/:id
  delete: async (req, res) => {
    try {
      const deleted = await CustomerModel.delete(req.params.id);
      if (!deleted)
        return res.status(404).json({ error: "Cliente no encontrado" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /customers?search=&cursor=&limit=
  search: async (req, res) => {
    try {
      const { search, cursor, limit } = req.query;
      const customers = await CustomerModel.search({ search, cursor, limit });

      // Preparamos el siguiente cursor para el cliente
      const nextCursor =
        customers.length > 0 ? customers[customers.length - 1].id : null;

      res.status(200).json({
        data: customers,
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

module.exports = CustomerController;
