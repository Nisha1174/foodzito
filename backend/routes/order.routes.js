import express from "express"
import {
    placeOrder, getUserOrders, getOrderById,
    cancelOrder, getDeliveryOrders, acceptOrder, markDelivered
} from "../controllers/order.controller.js"
import isAuth from "../middlewares/isAuth.js"

const orderRouter = express.Router()

orderRouter.post("/place", isAuth, placeOrder)
orderRouter.get("/my-orders", isAuth, getUserOrders)
orderRouter.get("/delivery-orders", isAuth, getDeliveryOrders)
orderRouter.post("/accept", isAuth, acceptOrder)
orderRouter.post("/mark-delivered", isAuth, markDelivered)
orderRouter.get("/:id", isAuth, getOrderById)
orderRouter.put("/cancel/:id", isAuth, cancelOrder)

export default orderRouter