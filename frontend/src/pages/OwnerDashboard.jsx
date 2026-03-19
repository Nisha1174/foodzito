import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'


const categories = ["Indian", "Chinese", "Italian", "FastFood", "South Indian", "Beverages", "Desserts"]
const orderStatusOptions = ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"]

const statusConfig = {
    pending: { label: 'Pending', bg: '#fef9c3', color: '#854d0e', icon: '⏳' },
    confirmed: { label: 'Confirmed', bg: '#e0f2fe', color: '#0369a1', icon: '✅' },
    preparing: { label: 'Preparing', bg: '#fef3c7', color: '#92400e', icon: '👨‍🍳' },
    on_the_way: { label: 'On the Way', bg: '#ede9fe', color: '#6d28d9', icon: '🛵' },
    delivered: { label: 'Delivered', bg: '#dcfce7', color: '#15803d', icon: '🎉' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c', icon: '❌' }
}

function OwnerDashboard() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [restaurant, setRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [showRestaurantForm, setShowRestaurantForm] = useState(false)
    const [showMenuForm, setShowMenuForm] = useState(false)
    const [editingItem, setEditingItem] = useState(null)

    const [restForm, setRestForm] = useState({
        name: '', description: '', address: '', city: '',
        category: 'Indian', image: '', deliveryTime: 30, isOpen: true
    })
    const [menuForm, setMenuForm] = useState({
        name: '', description: '', price: '', category: '', image: '', isAvailable: true
    })

    useEffect(() => {
        if (userData?.role !== 'owner') {
            navigate('/')
            return
        }
        fetchAll()
    }, [])

    const fetchAll = async () => {
        try {
            const [restRes, menuRes, ordersRes] = await Promise.all([
                axios.get(`${serverUrl}/api/restaurant/owner`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/menu/owner`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/restaurant/owner-orders`, { withCredentials: true })
            ])
            setRestaurant(restRes.data)
            if (restRes.data) {
                setRestForm({
                    name: restRes.data.name || '',
                    description: restRes.data.description || '',
                    address: restRes.data.address || '',
                    city: restRes.data.city || '',
                    category: restRes.data.category || 'Indian',
                    image: restRes.data.image || '',
                    deliveryTime: restRes.data.deliveryTime || 30,
                    isOpen: restRes.data.isOpen ?? true
                })
            }
            setMenuItems(menuRes.data)
            setOrders(ordersRes.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveRestaurant = async () => {
        try {
            if (restaurant) {
                await axios.put(`${serverUrl}/api/restaurant/update`, restForm, { withCredentials: true })
            } else {
                await axios.post(`${serverUrl}/api/restaurant/create`, restForm, { withCredentials: true })
            }
            fetchAll()
            setShowRestaurantForm(false)
        } catch (error) {
            console.log(error)
        }
    }

    const handleSaveMenuItem = async () => {
        try {
            if (editingItem) {
                await axios.put(`${serverUrl}/api/menu/update/${editingItem._id}`, menuForm, { withCredentials: true })
            } else {
                await axios.post(`${serverUrl}/api/menu/add`, menuForm, { withCredentials: true })
            }
            fetchAll()
            setShowMenuForm(false)
            setEditingItem(null)
            setMenuForm({ name: '', description: '', price: '', category: '', image: '', isAvailable: true })
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteMenuItem = async (id) => {
        if (!window.confirm('Delete this item?')) return
        try {
            await axios.delete(`${serverUrl}/api/menu/delete/${id}`, { withCredentials: true })
            fetchAll()
        } catch (error) {
            console.log(error)
        }
    }

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            await axios.put(`${serverUrl}/api/restaurant/update-order-status`,
                { orderId, status }, { withCredentials: true })
            fetchAll()
        } catch (error) {
            console.log(error)
        }
    }

    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0)
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())

    const tabs = [
        { key: 'overview', label: 'Overview', icon: '📊' },
        { key: 'restaurant', label: 'Restaurant', icon: '🏪' },
        { key: 'menu', label: 'Menu', icon: '🍽️' },
        { key: 'orders', label: 'Orders', icon: '📦' }
    ]

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        border: '1.5px solid #e5e7eb', borderRadius: '10px',
        fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box', color: '#111',
        background: 'white'
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>🏪</div>
                <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>

            {/* Top Navbar */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                padding: '0 1.5rem',
                position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{
                    maxWidth: '1300px', margin: '0 auto',
                    height: '64px', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            borderRadius: '10px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                        }}>🍕</div>
                        <span style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '20px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>FoodZito</span>
                        <span style={{
                            fontSize: '12px', background: 'rgba(255,77,45,0.2)',
                            color: '#ff7043', padding: '3px 10px', borderRadius: '999px',
                            fontWeight: '600'
                        }}>Owner</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                            👋 {userData?.fullName}
                        </span>
                        <button onClick={() => navigate('/')} style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '7px 16px',
                            borderRadius: '8px', cursor: 'pointer',
                            fontSize: '13px', fontFamily: 'DM Sans, sans-serif'
                        }}>← Home</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex', gap: '8px',
                    marginBottom: '2rem', background: 'white',
                    padding: '6px', borderRadius: '14px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    width: 'fit-content'
                }}>
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                            padding: '10px 20px', borderRadius: '10px',
                            border: 'none',
                            background: activeTab === tab.key
                                ? 'linear-gradient(135deg, #ff4d2d, #ff7043)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : '#374151',
                            fontWeight: '600', fontSize: '14px',
                            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: activeTab === tab.key ? '0 4px 12px rgba(255,77,45,0.3)' : 'none'
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="animate-fadeInUp">
                        {/* Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px', marginBottom: '2rem'
                        }}>
                            {[
                                { label: 'Total Orders', value: orders.length, icon: '📦', color: '#e0f2fe', text: '#0369a1' },
                                { label: 'Today Orders', value: todayOrders.length, icon: '🔥', color: '#fff5f3', text: '#ff4d2d' },
                                { label: 'Total Revenue', value: `₹${totalRevenue}`, icon: '💰', color: '#dcfce7', text: '#15803d' },
                                { label: 'Menu Items', value: menuItems.length, icon: '🍽️', color: '#fef9c3', text: '#854d0e' }
                            ].map((stat, i) => (
                                <div key={i} className={`animate-fadeInUp delay-${i + 1}`} style={{
                                    background: 'white', borderRadius: '16px',
                                    padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)'
                                }}>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        background: stat.color, borderRadius: '12px',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '22px',
                                        marginBottom: '12px'
                                    }}>{stat.icon}</div>
                                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                                        {stat.label}
                                    </p>
                                    <p style={{
                                        margin: 0, fontSize: '26px', fontWeight: '800',
                                        fontFamily: 'Syne, sans-serif', color: stat.text
                                    }}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div style={{
                            background: 'white', borderRadius: '20px',
                            padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            <h2 style={{
                                fontFamily: 'Syne, sans-serif', fontSize: '1.1rem',
                                fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px'
                            }}>Recent Orders</h2>
                            {orders.slice(0, 5).map((order, i) => {
                                const status = statusConfig[order.status]
                                return (
                                    <div key={order._id} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', padding: '12px 0',
                                        borderBottom: i < 4 ? '1px solid #f9fafb' : 'none'
                                    }}>
                                        <div>
                                            <p style={{ margin: '0 0 3px', fontWeight: '600', fontSize: '14px', color: '#111' }}>
                                                {order.user?.fullName}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                fontWeight: '700', fontSize: '15px',
                                                fontFamily: 'Syne, sans-serif', color: '#0f0f0f'
                                            }}>₹{order.totalAmount}</span>
                                            <span style={{
                                                background: status?.bg, color: status?.color,
                                                padding: '4px 10px', borderRadius: '999px',
                                                fontSize: '11px', fontWeight: '600'
                                            }}>{status?.icon} {status?.label}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* RESTAURANT TAB */}
                {activeTab === 'restaurant' && (
                    <div className="animate-fadeInUp">
                        {!restaurant && !showRestaurantForm ? (
                            <div style={{
                                background: 'white', borderRadius: '20px',
                                padding: '4rem', textAlign: 'center',
                                border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏪</div>
                                <h2 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 8px' }}>No Restaurant Yet</h2>
                                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Create your restaurant to start receiving orders</p>
                                <button onClick={() => setShowRestaurantForm(true)} style={{
                                    padding: '12px 28px',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                    boxShadow: '0 4px 14px rgba(255,77,45,0.3)'
                                }}>+ Create Restaurant</button>
                            </div>
                        ) : (
                            <div style={{
                                background: 'white', borderRadius: '20px',
                                padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                                        {restaurant ? 'Edit Restaurant' : 'Create Restaurant'}
                                    </h2>
                                    {restaurant && !showRestaurantForm && (
                                        <button onClick={() => setShowRestaurantForm(true)} style={{
                                            padding: '8px 16px', background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                            color: 'white', border: 'none', borderRadius: '10px',
                                            fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                            fontFamily: 'DM Sans, sans-serif'
                                        }}>Edit</button>
                                    )}
                                </div>

                                {restaurant && !showRestaurantForm ? (
                                    <div>
                                        {restaurant.image && (
                                            <div style={{
                                                height: '200px', borderRadius: '14px', overflow: 'hidden',
                                                marginBottom: '16px',
                                                background: `url(${restaurant.image}) center/cover`
                                            }} />
                                        )}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            {[
                                                { label: 'Name', value: restaurant.name },
                                                { label: 'Category', value: restaurant.category },
                                                { label: 'City', value: restaurant.city },
                                                { label: 'Delivery Time', value: `${restaurant.deliveryTime} mins` },
                                                { label: 'Status', value: restaurant.isOpen ? '🟢 Open' : '🔴 Closed' },
                                                { label: 'Address', value: restaurant.address }
                                            ].map((item, i) => (
                                                <div key={i} style={{
                                                    background: '#f9fafb', borderRadius: '10px', padding: '12px'
                                                }}>
                                                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                                                        {item.label}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#111', fontWeight: '600' }}>
                                                        {item.value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                        {[
                                            { label: 'Restaurant Name', key: 'name', type: 'text', placeholder: 'e.g. Spice Garden' },
                                            { label: 'City', key: 'city', type: 'text', placeholder: 'e.g. Patna' },
                                            { label: 'Address', key: 'address', type: 'text', placeholder: 'Full address' },
                                            { label: 'Image URL', key: 'image', type: 'text', placeholder: 'https://...' },
                                            { label: 'Delivery Time (mins)', key: 'deliveryTime', type: 'number', placeholder: '30' }
                                        ].map(field => (
                                            <div key={field.key}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                                    {field.label}
                                                </label>
                                                <input type={field.type} placeholder={field.placeholder}
                                                    value={restForm[field.key]}
                                                    onChange={e => setRestForm(p => ({ ...p, [field.key]: e.target.value }))}
                                                    style={inputStyle}
                                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d' }}
                                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                                Description
                                            </label>
                                            <input type="text" placeholder="Short description"
                                                value={restForm.description}
                                                onChange={e => setRestForm(p => ({ ...p, description: e.target.value }))}
                                                style={inputStyle}
                                                onFocus={e => { e.target.style.borderColor = '#ff4d2d' }}
                                                onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                                Category
                                            </label>
                                            <select value={restForm.category}
                                                onChange={e => setRestForm(p => ({ ...p, category: e.target.value }))}
                                                style={{ ...inputStyle }}>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input type="checkbox" id="isOpen"
                                                checked={restForm.isOpen}
                                                onChange={e => setRestForm(p => ({ ...p, isOpen: e.target.checked }))}
                                                style={{ width: '18px', height: '18px', accentColor: '#ff4d2d' }}
                                            />
                                            <label htmlFor="isOpen" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                                Restaurant is Open
                                            </label>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                                            <button onClick={handleSaveRestaurant} style={{
                                                flex: 1, padding: '12px',
                                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                                color: 'white', border: 'none', borderRadius: '12px',
                                                fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                                                fontFamily: 'Syne, sans-serif',
                                                boxShadow: '0 4px 14px rgba(255,77,45,0.3)'
                                            }}>
                                                {restaurant ? 'Save Changes' : 'Create Restaurant'} →
                                            </button>
                                            {restaurant && (
                                                <button onClick={() => setShowRestaurantForm(false)} style={{
                                                    padding: '12px 20px',
                                                    background: 'white', color: '#374151',
                                                    border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                                    fontWeight: '600', cursor: 'pointer',
                                                    fontFamily: 'DM Sans, sans-serif'
                                                }}>Cancel</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* MENU TAB */}
                {activeTab === 'menu' && (
                    <div className="animate-fadeInUp">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: '700', margin: 0, color: '#0f0f0f' }}>
                                Menu Items ({menuItems.length})
                            </h2>
                            <button onClick={() => { setShowMenuForm(true); setEditingItem(null); setMenuForm({ name: '', description: '', price: '', category: '', image: '', isAvailable: true }) }} style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: '0 4px 12px rgba(255,77,45,0.3)',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>+ Add Item</button>
                        </div>

                        {/* Add/Edit Form */}
                        {showMenuForm && (
                            <div className="animate-scaleIn" style={{
                                background: 'white', borderRadius: '20px',
                                padding: '1.5rem', marginBottom: '1.5rem',
                                border: '2px solid #ff4d2d'
                            }}>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', margin: '0 0 16px', color: '#0f0f0f' }}>
                                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { label: 'Item Name', key: 'name', type: 'text', placeholder: 'e.g. Butter Chicken' },
                                        { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '299' },
                                        { label: 'Category', key: 'category', type: 'text', placeholder: 'e.g. Main Course' },
                                        { label: 'Image URL', key: 'image', type: 'text', placeholder: 'https://...' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                                {field.label}
                                            </label>
                                            <input type={field.type} placeholder={field.placeholder}
                                                value={menuForm[field.key]}
                                                onChange={e => setMenuForm(p => ({ ...p, [field.key]: e.target.value }))}
                                                style={inputStyle}
                                                onFocus={e => { e.target.style.borderColor = '#ff4d2d' }}
                                                onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                                            />
                                        </div>
                                    ))}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                            Description
                                        </label>
                                        <input type="text" placeholder="Short description of the item"
                                            value={menuForm.description}
                                            onChange={e => setMenuForm(p => ({ ...p, description: e.target.value }))}
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = '#ff4d2d' }}
                                            onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" id="isAvailable"
                                            checked={menuForm.isAvailable}
                                            onChange={e => setMenuForm(p => ({ ...p, isAvailable: e.target.checked }))}
                                            style={{ width: '18px', height: '18px', accentColor: '#ff4d2d' }}
                                        />
                                        <label htmlFor="isAvailable" style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                            Available
                                        </label>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px' }}>
                                        <button onClick={handleSaveMenuItem} style={{
                                            flex: 1, padding: '12px',
                                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                            color: 'white', border: 'none', borderRadius: '12px',
                                            fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                                            fontFamily: 'Syne, sans-serif'
                                        }}>{editingItem ? 'Save Changes' : 'Add Item'} →</button>
                                        <button onClick={() => { setShowMenuForm(false); setEditingItem(null) }} style={{
                                            padding: '12px 20px', background: 'white',
                                            color: '#374151', border: '1.5px solid #e5e7eb',
                                            borderRadius: '12px', fontWeight: '600',
                                            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                                        }}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menu Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                            {menuItems.map((item, i) => (
                                <div key={item._id} className={`animate-fadeInUp delay-${Math.min(i + 1, 5)}`} style={{
                                    background: 'white', borderRadius: '16px',
                                    overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)',
                                    transition: 'all 0.3s'
                                }}>
                                    <div style={{
                                        height: '140px',
                                        background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(135deg, #fff5f3, #ffe8e3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        {!item.image && <span style={{ fontSize: '2.5rem' }}>🍽️</span>}
                                        <span style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: item.isAvailable ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                                            color: 'white', padding: '3px 8px',
                                            borderRadius: '999px', fontSize: '10px', fontWeight: '600'
                                        }}>
                                            {item.isAvailable ? '● Available' : '● Unavailable'}
                                        </span>
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280' }}>{item.category}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '800', fontSize: '16px', fontFamily: 'Syne, sans-serif', color: '#ff4d2d' }}>
                                                ₹{item.price}
                                            </span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => {
                                                    setEditingItem(item)
                                                    setMenuForm({
                                                        name: item.name, description: item.description,
                                                        price: item.price, category: item.category,
                                                        image: item.image, isAvailable: item.isAvailable
                                                    })
                                                    setShowMenuForm(true)
                                                }} style={{
                                                    padding: '6px 12px', background: '#f0f9ff',
                                                    color: '#0369a1', border: 'none', borderRadius: '8px',
                                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                    fontFamily: 'DM Sans, sans-serif'
                                                }}>✏️ Edit</button>
                                                <button onClick={() => handleDeleteMenuItem(item._id)} style={{
                                                    padding: '6px 12px', background: '#fef2f2',
                                                    color: '#dc2626', border: 'none', borderRadius: '8px',
                                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                                    fontFamily: 'DM Sans, sans-serif'
                                                }}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <div className="animate-fadeInUp">
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: '700', margin: '0 0 1.5rem', color: '#0f0f0f' }}>
                            Manage Orders ({orders.length})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {orders.length === 0 ? (
                                <div style={{
                                    background: 'white', borderRadius: '20px', padding: '4rem',
                                    textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                                    <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#0f0f0f', margin: '0 0 8px' }}>No orders yet</h3>
                                    <p style={{ color: '#6b7280' }}>Orders will appear here when customers place them</p>
                                </div>
                            ) : orders.map((order, i) => {
                                const status = statusConfig[order.status]
                                return (
                                    <div key={order._id} className={`animate-fadeInUp delay-${Math.min(i + 1, 5)}`} style={{
                                        background: 'white', borderRadius: '16px',
                                        padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                            <div>
                                                <p style={{ margin: '0 0 3px', fontWeight: '700', fontSize: '15px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                                                    {order.user?.fullName}
                                                    <span style={{ fontWeight: '400', fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>
                                                        📞 {order.user?.mobile}
                                                    </span>
                                                </p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                                    #{order._id.slice(-8).toUpperCase()} • {new Date(order.createdAt).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: status?.bg, color: status?.color,
                                                padding: '6px 14px', borderRadius: '999px',
                                                fontSize: '12px', fontWeight: '600'
                                            }}>{status?.icon} {status?.label}</span>
                                        </div>
                                        <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#374151' }}>
                                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(' • ')}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                                                📍 {order.deliveryAddress}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '800', fontSize: '18px', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                                                ₹{order.totalAmount}
                                            </span>
                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {orderStatusOptions
                                                        .filter(s => s !== order.status && s !== 'cancelled')
                                                        .slice(0, 3)
                                                        .map(s => (
                                                            <button key={s} onClick={() => handleUpdateOrderStatus(order._id, s)} style={{
                                                                padding: '7px 14px',
                                                                background: s === 'confirmed' ? '#e0f2fe'
                                                                    : s === 'preparing' ? '#fef3c7'
                                                                        : s === 'on_the_way' ? '#ede9fe'
                                                                            : s === 'delivered' ? '#dcfce7' : '#f9fafb',
                                                                color: s === 'confirmed' ? '#0369a1'
                                                                    : s === 'preparing' ? '#92400e'
                                                                        : s === 'on_the_way' ? '#6d28d9'
                                                                            : s === 'delivered' ? '#15803d' : '#374151',
                                                                border: 'none', borderRadius: '8px',
                                                                fontSize: '12px', fontWeight: '600',
                                                                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                                                transition: 'all 0.2s'
                                                            }}>
                                                                → {statusConfig[s]?.label}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OwnerDashboard