import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

function Checkout() {
    const { cartItems, cartRestaurantId } = useSelector(state => state.user)
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const [address, setAddress] = useState('')
    const [err, setErr] = useState('')

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal

    const handleProceedToPayment = () => {
        if (!address.trim()) return setErr('Please enter delivery address')
        setErr('')

        const orderData = {
            restaurantId: cartRestaurantId,
            items: cartItems.map(item => ({
                menuItem: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount: total,
            deliveryAddress: address,
            deliveryLocation: { lat: 26.1197, lng: 85.3910 }
        }

        navigate('/payment', { state: { orderData, total } })
    }

    if (cartItems.length === 0) return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => {}} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#0f0f0f', marginBottom: '8px' }}>Cart is empty</h2>
                <button onClick={() => navigate('/')} style={{
                    padding: '12px 28px', background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                    color: 'white', border: 'none', borderRadius: '12px',
                    fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', marginTop: '16px'
                }}>Browse Restaurants</button>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => {}} />
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate(-1)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: 0
                    }}>← Back</button>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: '800', color: '#0f0f0f', margin: 0 }}>
                        Checkout 🛒
                    </h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

                    {/* Delivery Address */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px' }}>
                            📍 Delivery Address
                        </h2>
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '12px', padding: '10px 14px', marginBottom: '14px',
                            fontSize: '13px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span>👤</span> Delivering to <strong>{userData?.fullName}</strong> • {userData?.mobile}
                        </div>
                        <textarea
                            placeholder="Enter your full delivery address..."
                            value={address} onChange={e => setAddress(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%', padding: '13px 16px',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
                                outline: 'none', resize: 'none', boxSizing: 'border-box',
                                color: '#111', transition: 'all 0.2s'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                        />
                        {err && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: '10px', padding: '10px 14px', marginTop: '12px',
                                color: '#dc2626', fontSize: '13px'
                            }}>⚠️ {err}</div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div style={{
                        background: 'white', borderRadius: '20px', padding: '1.5rem',
                        border: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: '90px'
                    }}>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px' }}>
                            Order Summary
                        </h2>
                        <div style={{ marginBottom: '16px' }}>
                            {cartItems.map(item => (
                                <div key={item._id} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', padding: '10px 0',
                                    borderBottom: '1px solid #f9fafb'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ background: '#ff4d2d', color: 'white', borderRadius: '6px', padding: '2px 7px', fontSize: '12px', fontWeight: '700' }}>
                                            {item.quantity}x
                                        </span>
                                        <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f0f0f' }}>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
                                <span style={{ fontSize: '13px', color: '#374151' }}>₹{subtotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>Delivery fee</span>
                                <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>FREE 🎉</span>
                            </div>
                            <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '10px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>Total</span>
                                <span style={{ fontWeight: '800', fontSize: '20px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>₹{total}</span>
                            </div>
                        </div>

                        <button onClick={handleProceedToPayment} style={{
                            width: '100%', padding: '16px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            color: 'white', border: 'none', borderRadius: '14px',
                            fontSize: '16px', fontWeight: '700',
                            fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(255,77,45,0.35)', transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
                        >
                            Proceed to Payment →
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: '12px 0 0' }}>
                            🔒 Safe & secure checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout