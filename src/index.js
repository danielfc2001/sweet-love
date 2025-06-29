import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import userRoutes from "./routes/user.routes.js";
import buffetRoutes from "./routes/buffet.routes.js";
import dotenv from "dotenv";

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

app.get("/", (req, res) => {
  res.send("welcome");
});

app.use("/api/products", productsRoutes);

app.use("/api/orders", ordersRoutes);

app.use("/api/user", userRoutes);

app.use("/api/buffet", buffetRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port: ", PORT);
});
