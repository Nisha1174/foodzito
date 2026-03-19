import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

const customerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})

const statusConfig = {
    pending: { label: 'Pending', bg: '#fef9c3', color: '#854d0e', icon: '⏳' },
    confirmed: { label: 'Confirmed', bg: '#e0f2fe', color: '#0369a1', icon: '✅' },
    preparing: { label: 'Preparing', bg: '#fef3c7', color: '#92400e', icon: '👨‍🍳' },
    on_the_way: { label: 'On the Way', bg: '#ede9fe', color: '#6d28d9', icon: '🛵' },
    delivered: { label: 'Delivered', bg: '#dcfce7', color: '#15803d', icon: '🎉' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c', icon: '❌' }
}

function DeliveryDashboard() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('available')
    const [isOnline, setIsOnline] = useState(true)
    const [myLocation, setMyLocation] = useState(null)
    const [tracking, setTracking] = useState(false)
    const [activeOrderId, setActiveOrderId] = useState(null)
    const socketRef = useRef(null)
    const watchIdRef = useRef(null)

    useEffect(() => {
        if (userData?.role !== 'deliveryBoy') { navigate('/'); return }
        fetchOrders()
        const interval = setInterval(fetchOrders, 15000)

        // Connect socket
        socketRef.current = io(serverUrl)

        return () => {
            clearInterval(interval)
            stopTracking()
            if (socketRef.current) socketRef.current.disconnect()
        }
    }, [])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/delivery-orders`, { withCredentials: true })
            setOrders(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const startTracking = (orderId) => {
        setActiveOrderId(orderId)
        setTracking(true)
        socketRef.current?.emit('join_order', orderId)

        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    setMyLocation(location)
                    socketRef.current?.emit('delivery_location_update', { orderId, location })
                },
                (err) => {
                    // Simulate movement for demo
                    simulateMovement(orderId)
                },
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            )
        } else {
            simulateMovement(orderId)
        }
    }

    const simulateMovement = (orderId) => {
        let lat = 26.1197
        let lng = 85.3910
        const targetLat = 26.1220
        const targetLng = 85.3930
        const steps = 20
        let step = 0

        const interval = setInterval(() => {
            if (step >= steps) { clearInterval(interval); return }
            lat += (targetLat - lat) / (steps - step)
            lng += (targetLng - lng) / (steps - step)
            const location = { lat, lng }
            setMyLocation(location)
            socketRef.current?.emit('delivery_location_update', { orderId, location })
            step++
        }, 3000)
    }

    const stopTracking = () => {
        setTracking(false)
        setActiveOrderId(null)
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
    }

    const handleAcceptOrder = async (orderId) => {
        try {
            await axios.post(`${serverUrl}/api/order/accept`, { orderId }, { withCredentials: true })
            fetchOrders()
            startTracking(orderId)
            setActiveTab('active')
        } catch (error) {
            console.log(error)
        }
    }

    const handleMarkDelivered = async (orderId) => {
        try {
            await axios.post(`${serverUrl}/api/order/mark-delivered`, { orderId }, { withCredentials: true })
            stopTracking()
            fetchOrders()
            setActiveTab('delivered')
        } catch (error) {
            console.log(error)
        }
    }

    const availableOrders = orders.filter(o => o.status === 'confirmed' && !o.deliveryBoy)
    const myOrders = orders.filter(o => o.deliveryBoy?._id === userData?._id || o.deliveryBoy === userData?._id)
    const deliveredOrders = myOrders.filter(o => o.status === 'delivered')
    const activeOrders = myOrders.filter(o => o.status === 'on_the_way')
    const todayEarnings = deliveredOrders
        .filter(o => new Date(o.updatedAt).toDateString() === new Date().toDateString())
        .reduce((s, o) => s + Math.round(o.totalAmount * 0.05), 0)

    const tabs = [
        { key: 'available', label: 'Available', icon: '🔔', count: availableOrders.length },
        { key: 'active', label: 'Active', icon: '🛵', count: activeOrders.length },
        { key: 'delivered', label: 'Delivered', icon: '✅', count: deliveredOrders.length }
    ]

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>🛵</div>
                <p style={{ color: '#6b7280' }}>Loading orders...</p>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            {/* Navbar */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{
                    maxWidth: '900px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '20px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>FoodZito</span>
                        <span style={{
                            fontSize: '12px', background: 'rgba(255,77,45,0.2)',
                            color: '#ff7043', padding: '3px 10px', borderRadius: '999px', fontWeight: '600'
                        }}>Delivery</span>
                        {tracking && (
                            <span style={{
                                fontSize: '12px', background: 'rgba(16,185,129,0.2)',
                                color: '#10b981', padding: '3px 10px', borderRadius: '999px',
                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                Live Tracking
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                {isOnline ? '🟢 Online' : '🔴 Offline'}
                            </span>
                            <div onClick={() => setIsOnline(p => !p)} style={{
                                width: '44px', height: '24px',
                                background: isOnline ? '#10b981' : '#6b7280',
                                borderRadius: '999px', cursor: 'pointer',
                                position: 'relative', transition: 'background 0.3s'
                            }}>
                                <div style={{
                                    position: 'absolute', top: '3px',
                                    left: isOnline ? '23px' : '3px',
                                    width: '18px', height: '18px',
                                    background: 'white', borderRadius: '50%',
                                    transition: 'left 0.3s'
                                }} />
                            </div>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                            👋 {userData?.fullName}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '2rem' }}>
                    {[
                        { label: "Today's Earnings", value: `₹${todayEarnings}`, icon: '💰', bg: '#dcfce7', text: '#15803d' },
                        { label: 'Total Delivered', value: deliveredOrders.length, icon: '✅', bg: '#e0f2fe', text: '#0369a1' },
                        { label: 'Active Orders', value: activeOrders.length, icon: '🛵', bg: '#fff5f3', text: '#ff4d2d' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'white', borderRadius: '16px',
                            padding: '1.2rem', border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', background: stat.bg,
                                borderRadius: '12px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', margin: '0 auto 10px'
                            }}>{stat.icon}</div>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>{stat.label}</p>
                            <p style={{ margin: 0, fontSize: '22px', fontWeight: '800', fontFamily: 'Syne, sans-serif', color: stat.text }}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* My location */}
                {myLocation && (
                    <div style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: '12px', padding: '10px 16px',
                        marginBottom: '1.5rem', display: 'flex',
                        alignItems: 'center', gap: '8px'
                    }}>
                        <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '13px', color: '#15803d', fontWeight: '500' }}>
                            📍 Your location: {myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}
                        </span>
                    </div>
                )}

                {/* Tabs */}
                <div style={{
                    display: 'flex', gap: '8px', marginBottom: '1.5rem',
                    background: 'white', padding: '6px', borderRadius: '14px',
                    border: '1px solid rgba(0,0,0,0.06)', width: 'fit-content'
                }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: '10px 20px', borderRadius: '10px', border: 'none',
                            background: activeTab === tab.key
                                ? 'linear-gradient(135deg, #ff4d2d, #ff7043)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : '#374151',
                            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.2s'
                        }}>
                            {tab.icon} {tab.label}
                            {tab.count > 0 && (
                                <span style={{
                                    background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#ff4d2d',
                                    color: 'white', borderRadius: '999px',
                                    padding: '1px 7px', fontSize: '11px', fontWeight: '700'
                                }}>{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Available Orders */}
                {activeTab === 'available' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {!isOnline ? (
                            <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>😴</div>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 8px' }}>You are offline</h3>
                                <p style={{ color: '#6b7280' }}>Toggle online to start receiving orders</p>
                            </div>
                        ) : availableOrders.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px', animation: 'float 2s ease-in-out infinite' }}>🛵</div>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 8px' }}>No available orders</h3>
                                <p style={{ color: '#6b7280' }}>New orders will appear here automatically</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>Live • Checking every 15s</span>
                                </div>
                            </div>
                        ) : availableOrders.map((order, i) => (
                            <div key={order._id} style={{
                                background: 'white', borderRadius: '20px', padding: '1.5rem',
                                border: '2px solid #ff4d2d', boxShadow: '0 4px 20px rgba(255,77,45,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{
                                            background: '#fff5f3', color: '#ff4d2d',
                                            padding: '3px 10px', borderRadius: '999px',
                                            fontSize: '12px', fontWeight: '700',
                                            display: 'inline-block', marginBottom: '8px',
                                            animation: 'pulse 2s infinite'
                                        }}>🔔 New Order</span>
                                        <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 3px', fontSize: '16px', fontWeight: '700', color: '#0f0f0f' }}>
                                            {order.restaurant?.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                            📍 {order.restaurant?.address}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 4px', fontWeight: '800', fontSize: '20px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                                            ₹{order.totalAmount}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                                            ~₹{Math.round(order.totalAmount * 0.05)} earnings
                                        </p>
                                    </div>
                                </div>
                                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#374151' }}>
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(' • ')}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                        🏠 Deliver to: {order.deliveryAddress}
                                    </p>
                                </div>
                                <button onClick={() => handleAcceptOrder(order._id)} style={{
                                    width: '100%', padding: '14px',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontSize: '15px', fontWeight: '700',
                                    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                                }}>
                                    🛵 Accept & Start Tracking
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Active Orders with Map */}
                {activeTab === 'active' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {activeOrders.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛵</div>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 8px' }}>No active deliveries</h3>
                                <p style={{ color: '#6b7280' }}>Accept an order to start delivering</p>
                            </div>
                        ) : activeOrders.map((order) => (
                            <div key={order._id} style={{
                                background: 'white', borderRadius: '20px', padding: '1.5rem',
                                border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div>
                                        <span style={{
                                            background: '#ede9fe', color: '#6d28d9',
                                            padding: '4px 12px', borderRadius: '999px',
                                            fontSize: '12px', fontWeight: '700',
                                            display: 'inline-block', marginBottom: '8px'
                                        }}>🛵 On the Way</span>
                                        <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 3px', fontSize: '16px', fontWeight: '700', color: '#0f0f0f' }}>
                                            {order.restaurant?.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                            👤 {order.user?.fullName} • 📞 {order.user?.mobile}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: '800', fontSize: '22px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                                        ₹{order.totalAmount}
                                    </span>
                                </div>

                                {/* Live Map for delivery boy */}
                                <div style={{ marginBottom: '14px' }}>
                                    <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                        🗺️ Navigation Map
                                    </p>
                                    <div style={{ borderRadius: '14px', overflow: 'hidden', height: '250px' }}>
                                        <MapContainer
                                            center={[
                                                myLocation?.lat || 26.1197,
                                                myLocation?.lng || 85.3910
                                            ]}
                                            zoom={14}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />
                                            {myLocation && (
                                                <Marker position={[myLocation.lat, myLocation.lng]} icon={deliveryIcon}>
                                                    <Popup>🛵 You are here</Popup>
                                                </Marker>
                                            )}
                                            <Marker
                                                position={[
                                                    order.deliveryLocation?.lat || 26.1220,
                                                    order.deliveryLocation?.lng || 85.3930
                                                ]}
                                                icon={customerIcon}
                                            >
                                                <Popup>🏠 {order.deliveryAddress}</Popup>
                                            </Marker>
                                            {myLocation && (
                                                <Polyline
                                                    positions={[
                                                        [myLocation.lat, myLocation.lng],
                                                        [order.deliveryLocation?.lat || 26.1220, order.deliveryLocation?.lng || 85.3930]
                                                    ]}
                                                    color="#ff4d2d" weight={3} dashArray="8"
                                                />
                                            )}
                                        </MapContainer>
                                    </div>
                                </div>

                                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px' }}>
                                    <p style={{ margin: '0 0 4px', fontWeight: '500', fontSize: '13px', color: '#374151' }}>
                                        🏠 {order.deliveryAddress}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(' • ')}
                                    </p>
                                </div>

                                <button onClick={() => handleMarkDelivered(order._id)} style={{
                                    width: '100%', padding: '14px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontSize: '15px', fontWeight: '700',
                                    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(16,185,129,0.3)', transition: 'all 0.2s'
                                }}>
                                    ✅ Mark as Delivered
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delivered Orders */}
                {activeTab === 'delivered' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {deliveredOrders.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 8px' }}>No deliveries yet</h3>
                                <p style={{ color: '#6b7280' }}>Completed deliveries will show here</p>
                            </div>
                        ) : deliveredOrders.map((order) => (
                            <div key={order._id} style={{
                                background: 'white', borderRadius: '16px',
                                padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 3px', fontSize: '15px', fontWeight: '700', color: '#0f0f0f' }}>
                                            {order.restaurant?.name}
                                        </h3>
                                        <p style={{ margin: '0 0 3px', fontSize: '12px', color: '#6b7280' }}>
                                            👤 {order.user?.fullName}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                                            {new Date(order.updatedAt).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 4px', fontWeight: '800', fontSize: '18px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                                            ₹{order.totalAmount}
                                        </p>
                                        <span style={{
                                            background: '#dcfce7', color: '#15803d',
                                            padding: '3px 10px', borderRadius: '999px',
                                            fontSize: '11px', fontWeight: '600'
                                        }}>+₹{Math.round(order.totalAmount * 0.05)} earned</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DeliveryDashboard