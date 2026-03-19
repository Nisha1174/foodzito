import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
import MenuItem from "./models/menuItem.model.js"
import Restaurant from "./models/restaurant.model.js"

const seedMenu = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected...")

    const restaurants = await Restaurant.find({})
    if (restaurants.length === 0) {
        console.log("No restaurants found! Run seed.js first.")
        process.exit(1)
    }

    await MenuItem.deleteMany({})
    console.log("Cleared old menu items...")

    const getR = (name) => restaurants.find(r => r.name === name)?._id

    const menuItems = [
        // Rajmahal Hotel - Indian
        { name: "Rajmahal Thali", description: "Full Bihari thali with dal, sabzi, roti, rice", price: 180, category: "Thali", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", restaurant: getR("Rajmahal Hotel"), isAvailable: true },
        { name: "Litti Chokha", description: "Traditional Bihari litti with chokha", price: 120, category: "Main Course", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", restaurant: getR("Rajmahal Hotel"), isAvailable: true },
        { name: "Sattu Paratha", description: "Stuffed sattu paratha with pickle", price: 80, category: "Breakfast", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", restaurant: getR("Rajmahal Hotel"), isAvailable: true },
        { name: "Dal Tadka", description: "Yellow dal with ghee tadka", price: 100, category: "Main Course", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", restaurant: getR("Rajmahal Hotel"), isAvailable: true },
        { name: "Lassi", description: "Sweet chilled lassi", price: 60, category: "Drinks", image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400", restaurant: getR("Rajmahal Hotel"), isAvailable: true },

        // Kwality Restaurant - Indian
        { name: "Butter Chicken", description: "Creamy tomato based chicken curry", price: 280, category: "Main Course", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", restaurant: getR("Kwality Restaurant"), isAvailable: true },
        { name: "Dal Makhani", description: "Slow cooked black lentils in butter", price: 200, category: "Main Course", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", restaurant: getR("Kwality Restaurant"), isAvailable: true },
        { name: "Garlic Naan", description: "Fresh baked garlic naan from tandoor", price: 50, category: "Breads", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", restaurant: getR("Kwality Restaurant"), isAvailable: true },
        { name: "Paneer Tikka", description: "Grilled cottage cheese with spices", price: 240, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400", restaurant: getR("Kwality Restaurant"), isAvailable: true },
        { name: "Mango Lassi", description: "Sweet yogurt mango drink", price: 80, category: "Drinks", image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400", restaurant: getR("Kwality Restaurant"), isAvailable: true },

        // Chinese Dragon
        { name: "Chicken Fried Rice", description: "Wok tossed rice with chicken", price: 200, category: "Main Course", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400", restaurant: getR("Chinese Dragon"), isAvailable: true },
        { name: "Hakka Noodles", description: "Stir fried noodles with vegetables", price: 180, category: "Main Course", image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400", restaurant: getR("Chinese Dragon"), isAvailable: true },
        { name: "Manchurian", description: "Crispy balls in spicy sauce", price: 160, category: "Starters", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400", restaurant: getR("Chinese Dragon"), isAvailable: true },
        { name: "Spring Rolls", description: "Crispy vegetable spring rolls", price: 130, category: "Starters", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400", restaurant: getR("Chinese Dragon"), isAvailable: true },

        // Burger Point
        { name: "Classic Burger", description: "Juicy patty with lettuce and cheese", price: 149, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", restaurant: getR("Burger Point"), isAvailable: true },
        { name: "Chicken Burger", description: "Crispy fried chicken burger", price: 169, category: "Burgers", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400", restaurant: getR("Burger Point"), isAvailable: true },
        { name: "Loaded Fries", description: "Crispy fries with cheese sauce", price: 99, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400", restaurant: getR("Burger Point"), isAvailable: true },
        { name: "Cold Coffee", description: "Chilled coffee with ice cream", price: 99, category: "Drinks", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400", restaurant: getR("Burger Point"), isAvailable: true },

        // South Spice
        { name: "Masala Dosa", description: "Crispy dosa with spiced potato filling", price: 100, category: "Dosas", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400", restaurant: getR("South Spice"), isAvailable: true },
        { name: "Idli Sambar", description: "Soft idlis with sambar and chutney", price: 70, category: "Breakfast", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400", restaurant: getR("South Spice"), isAvailable: true },
        { name: "Vada", description: "Crispy lentil donuts with chutney", price: 60, category: "Snacks", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400", restaurant: getR("South Spice"), isAvailable: true },
        { name: "Filter Coffee", description: "Traditional South Indian filter coffee", price: 40, category: "Drinks", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400", restaurant: getR("South Spice"), isAvailable: true },

        // Pizza Hub
        { name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 249, category: "Pizzas", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400", restaurant: getR("Pizza Hub"), isAvailable: true },
        { name: "Pepperoni Pizza", description: "Loaded with pepperoni and cheese", price: 299, category: "Pizzas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", restaurant: getR("Pizza Hub"), isAvailable: true },
        { name: "Pasta Arrabbiata", description: "Spicy tomato sauce pasta", price: 199, category: "Pasta", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400", restaurant: getR("Pizza Hub"), isAvailable: true },
        { name: "Garlic Bread", description: "Toasted bread with garlic butter", price: 89, category: "Sides", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400", restaurant: getR("Pizza Hub"), isAvailable: true },

        // Cafe Coffee Corner
        { name: "Bubble Tea", description: "Taiwan style bubble milk tea", price: 130, category: "Bubble Tea", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", restaurant: getR("Cafe Coffee Corner"), isAvailable: true },
        { name: "Mango Smoothie", description: "Fresh mango blended smoothie", price: 110, category: "Smoothies", image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400", restaurant: getR("Cafe Coffee Corner"), isAvailable: true },
        { name: "Cappuccino", description: "Classic Italian cappuccino", price: 120, category: "Coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400", restaurant: getR("Cafe Coffee Corner"), isAvailable: true },

        // Mithai Ghar
        { name: "Gulab Jamun", description: "Soft milk dumplings in sugar syrup", price: 60, category: "Indian Sweets", image: "https://images.unsplash.com/photo-1601303516534-bf4c8b78d0c1?w=400", restaurant: getR("Mithai Ghar"), isAvailable: true },
        { name: "Rasgulla", description: "Spongy cottage cheese balls in syrup", price: 60, category: "Indian Sweets", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400", restaurant: getR("Mithai Ghar"), isAvailable: true },
        { name: "Chocolate Cake", description: "Rich dark chocolate layer cake", price: 160, category: "Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400", restaurant: getR("Mithai Ghar"), isAvailable: true },
    ]

    const validItems = menuItems.filter(item => item.restaurant)
    await MenuItem.insertMany(validItems)
    console.log(`✅ ${validItems.length} menu items added!`)
    process.exit(0)
}

seedMenu().catch(err => {
    console.log("Seed error:", err)
    process.exit(1)
})