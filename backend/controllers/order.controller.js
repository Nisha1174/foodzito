import Order from "../models/order.model.js"

export const placeOrder = async (req, res) => {
    try {
        const { restaurantId, items, totalAmount, paymentMethod, deliveryAddress, deliveryLocation } = req.body
        const order = await Order.create({
            user: req.userId,
            restaurant: restaurantId,
            items, totalAmount, paymentMethod,
            paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
            deliveryAddress, deliveryLocation
        })
        return res.status(201).json(order)
    } catch (error) {
        return res.status(500).json({ message: `place order error ${error}` })
    }
}

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate("restaurant", "name image address")
            .populate("items.menuItem", "name price image")
            .sort({ createdAt: -1 })
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: `get orders error ${error}` })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id)
            .populate("restaurant", "name image address")
            .populate("deliveryBoy", "fullName mobile")
            .populate("items.menuItem", "name price image")
        if (!order) return res.status(404).json({ message: "Order not found" })
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `get order error ${error}` })
    }
}

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id)
        if (!order) return res.status(404).json({ message: "Order not found" })
        if (order.status !== "pending") return res.status(400).json({ message: "Order cannot be cancelled now" })
        order.status = "cancelled"
        await order.save()
        return res.status(200).json({ message: "Order cancelled successfully" })
    } catch (error) {
        return res.status(500).json({ message: `cancel order error ${error}` })
    }
}

export const getDeliveryOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [
                { deliveryBoy: req.userId },
                { status: "confirmed", deliveryBoy: null }
            ]
        })
            .populate("restaurant", "name address")
            .populate("user", "fullName mobile")
            .sort({ createdAt: -1 })
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: `get delivery orders error ${error}` })
    }
}

export const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findByIdAndUpdate(orderId, {
            deliveryBoy: req.userId,
            status: "on_the_way"
        }, { new: true })
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `accept order error ${error}` })
    }
}

export const markDelivered = async (req, res) => {
    try {
        const { orderId } = req.body
        const order = await Order.findByIdAndUpdate(orderId, {
            status: "delivered",
            paymentStatus: "paid"
        }, { new: true })
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `mark delivered error ${error}` })
    }
}