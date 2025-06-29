import { Router } from "express";
import {
  createCakeItem,
  deleteCakeOrder,
  getCakeOrders,
  sendCakeOrder,
} from "../controllers/orders.controller.js";

const router = Router();

router.get("/", getCakeOrders);

router.post("/", createCakeItem);

router.post("/cake", sendCakeOrder);

router.delete("/", deleteCakeOrder);

export default router;
