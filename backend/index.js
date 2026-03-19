import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import restaurantRouter from "./routes/restaurant.routes.js"
import menuRouter from "./routes/menu.routes.js"
import orderRouter from "./routes/order.routes.js"
import reviewRouter from "./routes/review.routes.js"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"


const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 5000

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/restaurant", restaurantRouter)
app.use("/api/menu", menuRouter)
app.use("/api/order", orderRouter)
app.use("/api/review", reviewRouter)

app.get("/", (req, res) => {
    res.json({ message: "FoodZito API is running!" })
})

// Socket.io
export const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
})

const activeDeliveries = {}

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    // Delivery boy joins order room
    socket.on("join_order", (orderId) => {
        socket.join(orderId)
        console.log(`Socket ${socket.id} joined order ${orderId}`)
    })

    // Delivery boy sends location update
    socket.on("delivery_location_update", ({ orderId, location }) => {
        activeDeliveries[orderId] = location
        // Broadcast to all in the order room (customer sees it)
        io.to(orderId).emit("location_updated", location)
    })

    // Customer requests current location
    socket.on("get_delivery_location", (orderId) => {
        if (activeDeliveries[orderId]) {
            socket.emit("location_updated", activeDeliveries[orderId])
        }
    })

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id)
    })
})

httpServer.listen(port, () => {
    connectDb()
    console.log(`server started at ${port}`)
})