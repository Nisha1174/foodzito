import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import RestaurantPage from './pages/RestaurantPage'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import MyOrders from './pages/MyOrders'
import OwnerDashboard from './pages/OwnerDashboard'
import DeliveryDashboard from './pages/DeliveryDashboard'
import Profile from './pages/Profile'
import PaymentSimulator from './pages/PaymentSimulator'
import useGetCurrentUser from './hooks/getCurrentUser'

export const serverUrl = "http://localhost:5000"

function App() {
    useGetCurrentUser()
    const { userData } = useSelector(state => state.user)

    return (
        <Routes>
            <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
            <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
            <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />
            <Route path='/' element={userData ? <Home /> : <Navigate to={"/signin"} />} />
            <Route path='/restaurant/:id' element={userData ? <RestaurantPage /> : <Navigate to={"/signin"} />} />
            <Route path='/checkout' element={userData ? <Checkout /> : <Navigate to={"/signin"} />} />
            <Route path='/payment' element={userData ? <PaymentSimulator /> : <Navigate to={"/signin"} />} />
            <Route path='/order/:id' element={userData ? <OrderTracking /> : <Navigate to={"/signin"} />} />
            <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
            <Route path='/owner' element={userData?.role === 'owner' ? <OwnerDashboard /> : <Navigate to={"/"} />} />
            <Route path='/delivery' element={userData?.role === 'deliveryBoy' ? <DeliveryDashboard /> : <Navigate to={"/signin"} />} />
            <Route path='/profile' element={userData ? <Profile /> : <Navigate to={"/signin"} />} />
        </Routes>
    )
}

export default App