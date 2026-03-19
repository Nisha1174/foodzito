import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
import Restaurant from "./models/restaurant.model.js"
import User from "./models/user.model.js"

const seedRestaurants = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected...")

    let owner = await User.findOne({ role: "owner" })
    if (!owner) owner = await User.findOne({})

    await Restaurant.deleteMany({})
    console.log("Cleared old restaurants...")

    const restaurants = [
        {
            name: "Rajmahal Hotel",
            description: "Famous for authentic Bihari cuisine and thali",
            address: "Brahmpura, Muzaffarpur",
            city: "Muzaffarpur",
            category: "Indian",
            image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600",
            rating: 4.5, isOpen: true, deliveryTime: 25,
            owner: owner._id,
            location: { lat: 26.1197, lng: 85.3910 }
        },
        {
            name: "Kwality Restaurant",
            description: "Best North Indian food in Muzaffarpur since 1985",
            address: "Juran Chapra, Muzaffarpur",
            city: "Muzaffarpur",
            category: "Indian",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
            rating: 4.3, isOpen: true, deliveryTime: 30,
            owner: owner._id,
            location: { lat: 26.1220, lng: 85.3890 }
        },
        {
            name: "Chinese Dragon",
            description: "Authentic Chinese and Indo-Chinese cuisine",
            address: "Motijheel, Muzaffarpur",
            city: "Muzaffarpur",
            category: "Chinese",
            image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600",
            rating: 4.1, isOpen: true, deliveryTime: 20,
            owner: owner._id,
            location: { lat: 26.1150, lng: 85.3950 }
        },
        {
            name: "Burger Point",
            description: "Crispy burgers and fast food",
            address: "Saraiyaganj, Muzaffarpur",
            city: "Muzaffarpur",
            category: "FastFood",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
            rating: 4.0, isOpen: true, deliveryTime: 15,
            owner: owner._id,
            location: { lat: 26.1180, lng: 85.3870 }
        },
        {
            name: "South Spice",
            description: "Authentic South Indian dosas and idlis",
            address: "Ramna Road, Muzaffarpur",
            city: "Muzaffarpur",
            category: "South Indian",
            image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600",
            rating: 4.4, isOpen: true, deliveryTime: 20,
            owner: owner._id,
            location: { lat: 26.1230, lng: 85.3920 }
        },
        {
            name: "Pizza Hub",
            description: "Fresh wood fired pizzas and pasta",
            address: "Ahiyapur, Muzaffarpur",
            city: "Muzaffarpur",
            category: "Italian",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
            rating: 4.2, isOpen: true, deliveryTime: 35,
            owner: owner._id,
            location: { lat: 26.1160, lng: 85.3880 }
        },
        {
            name: "Cafe Coffee Corner",
            description: "Best coffee and cold beverages in town",
            address: "Club Road, Muzaffarpur",
            city: "Muzaffarpur",
            category: "Beverages",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
            rating: 4.3, isOpen: true, deliveryTime: 15,
            owner: owner._id,
            location: { lat: 26.1210, lng: 85.3930 }
        },
        {
            name: "Mithai Ghar",
            description: "Traditional sweets and desserts from Bihar",
            address: "Chotti Saraiyan, Muzaffarpur",
            city: "Muzaffarpur",
            category: "Desserts",
            image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600",
            rating: 4.6, isOpen: true, deliveryTime: 25,
            owner: owner._id,
            location: { lat: 26.1190, lng: 85.3900 }
        }
    ]

    await Restaurant.insertMany(restaurants)
    console.log("✅ 8 Muzaffarpur restaurants added!")
    process.exit(0)
}

seedRestaurants().catch(err => {
    console.log("Seed error:", err)
    process.exit(1)
})