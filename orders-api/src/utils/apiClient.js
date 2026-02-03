const axios = require("axios");
require("dotenv").config();

const validateCustomer = async (customerId) => {
  try {
    const url = `${process.env.CUSTOMERS_API_URL}/internal/customers/${customerId}`;
    // Usamos el Token de servicio para autenticarnos
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.SERVICE_TOKEN}` },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    throw new Error("Error de comunicación con Customers API");
  }
};

module.exports = { validateCustomer };
