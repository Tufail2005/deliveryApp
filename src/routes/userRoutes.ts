import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addAddress,
  deleteAddress,
  getMyAddresses,
  getUserProfile,
  setActiveAddress,
  updateUser,
} from "../controllers/userController.js";

const router = Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.post("/address", protect, addAddress);
router.delete("/address/:id", protect, deleteAddress);

router.get("/me", protect, getUserProfile);
router.get("/addresses", protect, getMyAddresses);
router.put("/update", protect, updateUser);
router.patch("/addresses/:id/default", protect, setActiveAddress);
export default router;
