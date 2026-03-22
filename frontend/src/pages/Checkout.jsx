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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛒</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#0f0f0f', marginBottom: '8px', textAlign: 'center' }}>Cart is empty</h2>
                <button onClick={() => navigate('/')} style={{
                    padding: '12px 28px',
                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                    color: 'white', border: 'none', borderRadius: '12px',
                    fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', marginTop: '16px'
                }}>Browse Restaurants</button>
            </div>
        </div>
    )

    return (
        <>
            <style>{`
                .checkout-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 24px;
                    align-items: start;
                }
                @media (max-width: 768px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .checkout-summary {
                        position: static !important;
                    }
                }
            `}</style>

            <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
                <Navbar onCartClick={() => {}} />

                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1rem,3vw,2rem) clamp(1rem,3vw,1.5rem)' }}>

                    {/* Header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <button onClick={() => navigate(-1)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#6b7280', fontSize: '14px',
                            fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            marginBottom: '12px', padding: 0
                        }}>← Back</button>
                        <h1 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 'clamp(1.5rem,4vw,2rem)',
                            fontWeight: '800', color: '#0f0f0f', margin: 0
                        }}>
                            Checkout 🛒
                        </h1>
                    </div>

                    <div className="checkout-grid">

                        {/* ── Delivery Address ── */}
                        <div style={{
                            background: 'white', borderRadius: '20px',
                            padding: 'clamp(1rem,3vw,1.5rem)',
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            <h2 style={{
                                fontFamily: 'Syne, sans-serif', fontSize: '1.1rem',
                                fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px'
                            }}>
                                📍 Delivery Address
                            </h2>

                            {/* User info strip */}
                            <div style={{
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                borderRadius: '12px', padding: '10px 14px', marginBottom: '14px',
                                fontSize: '13px', color: '#15803d',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                flexWrap: 'wrap'
                            }}>
                                <span>👤</span>
                                <span>Delivering to <strong>{userData?.fullName}</strong></span>
                                <span>• {userData?.mobile}</span>
                            </div>

                            <textarea
                                placeholder="Enter your full delivery address..."
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%', padding: '13px 16px',
                                    border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                    fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
                                    outline: 'none', resize: 'none',
                                    boxSizing: 'border-box', color: '#111',
                                    transition: 'all 0.2s'
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

                            {/* On mobile show the proceed button here too (below address) */}
                            <div className="mobile-checkout-btn" style={{ marginTop: '20px' }}>
                                <button onClick={handleProceedToPayment} style={{
                                    width: '100%', padding: '16px',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                    color: 'white', border: 'none', borderRadius: '14px',
                                    fontSize: '16px', fontWeight: '700',
                                    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                                    boxShadow: '0 8px 24px rgba(255,77,45,0.35)',
                                    transition: 'all 0.2s', display: 'none'
                                }}>
                                    Proceed to Payment → ₹{total}
                                </button>
                            </div>
                        </div>

                        {/* ── Order Summary ── */}
                        <div
                            className="checkout-summary"
                            style={{
                                background: 'white', borderRadius: '20px',
                                padding: 'clamp(1rem,3vw,1.5rem)',
                                border: '1px solid rgba(0,0,0,0.06)',
                                position: 'sticky', top: '90px'
                            }}
                        >
                            <h2 style={{
                                fontFamily: 'Syne, sans-serif', fontSize: '1.1rem',
                                fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px'
                            }}>
                                Order Summary
                            </h2>

                            {/* Cart items */}
                            <div style={{ marginBottom: '16px' }}>
                                {cartItems.map(item => (
                                    <div key={item._id} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', padding: '10px 0',
                                        borderBottom: '1px solid #f9fafb', gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                            <span style={{
                                                background: '#ff4d2d', color: 'white',
                                                borderRadius: '6px', padding: '2px 7px',
                                                fontSize: '12px', fontWeight: '700', flexShrink: 0
                                            }}>
                                                {item.quantity}x
                                            </span>
                                            <span style={{
                                                fontSize: '14px', color: '#374151', fontWeight: '500',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>{item.name}</span>
                                        </div>
                                        <span style={{
                                            fontSize: '14px', fontWeight: '700',
                                            color: '#0f0f0f', flexShrink: 0
                                        }}>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Bill */}
                            <div style={{
                                background: '#f9fafb', borderRadius: '14px',
                                padding: '14px', marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
                                    <span style={{ fontSize: '13px', color: '#374151' }}>₹{subtotal}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Delivery fee</span>
                                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>FREE 🎉</span>
                                </div>
                                <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '10px' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                boxShadow: '0 8px 24px rgba(255,77,45,0.35)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
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

            {/* Show mobile proceed button inside address card on small screens */}
            <style>{`
                @media (max-width: 768px) {
                    .mobile-checkout-btn button {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    )
}

export default Checkout