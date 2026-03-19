import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import Navbar from '../components/Navbar'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { io } from 'socket.io-client'
import ReviewModal from '../components/ReviewModal'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})
const restaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been received', eta: null },
    { key: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Restaurant confirmed your order', eta: '25-30' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is preparing your food', eta: '15-20' },
    { key: 'on_the_way', label: 'On the Way', icon: '🛵', desc: 'Delivery partner is on the way', eta: '10-15' },
    { key: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Order delivered successfully!', eta: '0' }
]

function OrderTracking() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deliveryLocation, setDeliveryLocation] = useState(null)
    const [socketConnected, setSocketConnected] = useState(false)
    const [eta, setEta] = useState(30)
    const socketRef = useRef(null)
    const etaRef = useRef(null)
    const [showReview, setShowReview] = useState(false)
const [canReview, setCanReview] = useState(false)
const [reviewed, setReviewed] = useState(false)

    useEffect(() => {
        fetchOrder()
        const interval = setInterval(fetchOrder, 10000)

        // Socket connection
        socketRef.current = io(serverUrl)
        socketRef.current.on('connect', () => {
            setSocketConnected(true)
            socketRef.current.emit('join_order', id)
            socketRef.current.emit('get_delivery_location', id)
        })
        socketRef.current.on('location_updated', (location) => {
            setDeliveryLocation(location)
        })
        socketRef.current.on('disconnect', () => setSocketConnected(false))

        return () => {
            clearInterval(interval)
            if (socketRef.current) socketRef.current.disconnect()
            if (etaRef.current) clearInterval(etaRef.current)
        }
    }, [id])

    useEffect(() => {
        if (order?.status === 'on_the_way') {
            setEta(15)
            etaRef.current = setInterval(() => {
                setEta(prev => {
                    if (prev <= 1) { clearInterval(etaRef.current); return 0 }
                    return prev - 1
                })
            }, 60000)
        } else if (order?.status === 'preparing') {
            setEta(20)
        } else if (order?.status === 'confirmed') {
            setEta(30)
        } else if (order?.status === 'pending') {
            setEta(35)
        } else if (order?.status === 'delivered') {
            setEta(0)
        }
    }, [order?.status])

    useEffect(() => {
    const checkReview = async () => {
        if (order?.status === 'delivered') {
            try {
                const { data } = await axios.get(
                    `${serverUrl}/api/review/can-review/${id}`,
                    { withCredentials: true }
                )
                setCanReview(data.canReview)
            } catch (error) {
                console.log(error)
            }
        }
    }
    if (order) checkReview()
}, [order])

    const fetchOrder = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/${id}`, { withCredentials: true })
            setOrder(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentStepIndex = () => {
        if (!order) return 0
        if (order.status === 'cancelled') return -1
        return statusSteps.findIndex(s => s.key === order.status)
    }

    const currentStep = getCurrentStepIndex()
    const restaurantLat = 26.1197
    const restaurantLng = 85.3910
    const deliveryLat = order?.deliveryLocation?.lat || 26.1220
    const deliveryLng = order?.deliveryLocation?.lng || 85.3930
    const currentDeliveryLat = deliveryLocation?.lat || restaurantLat
    const currentDeliveryLng = deliveryLocation?.lng || restaurantLng

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }} />
            </div>
        </div>
    )

    if (!order) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Order not found</p>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => {}} />

            <div style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div className="animate-fadeInUp" style={{ marginBottom: '1.5rem' }}>
                    <button onClick={() => navigate('/')} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '12px', padding: 0
                    }}>← Back to Home</button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: '800', color: '#0f0f0f', margin: '0 0 4px' }}>
                                Order Tracking 📍
                            </h1>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                                Order ID: <span style={{ fontFamily: 'monospace', color: '#374151' }}>#{id.slice(-8).toUpperCase()}</span>
                            </p>
                        </div>
                        {/* ETA Badge */}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <div style={{
                                background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                                borderRadius: '16px', padding: '14px 20px',
                                textAlign: 'center', minWidth: '130px'
                            }}>
                                <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                                    ESTIMATED TIME
                                </p>
                                <p style={{
                                    margin: 0, fontFamily: 'Syne, sans-serif',
                                    fontSize: '2rem', fontWeight: '800',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ffb347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>{eta} min</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Live estimate</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
{/* Review Button */}
{order.status === 'delivered' && canReview && !reviewed && (
    <div className="animate-scaleIn" style={{
        background: 'linear-gradient(135deg, #fff5f3, white)',
        borderRadius: '20px', padding: '1.5rem',
        border: '2px solid #ff4d2d', marginBottom: '24px',
        textAlign: 'center'
    }}>
        <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>⭐</p>
        <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 6px', color: '#0f0f0f' }}>
            How was your order?
        </h3>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 16px' }}>
            Your feedback helps other customers
        </p>
        <button onClick={() => setShowReview(true)} style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            fontFamily: 'Syne, sans-serif',
            boxShadow: '0 6px 20px rgba(255,77,45,0.3)'
        }}>
            Rate this Order ⭐
        </button>
    </div>
)}

{reviewed && (
    <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: '16px', padding: '1rem', marginBottom: '24px',
        textAlign: 'center', fontSize: '14px', color: '#15803d', fontWeight: '600'
    }}>
        ✅ Thank you for your review!
    </div>
)}

{showReview && (
    <ReviewModal
        order={order}
        onClose={() => setShowReview(false)}
        onSuccess={() => { setReviewed(true); setCanReview(false) }}
    />
)}
                {/* LIVE MAP - Always visible */}
                {order.status !== 'cancelled' && (
                    <div className="animate-fadeInUp delay-1" style={{
                        background: 'white', borderRadius: '20px',
                        padding: '1.25rem', marginBottom: '20px',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: '700', color: '#0f0f0f', margin: 0 }}>
                                🗺️ Live Tracking Map
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: socketConnected ? '#10b981' : '#f59e0b',
                                    animation: socketConnected ? 'pulse 2s infinite' : 'none'
                                }} />
                                <span style={{ fontSize: '12px', color: socketConnected ? '#10b981' : '#f59e0b', fontWeight: '500' }}>
                                    {socketConnected ? 'Live' : 'Connecting...'}
                                </span>
                            </div>
                        </div>

                        {/* Map */}
                        <div style={{ borderRadius: '14px', overflow: 'hidden', height: '320px', marginBottom: '12px' }}>
                            <MapContainer
                                center={[(restaurantLat + deliveryLat) / 2, (restaurantLng + deliveryLng) / 2]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />

                                {/* Restaurant marker */}
                                <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
                                    <Popup>
                                        <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            <strong>🍽️ {order.restaurant?.name}</strong><br />
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>Pickup location</span>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Customer marker */}
                                <Marker position={[deliveryLat, deliveryLng]} icon={userIcon}>
                                    <Popup>
                                        <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                            <strong>🏠 Your Location</strong><br />
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{order.deliveryAddress}</span>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Delivery boy marker */}
                                {(order.status === 'on_the_way' || deliveryLocation) && (
                                    <Marker position={[currentDeliveryLat, currentDeliveryLng]} icon={deliveryIcon}>
                                        <Popup>
                                            <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                                <strong>🛵 Delivery Partner</strong><br />
                                                <span style={{ fontSize: '12px', color: '#10b981' }}>On the way • {eta} min away</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Route line */}
                                <Polyline
                                    positions={[
                                        [restaurantLat, restaurantLng],
                                        [currentDeliveryLat, currentDeliveryLng],
                                        [deliveryLat, deliveryLng]
                                    ]}
                                    color="#ff4d2d" weight={3}
                                    dashArray="8" opacity={0.7}
                                />
                            </MapContainer>
                        </div>

                        {/* Map Legend */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                                { color: '#f59e0b', label: `Restaurant (${order.restaurant?.name})` },
                                { color: '#ef4444', label: 'Your location' },
                                { color: '#10b981', label: 'Delivery partner' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Status Tracker */}
                {order.status === 'cancelled' ? (
                    <div className="animate-scaleIn" style={{
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '20px', padding: '2rem', textAlign: 'center', marginBottom: '20px'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</div>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#dc2626', margin: '0 0 8px' }}>Order Cancelled</h2>
                        <p style={{ color: '#6b7280', margin: 0 }}>This order has been cancelled</p>
                    </div>
                ) : (
                    <div className="animate-fadeInUp delay-2" style={{
                        background: 'white', borderRadius: '20px',
                        padding: '1.5rem', marginBottom: '20px',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>Live Status Updates</span>
                        </div>

                        {statusSteps.map((step, index) => {
                            const isDone = index < currentStep
                            const isActive = index === currentStep
                            const isPending = index > currentStep
                            return (
                                <div key={step.key} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '50%',
                                            background: isDone
                                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                                : isActive
                                                    ? 'linear-gradient(135deg, #ff4d2d, #ff7043)'
                                                    : '#f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '20px',
                                            boxShadow: isActive ? '0 4px 16px rgba(255,77,45,0.35)' : 'none',
                                            animation: isActive ? 'pulse 2s infinite' : 'none',
                                            flexShrink: 0, transition: 'all 0.3s'
                                        }}>
                                            {isDone ? '✓' : step.icon}
                                        </div>
                                        {index < statusSteps.length - 1 && (
                                            <div style={{
                                                width: '2px', height: '40px',
                                                background: isDone ? '#10b981' : '#e5e7eb',
                                                margin: '4px 0', transition: 'all 0.5s'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ paddingTop: '8px', opacity: isPending ? 0.4 : 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <p style={{
                                                margin: 0, fontWeight: isActive ? '700' : '600',
                                                fontSize: '15px', fontFamily: 'Syne, sans-serif',
                                                color: isActive ? '#ff4d2d' : isDone ? '#10b981' : '#374151'
                                            }}>{step.label}</p>
                                            {isActive && (
                                                <span style={{
                                                    fontSize: '11px', background: '#fff5f3',
                                                    color: '#ff4d2d', padding: '2px 8px',
                                                    borderRadius: '999px', fontFamily: 'DM Sans, sans-serif',
                                                    fontWeight: '600'
                                                }}>Current</span>
                                            )}
                                            {isActive && step.eta && (
                                                <span style={{
                                                    fontSize: '11px', background: '#f0fdf4',
                                                    color: '#15803d', padding: '2px 8px',
                                                    borderRadius: '999px', fontFamily: 'DM Sans, sans-serif',
                                                    fontWeight: '600'
                                                }}>~{eta} min</span>
                                            )}
                                        </div>
                                        <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#9ca3af' }}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Order Details */}
                <div className="animate-fadeInUp delay-3" style={{
                    background: 'white', borderRadius: '20px',
                    padding: '1.5rem', marginBottom: '20px',
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px' }}>
                        🧾 Order Details
                    </h2>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px', background: '#f9fafb', borderRadius: '12px', marginBottom: '16px'
                    }}>
                        <span style={{ fontSize: '1.8rem' }}>🍽️</span>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: '#111', fontFamily: 'Syne, sans-serif' }}>
                                {order.restaurant?.name}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{order.restaurant?.address}</p>
                        </div>
                    </div>
                    {order.items.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none'
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', borderTop: '2px solid #f3f4f6', marginTop: '10px' }}>
                        <span style={{ fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>Total</span>
                        <span style={{ fontWeight: '800', fontSize: '18px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>₹{order.totalAmount}</span>
                    </div>
                </div>

                {/* Delivery & Payment */}
                <div className="animate-fadeInUp delay-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>DELIVERY ADDRESS</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontWeight: '500', lineHeight: 1.5 }}>
                            📍 {order.deliveryAddress}
                        </p>
                    </div>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.2rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>PAYMENT</p>
                        <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                            💳 {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}
                        </p>
                        <span style={{
                            fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px',
                            background: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef9c3',
                            color: order.paymentStatus === 'paid' ? '#15803d' : '#854d0e'
                        }}>
                            {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/')} style={{
                        flex: 1, padding: '14px',
                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                        color: 'white', border: 'none', borderRadius: '14px',
                        fontSize: '15px', fontWeight: '700',
                        fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                    >Order More Food 🍕</button>
                    <button onClick={() => navigate('/my-orders')} style={{
                        flex: 1, padding: '14px', background: 'white',
                        color: '#374151', border: '1.5px solid #e5e7eb',
                        borderRadius: '14px', fontSize: '15px', fontWeight: '600',
                        fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4d2d'; e.currentTarget.style.color = '#ff4d2d' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151' }}
                    >My Orders 📦</button>
                </div>
            </div>
        </div>
    )
}

export default OrderTracking