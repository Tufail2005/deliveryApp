import {type Request, type Response} from "express";
import { orderSchema } from "../types/types.js";
import { prisma } from "../lib/prisma.js";
import { priceCalcular } from "../lib/priceCalculator.js";
export const placeOrder = async (req: Request, res: Response) =>{
    const result = orderSchema.safeParse(req.body);
    if(!result.success){
        return res.status(400).json({
            message: "Invalid inputs",
            errors: result.error.issues
        })
    }
    const { restaurantId, items, addressId } = result.data; 
    const userId = req.user?.userId;


    try {
        const newOrder = await prisma.order.create({
            data: {
                userId,
                restaurantId,

            }
        })
    } catch (error) {
        
    }

}