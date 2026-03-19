import express from "express"
import {
    getMenuByRestaurant, addMenuItem,
    updateMenuItem, deleteMenuItem, getOwnerMenu
} from "../controllers/menu.controller.js"
import isAuth from "../middlewares/isAuth.js"

const menuRouter = express.Router()

menuRouter.get("/owner", isAuth, getOwnerMenu)
menuRouter.post("/add", isAuth, addMenuItem)
menuRouter.put("/update/:id", isAuth, updateMenuItem)
menuRouter.delete("/delete/:id", isAuth, deleteMenuItem)
menuRouter.get("/:restaurantId", getMenuByRestaurant)

export default menuRouter