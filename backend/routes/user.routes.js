import express from "express"
import { getCurrentUser, updateUser } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"

const userRouter = express.Router()

userRouter.get("/current", isAuth, getCurrentUser)
userRouter.put("/update", isAuth, updateUser)

export default userRouter