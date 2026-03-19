import express from "express"
import {
    getAllRestaurants, getRestaurantById, searchRestaurants,
    getOwnerRestaurant, createRestaurant, updateRestaurant,
    getOwnerOrders, updateOrderStatus, getNearbyRestaurants
} from "../controllers/restaurant.controller.js"
import isAuth from "../middlewares/isAuth.js"

const restaurantRouter = express.Router()

restaurantRouter.get("/all", getAllRestaurants)
restaurantRouter.get("/search", searchRestaurants)
restaurantRouter.get("/owner", isAuth, getOwnerRestaurant)
restaurantRouter.post("/create", isAuth, createRestaurant)
restaurantRouter.put("/update", isAuth, updateRestaurant)
restaurantRouter.get("/owner-orders", isAuth, getOwnerOrders)
restaurantRouter.put("/update-order-status", isAuth, updateOrderStatus)
restaurantRouter.get("/nearby", getNearbyRestaurants)
restaurantRouter.get("/:id", getRestaurantById)

export default restaurantRouter