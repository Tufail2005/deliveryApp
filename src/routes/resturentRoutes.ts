import { Router } from "express";
import {
    addRestaurant,
    addCatagories,
    addItem,
    itemList,
    deleteItem,
    deleteCatagory
} from "../controllers/resturentController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/add-restaurant", protect, addRestaurant);
router.post("/add-catagories", protect, addCatagories)
router.post("/add-item", protect, addItem);
router.get("/items", protect, itemList);
router.delete("/delete-item", protect, deleteItem);
router.delete("/delete-catagory", protect, deleteCatagory);
