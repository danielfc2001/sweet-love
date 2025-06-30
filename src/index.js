import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import userRoutes from "./routes/user.routes.js";
import buffetRoutes from "./routes/buffet.routes.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRoutes);

app.use("/api/orders", ordersRoutes);

app.use("/api/user", userRoutes);

app.use("/api/buffet", buffetRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sirve los archivos estáticos de React
app.use(express.static(path.join(__dirname, "../client/dist")));

// Para que cualquier ruta no API devuelva index.html (React Router)
app.get("/{*any}", (req, res) => {
  const filePath = path.join(__dirname, "../client/dist", "index.html");
  res.sendFile(filePath, function (err) {
    if (err) {
      console.error("Error al enviar index.html:", err);
      res.status(500).send("No se pudo cargar index.html");
    }
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});
