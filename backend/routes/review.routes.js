import express from "express"
import { addReview, getRestaurantReviews, checkCanReview } from "../controllers/review.controller.js"
import isAuth from "../middlewares/isAuth.js"

const reviewRouter = express.Router()

reviewRouter.post("/add", isAuth, addReview)
reviewRouter.get("/restaurant/:restaurantId", getRestaurantReviews)
reviewRouter.get("/can-review/:orderId", isAuth, checkCanReview)

export default reviewRouter