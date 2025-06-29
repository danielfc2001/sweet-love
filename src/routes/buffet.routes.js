import { Router } from "express";
import {
  getBuffetProducts,
  getBuffetProduct,
  createBuffetProduct,
  updateBuffetProduct,
  deleteBuffetProduct,
  sendBuffetOrder,
} from "../controllers/buffet.controller.js";

const router = Router();

router.get("/", getBuffetProducts);
router.get("/:id", getBuffetProduct);
router.post("/", createBuffetProduct);
router.post("/send", sendBuffetOrder);
router.put("/:id", updateBuffetProduct);
router.delete("/:id", deleteBuffetProduct);

export default router;
