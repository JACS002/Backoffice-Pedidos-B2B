const axios = require("axios");
require("dotenv").config();

const customersApi = axios.create({ baseURL: process.env.CUSTOMERS_API_URL });
const ordersApi = axios.create({ baseURL: process.env.ORDERS_API_URL });

// Helper para headers con token
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` },
});

module.exports.createAndConfirmOrder = async (event) => {
  console.log("Evento recibido:", event.body);

  try {
    const body = JSON.parse(event.body || "{}");
    const { customer_id, items, idempotency_key, correlation_id } = body;

    // Validación básica
    if (!customer_id || !items || !idempotency_key) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Faltan campos: customer_id, items o idempotency_key",
        }),
      };
    }

    // Validar Cliente (Llamada a Customers API /internal)
    console.log(`1. Validando cliente ${customer_id}...`);
    let customer;
    try {
      const custRes = await customersApi.get(
        `/internal/customers/${customer_id}`,
        getAuthHeaders(),
      );
      customer = custRes.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "Cliente no encontrado" }),
        };
      }
      throw error; // Re-lanzar para catch general
    }

    // Crear la Orden (Llamada a Orders API POST /orders)
    console.log("2. Creando orden...");
    const orderRes = await ordersApi.post("/orders", { customer_id, items });
    const createdOrder = orderRes.data;

    // Confirmar la Orden (Llamada a Orders API POST /orders/:id/confirm)
    // IMPORTANTE: Pasamos la Idempotency Key
    console.log(
      `3. Confirmando orden ${createdOrder.id} con key ${idempotency_key}...`,
    );
    const confirmRes = await ordersApi.post(
      `/orders/${createdOrder.id}/confirm`,
      {}, // body vacío
      { headers: { "X-Idempotency-Key": idempotency_key } },
    );

    // Obtener la orden actualizada de la respuesta de confirmación
    const confirmedOrderData = confirmRes.data.order || confirmRes.data;

    // Respuesta Consolidada
    const responsePayload = {
      success: true,
      correlation_id: correlation_id || `req-${Date.now()}`,
      data: {
        customer: customer,
        order: {
          id: confirmedOrderData.id,
          status: confirmedOrderData.status,
          total_cents: confirmedOrderData.total_cents,
          items: confirmedOrderData.items,
        },
      },
    };

    return {
      statusCode: 201,
      body: JSON.stringify(responsePayload),
    };
  } catch (error) {
    console.error("Error en orquestador:", error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message;

    return {
      statusCode: status,
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
