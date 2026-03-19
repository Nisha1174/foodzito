import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import Navbar from '../components/Navbar'

const statusConfig = {
    pending: { label: 'Pending', bg: '#fef9c3', color: '#854d0e', icon: '⏳' },
    confirmed: { label: 'Confirmed', bg: '#e0f2fe', color: '#0369a1', icon: '✅' },
    preparing: { label: 'Preparing', bg: '#fef3c7', color: '#92400e', icon: '👨‍🍳' },
    on_the_way: { label: 'On the Way', bg: '#ede9fe', color: '#6d28d9', icon: '🛵' },
    delivered: { label: 'Delivered', bg: '#dcfce7', color: '#15803d', icon: '🎉' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c', icon: '❌' }
}

function MyOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
            setOrders(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => {}} />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/')} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '12px', padding: 0
                    }}>← Back to Home</button>
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '2rem',
                        fontWeight: '800', color: '#0f0f0f', margin: '0 0 4px'
                    }}>My Orders 📦</h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        {orders.length} order{orders.length !== 1 ? 's' : ''} placed
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{
                        background: 'white', borderRadius: '20px', padding: '4rem',
                        textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📦</div>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#0f0f0f', margin: '0 0 8px' }}>
                            No orders yet
                        </h2>
                        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                            You haven't placed any orders yet
                        </p>
                        <button onClick={() => navigate('/')} style={{
                            padding: '12px 28px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                            boxShadow: '0 4px 14px rgba(255,77,45,0.3)'
                        }}>Order Food Now 🍕</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.map((order, i) => {
                            const status = statusConfig[order.status] || statusConfig.pending
                            return (
                                <div key={order._id}
                                    className={`animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
                                    onClick={() => navigate(`/order/${order._id}`)}
                                    style={{
                                        background: 'white',
                                        borderRadius: '20px',
                                        padding: '1.5rem',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-4px)'
                                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                        <div>
                                            <h3 style={{
                                                fontFamily: 'Syne, sans-serif',
                                                fontSize: '17px', fontWeight: '700',
                                                color: '#0f0f0f', margin: '0 0 4px'
                                            }}>
                                                {order.restaurant?.name || 'Restaurant'}
                                            </h3>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                                #{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <span style={{
                                            background: status.bg,
                                            color: status.color,
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {status.icon} {status.label}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div style={{
                                        background: '#f9fafb', borderRadius: '12px',
                                        padding: '10px 14px', marginBottom: '14px'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(' • ')}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {order.paymentMethod === 'cod' ? '💵 COD'
                                                    : order.paymentMethod === 'upi' ? '📱 UPI' : '💳 Card'}
                                            </span>
                                            <span style={{
                                                fontSize: '12px', fontWeight: '500',
                                                padding: '2px 8px', borderRadius: '999px',
                                                background: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef9c3',
                                                color: order.paymentStatus === 'paid' ? '#15803d' : '#854d0e'
                                            }}>
                                                {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                fontFamily: 'Syne, sans-serif',
                                                fontWeight: '800', fontSize: '18px', color: '#0f0f0f'
                                            }}>₹{order.totalAmount}</span>
                                            <span style={{ color: '#ff4d2d', fontSize: '13px', fontWeight: '600' }}>
                                                Track →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyOrders