import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        cartItems: [],
        cartRestaurantId: null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        addToCart: (state, action) => {
            const item = action.payload
            if (state.cartRestaurantId && state.cartRestaurantId !== item.restaurantId) {
                state.cartItems = []
            }
            state.cartRestaurantId = item.restaurantId
            const existing = state.cartItems.find(i => i._id === item._id)
            if (existing) {
                existing.quantity += 1
            } else {
                state.cartItems.push({ ...item, quantity: 1 })
            }
        },
        removeFromCart: (state, action) => {
            const item = action.payload
            const existing = state.cartItems.find(i => i._id === item._id)
            if (existing) {
                if (existing.quantity === 1) {
                    state.cartItems = state.cartItems.filter(i => i._id !== item._id)
                } else {
                    existing.quantity -= 1
                }
            }
            if (state.cartItems.length === 0) {
                state.cartRestaurantId = null
            }
        },
        clearCart: (state) => {
            state.cartItems = []
            state.cartRestaurantId = null
        }
    }
})

export const { setUserData, addToCart, removeFromCart, clearCart } = userSlice.actions
export default userSlice.reducer