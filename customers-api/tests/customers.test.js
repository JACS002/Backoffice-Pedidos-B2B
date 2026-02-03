const request = require("supertest");
const app = require("../src/app");

describe("Customers API - Health Check", () => {
  test("GET /health should return OK", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Customers API OK");
  });
});

describe("Customers API - CRUD Operations", () => {
  let createdCustomerId;

  test("POST /customers should create a new customer", async () => {
    const newCustomer = {
      name: "Test Customer",
      email: `test${Date.now()}@example.com`,
      phone: "+1234567890",
    };

    const response = await request(app)
      .post("/customers")
      .send(newCustomer)
      .set("Content-Type", "application/json");

    if (response.status !== 201) {
      console.log("Error response:", response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newCustomer.name);
    expect(response.body.email).toBe(newCustomer.email);

    createdCustomerId = response.body.id;
  });

  test("POST /customers should fail with invalid data", async () => {
    const invalidCustomer = {
      name: "AB", // Too short
      email: "invalid-email",
      phone: "123",
    };

    const response = await request(app)
      .post("/customers")
      .send(invalidCustomer)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  test("GET /customers/:id should return customer details", async () => {
    const response = await request(app).get(`/customers/${createdCustomerId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdCustomerId);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  });

  test("GET /customers/:id should return 404 for non-existent customer", async () => {
    const response = await request(app).get("/customers/99999");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  test("GET /customers should return paginated results", async () => {
    const response = await request(app).get("/customers").query({ limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("pagination");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("PUT /customers/:id should update customer", async () => {
    const updates = {
      name: "Updated Test Customer",
      phone: "+9876543210",
    };

    const response = await request(app)
      .put(`/customers/${createdCustomerId}`)
      .send(updates)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("DELETE /customers/:id should delete customer", async () => {
    const response = await request(app).delete(
      `/customers/${createdCustomerId}`,
    );

    expect(response.status).toBe(204);
  });

  test("GET /customers/:id should return 404 after deletion", async () => {
    const response = await request(app).get(`/customers/${createdCustomerId}`);

    expect(response.status).toBe(404);
  });
});

describe("Customers API - Internal Endpoint", () => {
  test("GET /internal/customers/:id without token should return 401", async () => {
    const response = await request(app).get("/internal/customers/1");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });

  test("GET /internal/customers/:id with valid token should return customer", async () => {
    const response = await request(app)
      .get("/internal/customers/1")
      .set("Authorization", "Bearer token_secreto_interno_123");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });
});
