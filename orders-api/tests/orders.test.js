const request = require("supertest");
const app = require("../src/app");

describe("Orders API - Health Check", () => {
  test("GET /health should return OK", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Orders API OK");
  });
});

describe("Orders API - Products", () => {
  let createdProductId;

  test("POST /products should create a new product", async () => {
    const newProduct = {
      sku: `SKU-TEST-${Date.now()}`,
      name: "Test Product",
      price_cents: 10000,
      stock: 100,
    };

    const response = await request(app)
      .post("/products")
      .send(newProduct)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.sku).toBe(newProduct.sku);

    createdProductId = response.body.id;
  });

  test("GET /products/:id should return product details", async () => {
    const response = await request(app).get(`/products/${createdProductId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdProductId);
    expect(response.body).toHaveProperty("stock");
  });

  test("PATCH /products/:id should update price and stock", async () => {
    const updates = {
      price_cents: 12000,
      stock: 150,
    };

    const response = await request(app)
      .patch(`/products/${createdProductId}`)
      .send(updates)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("GET /products should return paginated results", async () => {
    const response = await request(app).get("/products").query({ limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("pagination");
  });
});

describe("Orders API - Orders Flow", () => {
  let createdOrderId;
  const idempotencyKey = `test-key-${Date.now()}`;

  test("POST /orders should create a new order", async () => {
    const newOrder = {
      customer_id: 1,
      items: [
        {
          product_id: 1,
          qty: 2,
        },
      ],
    };

    const response = await request(app)
      .post("/orders")
      .send(newOrder)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.status).toBe("CREATED");
    expect(response.body).toHaveProperty("total_cents");

    createdOrderId = response.body.id;
  });

  test("GET /orders/:id should return order with items", async () => {
    const response = await request(app).get(`/orders/${createdOrderId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdOrderId);
    expect(response.body).toHaveProperty("items");
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  test("POST /orders/:id/confirm should confirm order", async () => {
    const response = await request(app)
      .post(`/orders/${createdOrderId}/confirm`)
      .set("X-Idempotency-Key", idempotencyKey);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order.status).toBe("CONFIRMED");
  });

  test("POST /orders/:id/confirm with same key should be idempotent", async () => {
    const response = await request(app)
      .post(`/orders/${createdOrderId}/confirm`)
      .set("X-Idempotency-Key", idempotencyKey);

    expect(response.status).toBe(200);
    expect(response.body.order.id).toBe(createdOrderId);
  });

  test("GET /orders should return filtered results", async () => {
    const response = await request(app)
      .get("/orders")
      .query({ status: "CONFIRMED", limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("pagination");
  });

  test("POST /orders/:id/cancel should cancel order within 10 minutes", async () => {
    // Create a new order to cancel
    const newOrder = {
      customer_id: 1,
      items: [{ product_id: 1, qty: 1 }],
    };

    const createResponse = await request(app)
      .post("/orders")
      .send(newOrder)
      .set("Content-Type", "application/json");

    const orderToCancel = createResponse.body.id;
    const cancelKey = `cancel-key-${Date.now()}`;

    const cancelResponse = await request(app)
      .post(`/orders/${orderToCancel}/cancel`)
      .set("X-Idempotency-Key", cancelKey);

    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body.success).toBe(true);
  });
});

describe("Orders API - Validation", () => {
  test("POST /orders with invalid customer should fail", async () => {
    const invalidOrder = {
      customer_id: 99999,
      items: [{ product_id: 1, qty: 1 }],
    };

    const response = await request(app)
      .post("/orders")
      .send(invalidOrder)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
  });

  test("POST /orders with insufficient stock should fail", async () => {
    const invalidOrder = {
      customer_id: 1,
      items: [{ product_id: 1, qty: 10000 }],
    };

    const response = await request(app)
      .post("/orders")
      .send(invalidOrder)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("Stock insuficiente");
  });
});
