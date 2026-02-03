const ProductModel = require("../models/product.model");
const { z } = require("zod");

// Esquema de validación para crear producto
const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(3),
  price_cents: z.number().min(0),
  stock: z.number().min(0),
});

// Esquema para actualización parcial (PATCH)
const updateProductSchema = z.object({
  price_cents: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
});

const ProductController = {
  // POST /products
  create: async (req, res) => {
    try {
      const data = productSchema.parse(req.body);
      const newProduct = await ProductModel.create(data);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.errors });
      res.status(500).json({ error: error.message });
    }
  },

  // GET /products/:id
  getById: async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product)
        return res.status(404).json({ error: "Producto no encontrado" });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PATCH /products/:id (actualizar precio/stock)
  update: async (req, res) => {
    try {
      const data = updateProductSchema.parse(req.body);

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "No hay campos para actualizar" });
      }

      const updated = await ProductModel.update(req.params.id, data);

      if (!updated)
        return res
          .status(404)
          .json({ error: "Producto no encontrado o sin cambios" });

      res.status(200).json({ success: true, message: "Producto actualizado" });
    } catch (error) {
      if (error instanceof z.ZodError)
        return res.status(400).json({ errors: error.errors });
      res.status(500).json({ error: error.message });
    }
  },

  // GET /products?search=&cursor=&limit=
  search: async (req, res) => {
    try {
      const { search, cursor, limit } = req.query;
      const products = await ProductModel.search({ search, cursor, limit });

      // Preparamos el siguiente cursor
      const nextCursor =
        products.length > 0 ? products[products.length - 1].id : null;

      res.status(200).json({
        data: products,
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

module.exports = ProductController;
