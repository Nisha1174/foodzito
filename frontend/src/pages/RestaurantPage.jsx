import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import Navbar from '../components/Navbar'
import Cart from '../components/Cart'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart } from '../redux/userSlice'
import ReviewsList from '../components/ReviewsList'

function RestaurantPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { cartItems } = useSelector(state => state.user)

    const [restaurant, setRestaurant] = useState(null)
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [loading, setLoading] = useState(true)
    const [showCart, setShowCart] = useState(false)

    useEffect(() => { fetchData() }, [id])

    const fetchData = async () => {
        try {
            const [restRes, menuRes] = await Promise.all([
                axios.get(`${serverUrl}/api/restaurant/${id}`, { withCredentials: true }),
                axios.get(`${serverUrl}/api/menu/${id}`, { withCredentials: true })
            ])
            setRestaurant(restRes.data)
            setMenuItems(menuRes.data)
            setCategories(["All", ...new Set(menuRes.data.map(item => item.category))])
        } catch (error) { console.log(error) }
        finally { setLoading(false) }
    }

    const getItemQuantity = (itemId) => {
        const found = cartItems.find(i => i._id === itemId)
        return found ? found.quantity : 0
    }

    const filteredItems = selectedCategory === "All"
        ? menuItems
        : menuItems.filter(item => item.category === selectedCategory)

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.5rem,3vw,3rem) clamp(1rem,3vw,1.5rem)' }}>
                <div className="skeleton" style={{ height: '220px', borderRadius: '20px', marginBottom: '2rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px,100%), 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="skeleton" style={{ height: '160px' }} />
                            <div style={{ padding: '1rem' }}>
                                <div className="skeleton" style={{ height: '18px', marginBottom: '8px', width: '70%' }} />
                                <div className="skeleton" style={{ height: '14px', width: '50%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    if (!restaurant) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Restaurant not found</p>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => setShowCart(true)} />

            {/* Hero */}
            <div style={{
                background: restaurant.image
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.75)), url(${restaurant.image}) center/cover`
                    : 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                padding: 'clamp(2rem,5vw,4rem) clamp(1rem,3vw,1.5rem) clamp(1.5rem,4vw,3rem)',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <button onClick={() => navigate('/')} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '14px', fontFamily: 'DM Sans, sans-serif', fontWeight: '500',
                        marginBottom: 'clamp(1rem,3vw,2rem)', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >← Back</button>

                    <div style={{ color: 'white' }}>
                        <h1 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 'clamp(1.6rem,5vw,3rem)',
                            fontWeight: '800', margin: '0 0 8px', color: 'white'
                        }}>{restaurant.name}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', fontSize: 'clamp(13px,2vw,15px)' }}>
                            {restaurant.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                                `📍 ${restaurant.address}`,
                                `⏱️ ${restaurant.deliveryTime} mins`,
                                `⭐ ${restaurant.rating}`
                            ].map((text, i) => (
                                <span key={i} style={{
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    padding: '6px 12px', borderRadius: '999px',
                                    fontSize: 'clamp(11px,2vw,13px)', color: 'white'
                                }}>{text}</span>
                            ))}
                            <span style={{
                                background: restaurant.isOpen ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)',
                                padding: '6px 12px', borderRadius: '999px',
                                fontSize: 'clamp(11px,2vw,13px)', color: 'white', fontWeight: '600'
                            }}>
                                {restaurant.isOpen ? '● Open Now' : '● Closed'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(1.5rem,3vw,2rem) clamp(1rem,3vw,1.5rem)' }}>

                {/* Category pills */}
                <div style={{
                    display: 'flex', gap: '8px', overflowX: 'auto',
                    paddingBottom: '8px', marginBottom: '2rem',
                    scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
                }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                            padding: '9px 18px', borderRadius: '999px', flexShrink: 0,
                            border: selectedCategory === cat ? 'none' : '1.5px solid #e5e7eb',
                            background: selectedCategory === cat ? 'linear-gradient(135deg, #ff4d2d, #ff7043)' : 'white',
                            color: selectedCategory === cat ? 'white' : '#374151',
                            fontWeight: '500', fontSize: '13px', cursor: 'pointer',
                            whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                            transition: 'all 0.2s',
                            boxShadow: selectedCategory === cat ? '0 4px 12px rgba(255,77,45,0.3)' : 'none'
                        }}>{cat}</button>
                    ))}
                </div>

                {/* Section title */}
                <h2 style={{
                    fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.1rem,3vw,1.4rem)',
                    fontWeight: '700', color: '#0f0f0f', marginBottom: '1.5rem'
                }}>
                    {selectedCategory === 'All' ? 'Full Menu' : selectedCategory}
                    <span style={{ fontSize: '14px', fontWeight: '400', color: '#6b7280', marginLeft: '8px', fontFamily: 'DM Sans, sans-serif' }}>
                        ({filteredItems.length} items)
                    </span>
                </h2>

                {/* Menu Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(290px,100%), 1fr))',
                    gap: '20px'
                }}>
                    {filteredItems.map((item) => {
                        const qty = getItemQuantity(item._id)
                        return (
                            <div key={item._id} style={{
                                background: 'white', borderRadius: '16px', overflow: 'hidden',
                                border: qty > 0 ? '2px solid #ff4d2d' : '1px solid rgba(0,0,0,0.06)',
                                transition: 'all 0.3s',
                                transform: qty > 0 ? 'translateY(-4px)' : 'translateY(0)',
                                boxShadow: qty > 0 ? '0 12px 32px rgba(255,77,45,0.15)' : 'none'
                            }}>
                                {/* Image */}
                                <div style={{
                                    height: '160px',
                                    background: item.image ? `url(${item.image}) center/cover` : 'linear-gradient(135deg, #fff5f3, #ffe8e3)',
                                    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {!item.image && <span style={{ fontSize: '3rem' }}>🍽️</span>}
                                    <span style={{
                                        position: 'absolute', top: '10px', left: '10px',
                                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                                        padding: '3px 10px', borderRadius: '999px',
                                        fontSize: '11px', fontWeight: '600', color: '#374151'
                                    }}>{item.category}</span>
                                </div>

                                {/* Info */}
                                <div style={{ padding: 'clamp(0.75rem,2vw,1rem)' }}>
                                    <h3 style={{
                                        margin: '0 0 4px', fontSize: 'clamp(14px,2.5vw,16px)',
                                        fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#0f0f0f'
                                    }}>{item.name}</h3>
                                    <p style={{
                                        margin: '0 0 12px', fontSize: '13px', color: '#6b7280',
                                        lineHeight: 1.5,
                                        display: '-webkit-box', WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                    }}>{item.description}</p>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <span style={{
                                            fontSize: 'clamp(16px,3vw,18px)',
                                            fontWeight: '800', fontFamily: 'Syne, sans-serif', color: '#0f0f0f'
                                        }}>₹{item.price}</span>

                                        {qty === 0 ? (
                                            <button
                                                onClick={() => dispatch(addToCart({ ...item, restaurantId: id }))}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                                    color: 'white', border: 'none', borderRadius: '10px',
                                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                                    fontFamily: 'DM Sans, sans-serif',
                                                    boxShadow: '0 4px 12px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            >+ Add</button>
                                        ) : (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                background: '#fff5f3', borderRadius: '10px',
                                                padding: '4px 8px', border: '1.5px solid #ff4d2d'
                                            }}>
                                                <button onClick={() => dispatch(removeFromCart(item))} style={{
                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                    border: 'none', background: '#ff4d2d', color: 'white',
                                                    cursor: 'pointer', fontSize: '18px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '700', lineHeight: 1
                                                }}>−</button>
                                                <span style={{
                                                    fontWeight: '700', fontSize: '15px', color: '#ff4d2d',
                                                    minWidth: '20px', textAlign: 'center', fontFamily: 'Syne, sans-serif'
                                                }}>{qty}</span>
                                                <button onClick={() => dispatch(addToCart({ ...item, restaurantId: id }))} style={{
                                                    width: '28px', height: '28px', borderRadius: '8px',
                                                    border: 'none', background: '#ff4d2d', color: 'white',
                                                    cursor: 'pointer', fontSize: '18px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: '700', lineHeight: 1
                                                }}>+</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Reviews */}
                {restaurant && (
                    <div style={{ marginTop: 'clamp(2rem,4vw,3rem)' }}>
                        <h2 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 'clamp(1.1rem,3vw,1.4rem)',
                            fontWeight: '700', color: '#0f0f0f', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'
                        }}>
                            ⭐ Customer Reviews
                            {restaurant.rating > 0 && (
                                <span style={{
                                    background: '#fff5f3', color: '#ff4d2d',
                                    padding: '4px 14px', borderRadius: '999px',
                                    fontSize: '14px', fontWeight: '700'
                                }}>{restaurant.rating} ★</span>
                            )}
                        </h2>
                        <ReviewsList restaurantId={restaurant._id} />
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            {cartItems.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: 'clamp(1rem,3vw,2rem)',
                    left: '50%', transform: 'translateX(-50%)',
                    zIndex: 99, animation: 'bounceIn 0.4s ease',
                    width: 'calc(100% - 2rem)', maxWidth: '400px'
                }}>
                    <button onClick={() => setShowCart(true)} style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '12px', padding: 'clamp(12px,2vw,16px) clamp(16px,3vw,32px)',
                        background: 'linear-gradient(135deg, #0f0f0f, #374151)',
                        color: 'white', border: 'none', borderRadius: '999px',
                        fontSize: 'clamp(13px,2vw,15px)', fontWeight: '700', cursor: 'pointer',
                        fontFamily: 'Syne, sans-serif',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transition: 'all 0.2s'
                    }}>
                        <span style={{ background: '#ff4d2d', borderRadius: '999px', padding: '2px 10px', fontSize: '13px' }}>
                            {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                        </span>
                        <span>View Cart</span>
                        <span style={{ color: '#ff7043', fontWeight: '800' }}>
                            ₹{cartItems.reduce((s, i) => s + i.price * i.quantity, 0)}
                        </span>
                    </button>
                </div>
            )}

            {showCart && <Cart onClose={() => setShowCart(false)} />}
        </div>
    )
}

export default RestaurantPage