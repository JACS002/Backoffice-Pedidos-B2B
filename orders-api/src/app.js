const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const productRoutes = require("./routes/product.routes");
const orderRoutes = require("./routes/order.routes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.send("Orders API OK"));

// Rutas
app.use(productRoutes);
app.use(orderRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Orders API corriendo en puerto ${PORT}`);
});
