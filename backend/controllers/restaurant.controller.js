import Restaurant from "../models/restaurant.model.js"
import MenuItem from "../models/menuItem.model.js"
import Order from "../models/order.model.js"

export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ isOpen: true })
        return res.status(200).json(restaurants)
    } catch (error) {
        return res.status(500).json({ message: `get restaurants error ${error}` })
    }
}

export const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params
        const restaurant = await Restaurant.findById(id)
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" })
        return res.status(200).json(restaurant)
    } catch (error) {
        return res.status(500).json({ message: `get restaurant error ${error}` })
    }
}

export const searchRestaurants = async (req, res) => {
    try {
        const { query } = req.query
        const restaurants = await Restaurant.find({
            isOpen: true,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
                { city: { $regex: query, $options: "i" } }
            ]
        })
        return res.status(200).json(restaurants)
    } catch (error) {
        return res.status(500).json({ message: `search error ${error}` })
    }
}

export const getOwnerRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.userId })
        return res.status(200).json(restaurant)
    } catch (error) {
        return res.status(500).json({ message: `get owner restaurant error ${error}` })
    }
}

export const createRestaurant = async (req, res) => {
    try {
        const existing = await Restaurant.findOne({ owner: req.userId })
        if (existing) return res.status(400).json({ message: "You already have a restaurant" })
        const restaurant = await Restaurant.create({ ...req.body, owner: req.userId })
        return res.status(201).json(restaurant)
    } catch (error) {
        return res.status(500).json({ message: `create restaurant error ${error}` })
    }
}

export const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOneAndUpdate(
            { owner: req.userId },
            req.body,
            { new: true }
        )
        return res.status(200).json(restaurant)
    } catch (error) {
        return res.status(500).json({ message: `update restaurant error ${error}` })
    }
}

export const getOwnerOrders = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.userId })
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" })
        const orders = await Order.find({ restaurant: restaurant._id })
            .populate("user", "fullName mobile")
            .sort({ createdAt: -1 })
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: `get owner orders error ${error}` })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `update order status error ${error}` })
    }
}

export const getNearbyRestaurants = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query
        const restaurants = await Restaurant.find({ isOpen: true })

        if (!lat || !lng) {
            return res.status(200).json(restaurants)
        }

        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)
        const radiusKm = parseFloat(radius)

        const nearby = restaurants.map(r => {
            const R = 6371
            const dLat = (r.location.lat - userLat) * Math.PI / 180
            const dLng = (r.location.lng - userLng) * Math.PI / 180
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(r.location.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c
            return { ...r.toObject(), distance: Math.round(distance * 10) / 10 }
        }).filter(r => r.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)

        return res.status(200).json(nearby)
    } catch (error) {
        return res.status(500).json({ message: `nearby restaurants error ${error}` })
    }
}