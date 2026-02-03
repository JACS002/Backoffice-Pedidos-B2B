const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const customerRoutes = require("./routes/customer.routes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.send("Customers API OK"));

// Rutas de clientes
app.use(customerRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Customers API corriendo en puerto ${PORT}`);
});
