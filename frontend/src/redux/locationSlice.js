import { createSlice } from "@reduxjs/toolkit"

const locationSlice = createSlice({
    name: "location",
    initialState: {
        userLocation: null,
        locationName: "",
        city: ""
    },
    reducers: {
        setLocation: (state, action) => {
            state.userLocation = action.payload.coords
            state.locationName = action.payload.name
            state.city = action.payload.city
        },
        clearLocation: (state) => {
            state.userLocation = null
            state.locationName = ""
            state.city = ""
        }
    }
})

export const { setLocation, clearLocation } = locationSlice.actions
export default locationSlice.reducer