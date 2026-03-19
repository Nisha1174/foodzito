import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import locationSlice from "./locationSlice"

export const store = configureStore({
    reducer: {
        user: userSlice,
        location: locationSlice
    }
})