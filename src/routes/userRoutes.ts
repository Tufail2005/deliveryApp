import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/userController.js";

const router = Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.get("/addresses", getMyAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

export default router;
