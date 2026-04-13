import { Router } from "express";
import {
    placeOrder,
    orderStatus,
    orderHistory,
    cancelOrder
} from "../controllers/orderController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/place-order", protect, placeOrder);
router.get("/status", protect, orderStatus);
router.get("/history", protect, orderHistory);
router.get("/cancel", protect, cancelOrder);