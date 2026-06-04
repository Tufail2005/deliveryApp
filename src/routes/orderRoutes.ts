import { Router } from "express";
import { restrictTo } from "../middlewares/authMiddleware.js";
import {
  placeOrder,
  orderHistory,
  getOrderDetails,
  cancelOrder,
  getRestaurantOrders,
  updateOrderStatus,
  getDashboardStats,
  verifyPayment,
  getCustomerOrders,
  calculateOrderPrice,
} from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/place-order", protect, placeOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/history", protect, orderHistory);
router.get("/customer-order", protect, getCustomerOrders);

router.get(
  "/restaurant/:restaurantId",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  getRestaurantOrders
);

router.get(
  "/restaurant/:restaurantId/dashboard",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  getDashboardStats
);

router.patch("/:id/cancel", protect, cancelOrder);

router.patch(
  "/:id/status",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  updateOrderStatus
);

router.get("/:id", protect, getOrderDetails);

router.get("/customer-order", protect, getCustomerOrders);
router.post("/calculate-price", protect, calculateOrderPrice);

export default router;
