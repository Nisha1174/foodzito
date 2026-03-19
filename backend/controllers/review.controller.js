import Review from "../models/review.model.js"
import Restaurant from "../models/restaurant.model.js"
import Order from "../models/order.model.js"

export const addReview = async (req, res) => {
    try {
        const { restaurantId, orderId, rating, comment, foodRating, deliveryRating } = req.body
        const userId = req.userId

        // Check if order exists and belongs to user
        const order = await Order.findById(orderId)
        if (!order) return res.status(404).json({ message: "Order not found" })
        if (order.user.toString() !== userId) return res.status(403).json({ message: "Not authorized" })
        if (order.status !== "delivered") return res.status(400).json({ message: "Can only review delivered orders" })

        // Check if already reviewed
        const existing = await Review.findOne({ user: userId, order: orderId })
        if (existing) return res.status(400).json({ message: "Already reviewed this order" })

        const review = await Review.create({
            user: userId,
            restaurant: restaurantId,
            order: orderId,
            rating, comment, foodRating, deliveryRating
        })

        // Update restaurant average rating
        const allReviews = await Review.find({ restaurant: restaurantId })
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        await Restaurant.findByIdAndUpdate(restaurantId, {
            rating: Math.round(avgRating * 10) / 10
        })

        const populated = await Review.findById(review._id).populate("user", "fullName")
        return res.status(201).json(populated)
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: "Already reviewed this order" })
        return res.status(500).json({ message: `add review error ${error}` })
    }
}

export const getRestaurantReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params
        const reviews = await Review.find({ restaurant: restaurantId })
            .populate("user", "fullName")
            .sort({ createdAt: -1 })
        return res.status(200).json(reviews)
    } catch (error) {
        return res.status(500).json({ message: `get reviews error ${error}` })
    }
}

export const checkCanReview = async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.userId
        const existing = await Review.findOne({ user: userId, order: orderId })
        return res.status(200).json({ canReview: !existing })
    } catch (error) {
        return res.status(500).json({ message: `check review error ${error}` })
    }
}