import mongoose from "mongoose"

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    address: { type: String, required: true },
    city: { type: String, required: true },
    category: {
        type: String,
        enum: ["Indian", "Chinese", "Italian", "FastFood", "South Indian", "Beverages", "Desserts"],
        required: true
    },
    image: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    deliveryTime: { type: Number, default: 30 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: {
        lat: { type: Number, default: 26.1197 },
        lng: { type: Number, default: 85.3910 }
    }
}, { timestamps: true })

const Restaurant = mongoose.model("Restaurant", restaurantSchema)
export default Restaurant