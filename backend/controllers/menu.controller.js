import MenuItem from "../models/menuItem.model.js"
import Restaurant from "../models/restaurant.model.js"

export const getMenuByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params
        const menuItems = await MenuItem.find({ restaurant: restaurantId, isAvailable: true })
        return res.status(200).json(menuItems)
    } catch (error) {
        return res.status(500).json({ message: `get menu error ${error}` })
    }
}

export const addMenuItem = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.userId })
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" })
        const menuItem = await MenuItem.create({ ...req.body, restaurant: restaurant._id })
        return res.status(201).json(menuItem)
    } catch (error) {
        return res.status(500).json({ message: `add menu item error ${error}` })
    }
}

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params
        const menuItem = await MenuItem.findByIdAndUpdate(id, req.body, { new: true })
        return res.status(200).json(menuItem)
    } catch (error) {
        return res.status(500).json({ message: `update menu item error ${error}` })
    }
}

export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params
        await MenuItem.findByIdAndDelete(id)
        return res.status(200).json({ message: "Menu item deleted" })
    } catch (error) {
        return res.status(500).json({ message: `delete menu item error ${error}` })
    }
}

export const getOwnerMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.userId })
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" })
        const menuItems = await MenuItem.find({ restaurant: restaurant._id })
        return res.status(200).json(menuItems)
    } catch (error) {
        return res.status(500).json({ message: `get owner menu error ${error}` })
    }
}