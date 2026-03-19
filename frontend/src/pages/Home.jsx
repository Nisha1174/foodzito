import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import Navbar from '../components/Navbar'
import Cart from '../components/Cart'
import MapPicker from '../components/MapPicker'
import { useSelector, useDispatch } from 'react-redux'
import { setLocation } from '../redux/locationSlice'

const categories = [
    { label: "All", icon: "🍽️" },
    { label: "Indian", icon: "🍛" },
    { label: "Chinese", icon: "🍜" },
    { label: "Italian", icon: "🍝" },
    { label: "FastFood", icon: "🍔" },
    { label: "South Indian", icon: "🥘" },
    { label: "Beverages", icon: "🧋" },
    { label: "Desserts", icon: "🍰" }
]

const heroWords = ["Delicious", "Fresh", "Hot", "Tasty"]

const customerReviews = [
    { name: "Rahul Singh", location: "Muzaffarpur", rating: 5, comment: "Best food delivery app! Got my biryani in 25 mins, still hot and fresh!", avatar: "R", dish: "Chicken Biryani" },
    { name: "Priya Sharma", location: "Patna", rating: 5, comment: "Amazing UI and super fast delivery. The butter chicken was absolutely delicious!", avatar: "P", dish: "Butter Chicken" },
    { name: "Amit Patel", location: "Muzaffarpur", rating: 4, comment: "Great variety of restaurants. Love the live tracking feature!", avatar: "A", dish: "Masala Dosa" },
    { name: "Sneha Kumari", location: "Muzaffarpur", rating: 5, comment: "The pizza was perfect and delivery was on time. FoodZito is now my go-to app!", avatar: "S", dish: "Margherita Pizza" },
    { name: "Vikram Yadav", location: "Patna", rating: 5, comment: "Smooth payment and real-time tracking is a game changer!", avatar: "V", dish: "Hakka Noodles" },
    { name: "Anjali Gupta", location: "Muzaffarpur", rating: 4, comment: "Great selection of local restaurants. The Rajmahal thali was amazing!", avatar: "A", dish: "Rajmahal Thali" }
]

const features = [
    { icon: "⚡", title: "Fast Delivery", desc: "Get your food delivered in under 30 minutes guaranteed" },
    { icon: "📍", title: "Live Tracking", desc: "Track your order in real-time on the map" },
    { icon: "🔒", title: "Secure Payment", desc: "UPI, Card, or Cash — all 100% secure" },
    { icon: "🎉", title: "Best Deals", desc: "Exclusive offers every day from top restaurants" }
]

/* ── Responsive styles injected once ─────────────────────────────── */
const responsiveCSS = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  .animate-fadeInUp { animation: fadeInUp .6s ease both; }
  .delay-2 { animation-delay: .2s; }

  /* skeleton */
  .skeleton { background: linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:8px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* ── HERO ── */
  .hero-grid { display:grid; grid-template-columns:1fr 1fr; gap:3rem; align-items:center; }
  .hero-food-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; position:relative; }

  /* ── FOOTER ── */
  .footer-grid { display:grid; grid-template-columns:1.5fr repeat(4,1fr); gap:2rem; margin-bottom:3rem; }

  /* ── TABLET ── */
  @media (max-width:1024px) {
    .footer-grid { grid-template-columns:1fr 1fr; }
  }

  /* ── MOBILE / SMALL TABLET ── */
  @media (max-width:768px) {
    .hero-grid { grid-template-columns:1fr !important; gap:2rem !important; }
    .hero-food-grid { display:none !important; }
    .hero-section { padding:2.5rem 1rem !important; }
    .hero-stats { gap:1.2rem !important; }
    .hero-btns { flex-direction:column !important; }
    .hero-btns button { width:100% !important; justify-content:center !important; }
    .section-pad { padding:3rem 1rem !important; }
    .how-grid { grid-template-columns:1fr 1fr !important; gap:16px !important; }
    .footer-grid { grid-template-columns:1fr 1fr !important; gap:1.5rem !important; }
    .footer-brand { grid-column:1/-1 !important; }
    .footer-bottom { flex-direction:column !important; gap:8px !important; text-align:center !important; }
    .cta-btns { flex-direction:column !important; align-items:stretch !important; }
    .cta-btns button { width:100% !important; }
    .location-bar { flex-direction:column !important; align-items:flex-start !important; }
    .search-box { flex-wrap:nowrap !important; }
  }

  @media (max-width:480px) {
    .how-grid { grid-template-columns:1fr !important; }
    .footer-grid { grid-template-columns:1fr !important; }
    .hero-stats { flex-wrap:wrap !important; gap:1rem !important; }
    .cat-scroll { gap:8px !important; }
    .review-grid { grid-template-columns:1fr !important; }
  }
`

function StyleInjector() {
    useEffect(() => {
        if (document.getElementById('foodzito-responsive')) return
        const el = document.createElement('style')
        el.id = 'foodzito-responsive'
        el.textContent = responsiveCSS
        document.head.appendChild(el)
        return () => el.remove()
    }, [])
    return null
}

function StarRow({ value, size = 14 }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ color: s <= value ? '#f59e0b' : '#e5e7eb', fontSize: `${size}px` }}>★</span>
            ))}
        </span>
    )
}

function RestaurantCard({ restaurant, onClick, badge, badgeColor }) {
    const [hovered, setHovered] = useState(false)
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                border: hovered ? '1.5px solid #ff4d2d' : '1.5px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hovered ? '0 20px 40px rgba(255,77,45,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                position: 'relative'
            }}
        >
            {badge && (
                <div style={{
                    position: 'absolute', top: '12px', left: '12px', zIndex: 2,
                    background: badgeColor || 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                    color: 'white', padding: '4px 12px',
                    borderRadius: '999px', fontSize: '11px', fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>{badge}</div>
            )}
            <div style={{
                height: '180px',
                background: restaurant.image ? `url(${restaurant.image}) center/cover` : 'linear-gradient(135deg, #fff5f3, #ffe8e3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
            }}>
                {!restaurant.image && <span style={{ fontSize: '3rem' }}>🍽️</span>}
                <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(255,77,45,0.08)' : 'transparent', transition: 'all 0.3s' }} />
                <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'white', color: '#f59e0b',
                    padding: '4px 10px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', gap: '3px'
                }}>
                    ★ {restaurant.rating || 'New'}
                </span>
                {restaurant.isOpen && (
                    <span style={{
                        position: 'absolute', bottom: '12px', left: '12px',
                        background: 'rgba(16,185,129,0.9)', color: 'white',
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)'
                    }}>● Open Now</span>
                )}
                {restaurant.distance !== undefined && (
                    <span style={{
                        position: 'absolute', bottom: '12px', right: '12px',
                        background: 'rgba(0,0,0,0.65)', color: 'white',
                        padding: '3px 10px', borderRadius: '999px',
                        fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)'
                    }}>📏 {restaurant.distance} km</span>
                )}
            </div>
            <div style={{ padding: '1rem 1.1rem 1.2rem' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', fontFamily: 'Syne, sans-serif', color: '#0f0f0f' }}>
                    {restaurant.name}
                </h3>
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#9ca3af' }}>
                    {restaurant.category} • {restaurant.city}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ background: '#f9fafb', color: '#374151', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>
                        ⏱️ {restaurant.deliveryTime} min
                    </span>
                    <span style={{
                        fontSize: '13px', color: hovered ? 'white' : '#ff4d2d',
                        fontWeight: '700', background: hovered ? '#ff4d2d' : '#fff5f3',
                        padding: '6px 14px', borderRadius: '10px', transition: 'all 0.2s'
                    }}>Order →</span>
                </div>
            </div>
        </div>
    )
}

function Home() {
    const [restaurants, setRestaurants] = useState([])
    const [filtered, setFiltered] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [showCart, setShowCart] = useState(false)
    const [heroWord, setHeroWord] = useState(0)
    const [showMap, setShowMap] = useState(false)
    const [sortByDistance, setSortByDistance] = useState(false)
    const [radius, setRadius] = useState(10)

    const { userLocation, locationName } = useSelector(state => state.location)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        if (userLocation) {
            fetchRestaurants(userLocation.lat, userLocation.lng)
            setSortByDistance(true)
        } else {
            fetchRestaurants()
        }
        const interval = setInterval(() => setHeroWord(prev => (prev + 1) % heroWords.length), 2000)
        return () => clearInterval(interval)
    }, [userLocation])

    useEffect(() => {
        let result = [...restaurants]
        if (selectedCategory !== "All") result = result.filter(r => r.category === selectedCategory)
        if (search.trim()) result = result.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.city.toLowerCase().includes(search.toLowerCase())
        )
        if (sortByDistance && userLocation) result = result.sort((a, b) => (a.distance || 999) - (b.distance || 999))
        setFiltered(result)
    }, [selectedCategory, search, restaurants, sortByDistance, userLocation])

    const fetchRestaurants = async (lat, lng) => {
        try {
            const url = lat && lng
                ? `${serverUrl}/api/restaurant/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
                : `${serverUrl}/api/restaurant/all`
            const { data } = await axios.get(url, { withCredentials: true })
            setRestaurants(data)
            setFiltered(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
                        const data = await res.json()
                        const name = data.address?.suburb || data.address?.city || 'Your location'
                        dispatch(setLocation({ coords, name, city: data.address?.city || '' }))
                    } catch { dispatch(setLocation({ coords, name: 'Your location', city: '' })) }
                },
                () => dispatch(setLocation({ coords: { lat: 26.1197, lng: 85.3910 }, name: 'Muzaffarpur', city: 'Muzaffarpur' }))
            )
        }
    }

    const handleMapLocationSelect = async (latlng) => {
        const coords = { lat: latlng.lat, lng: latlng.lng }
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
            const data = await res.json()
            dispatch(setLocation({ coords, name: data.address?.suburb || data.address?.city || 'Selected', city: data.address?.city || '' }))
        } catch { dispatch(setLocation({ coords, name: 'Selected location', city: '' })) }
        setShowMap(false)
    }

    const topRated = [...restaurants].filter(r => r.rating >= 4.3).slice(0, 4)
    const newArrivals = [...restaurants].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4)
    const bestSellers = [...restaurants].filter(r => r.rating >= 4).slice(0, 4)

    return (
        <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'DM Sans, sans-serif' }}>
            <StyleInjector />
            <Navbar onCartClick={() => setShowCart(true)} />

            {/* ── HERO ──────────────────────────────────────────────── */}
            <div className="hero-section" style={{
                background: 'linear-gradient(135deg, #fff8f6 0%, #fff5f3 50%, #fff0ec 100%)',
                padding: 'clamp(2rem,5vw,4rem) clamp(1rem,4vw,1.5rem)',
                position: 'relative', overflow: 'hidden',
                borderBottom: '1px solid #f3f4f6'
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '5%', width: 'clamp(200px,30vw,400px)', height: 'clamp(200px,30vw,400px)', background: 'radial-gradient(circle, rgba(255,77,45,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-5%', width: 'clamp(150px,25vw,300px)', height: 'clamp(150px,25vw,300px)', background: 'radial-gradient(circle, rgba(255,179,71,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div className="hero-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Left */}
                    <div className="animate-fadeInUp">
                        {/* Live tag */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'white', border: '1.5px solid #ffe8e3',
                            borderRadius: '999px', padding: '6px 16px', marginBottom: '1.5rem',
                            boxShadow: '0 2px 12px rgba(255,77,45,0.1)'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#ff4d2d', borderRadius: '50%', animation: 'pulse 2s infinite', flexShrink: 0 }} />
                            <span style={{ color: '#ff4d2d', fontSize: 'clamp(11px,2vw,13px)', fontWeight: '600' }}>
                                {locationName ? `Delivering near ${locationName}` : 'Now delivering in your city'}
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 'clamp(1.9rem, 5vw, 3.8rem)',
                            fontWeight: '800', color: '#0f0f0f',
                            lineHeight: 1.1, margin: '0 0 1rem'
                        }}>
                            Your Favourite{' '}
                            <span style={{ background: 'linear-gradient(135deg, #ff4d2d, #ff7043)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {heroWords[heroWord]}
                            </span>
                            <br />Food Delivered 🍕
                        </h1>

                        <p style={{ color: '#6b7280', fontSize: 'clamp(13px,2vw,16px)', margin: '0 0 2rem', lineHeight: 1.7, maxWidth: '460px' }}>
                            From the best restaurants near you in Muzaffarpur — delivered hot, fresh and fast to your doorstep.
                        </p>

                        {/* Search bar */}
                        <div className="search-box" style={{
                            display: 'flex', background: 'white',
                            borderRadius: '16px', overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(255,77,45,0.12)',
                            border: '1.5px solid #ffe8e3',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', color: '#9ca3af', fontSize: '18px' }}>🔍</div>
                            <input type="text"
                                placeholder="Search restaurants or cuisines..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    padding: '14px 0', fontSize: 'clamp(12px,2vw,14px)',
                                    fontFamily: 'DM Sans, sans-serif', color: '#111', background: 'transparent',
                                    minWidth: 0
                                }}
                            />
                            <button style={{
                                margin: '8px', padding: '10px clamp(12px,2vw,22px)',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: '700', fontSize: 'clamp(12px,2vw,14px)', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0
                            }}>Search</button>
                        </div>

                        {/* Location buttons */}
                        <div className="hero-btns" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={handleGetLocation} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: userLocation ? '#f0fdf4' : 'white',
                                border: `1.5px solid ${userLocation ? '#86efac' : '#e5e7eb'}`,
                                borderRadius: '999px', padding: '10px 20px',
                                color: userLocation ? '#15803d' : '#374151',
                                cursor: 'pointer', fontSize: '13px',
                                fontFamily: 'DM Sans, sans-serif', fontWeight: '600',
                                transition: 'all 0.2s'
                            }}>
                                {userLocation ? '✅' : '📍'} {userLocation ? locationName || 'Location set' : 'Use GPS location'}
                            </button>
                            <button onClick={() => setShowMap(true)} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'white', border: '1.5px solid #e5e7eb',
                                borderRadius: '999px', padding: '10px 20px',
                                color: '#374151', cursor: 'pointer', fontSize: '13px',
                                fontFamily: 'DM Sans, sans-serif', fontWeight: '600',
                                transition: 'all 0.2s'
                            }}>🗺️ Pin on Map</button>
                        </div>

                        {/* Stats */}
                        <div className="hero-stats" style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                            {[
                                { value: '50+', label: 'Restaurants', icon: '🏪' },
                                { value: '30 min', label: 'Avg Delivery', icon: '⚡' },
                                { value: '5K+', label: 'Happy Users', icon: '😊' }
                            ].map((s, i) => (
                                <div key={i}>
                                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: '800', color: '#0f0f0f' }}>{s.value}</div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{s.icon} {s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Food Image Grid (hidden on mobile via CSS) */}
                    <div className="animate-fadeInUp delay-2 hero-food-grid">
                        {[
                            { img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300', label: 'Biryani', time: '25 min' },
                            { img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300', label: 'Pizza', time: '30 min' },
                            { img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', label: 'Burger', time: '20 min' },
                            { img: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300', label: 'Dosa', time: '15 min' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                borderRadius: '18px', overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                transform: i % 2 === 0 ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'transform 0.3s', cursor: 'pointer'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = i % 2 === 0 ? 'translateY(-6px)' : 'translateY(14px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = i % 2 === 0 ? 'translateY(0)' : 'translateY(20px)'}
                                onClick={() => navigate('/')}
                            >
                                <div style={{ height: '150px', background: `url(${item.img}) center/cover` }} />
                                <div style={{ padding: '10px 12px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '14px', color: '#0f0f0f' }}>{item.label}</span>
                                    <span style={{ background: '#fff5f3', color: '#ff4d2d', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>{item.time}</span>
                                </div>
                            </div>
                        ))}

                        {/* Floating delivery badge */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'white', borderRadius: '16px',
                            padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            border: '2px solid #ffe8e3', textAlign: 'center',
                            zIndex: 10, minWidth: '110px',
                            animation: 'float 3s ease-in-out infinite'
                        }}>
                            <div style={{ fontSize: '1.8rem' }}>🛵</div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '14px', color: '#ff4d2d' }}>30 Min</div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>Fast Delivery</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── HOW IT WORKS ─────────────────────────────────────── */}
            <div className="section-pad" style={{ background: 'white', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span style={{ background: '#fff5f3', color: '#ff4d2d', padding: '6px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', border: '1px solid #ffe8e3' }}>Simple & Fast</span>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: '800', color: '#0f0f0f', margin: '14px 0 8px' }}>
                            How FoodZito Works
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
                            Order your favourite food in just 3 simple steps
                        </p>
                    </div>
                    <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                        {[
                            { step: '01', icon: '📍', title: 'Set Your Location', desc: 'Pin your delivery location to find the best restaurants near you', color: '#fff5f3', border: '#ffe8e3' },
                            { step: '02', icon: '🍽️', title: 'Choose Your Food', desc: 'Browse restaurant menus and add your favourite items to cart', color: '#f0fdf4', border: '#bbf7d0' },
                            { step: '03', icon: '💳', title: 'Pay Securely', desc: 'Pay via UPI, Card, or Cash on Delivery — fast and secure', color: '#eff6ff', border: '#bfdbfe' },
                            { step: '04', icon: '🛵', title: 'Track Live', desc: 'Watch your delivery partner in real-time on the live map', color: '#fefce8', border: '#fde68a' }
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: item.color, borderRadius: '20px',
                                padding: 'clamp(1.2rem,3vw,2rem) clamp(1rem,2.5vw,1.5rem)',
                                textAlign: 'center', border: `1.5px solid ${item.border}`,
                                transition: 'all 0.3s', position: 'relative'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                            >
                                <div style={{ position: 'absolute', top: '16px', right: '20px', fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: '900', color: 'rgba(0,0,0,0.06)' }}>{item.step}</div>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: `float 3s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}>{item.icon}</div>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: '700', color: '#0f0f0f', margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── ALL RESTAURANTS ──────────────────────────────────── */}
            <div className="section-pad" style={{ background: '#fafafa', padding: 'clamp(2.5rem,5vw,4rem) clamp(1rem,4vw,1.5rem)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Location bar */}
                    {userLocation && (
                        <div className="location-bar" style={{
                            background: '#f0fdf4', border: '1.5px solid #86efac',
                            borderRadius: '14px', padding: '12px 20px', marginBottom: '2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '10px'
                        }}>
                            <span style={{ fontSize: 'clamp(12px,2vw,14px)', color: '#15803d', fontWeight: '600' }}>
                                📍 Showing restaurants near <strong>{locationName}</strong> within {radius} km
                            </span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select value={radius} onChange={e => { setRadius(Number(e.target.value)); fetchRestaurants(userLocation.lat, userLocation.lng) }} style={{ border: '1px solid #86efac', borderRadius: '8px', padding: '4px 10px', fontSize: '13px', color: '#15803d', outline: 'none', background: 'white' }}>
                                    {[2, 5, 10, 20].map(r => <option key={r} value={r}>{r} km</option>)}
                                </select>
                                <button onClick={() => { setSortByDistance(false); fetchRestaurants(); dispatch({ type: 'location/clearLocation' }) }} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}>✕ Clear</button>
                            </div>
                        </div>
                    )}

                    {/* Section header */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem,3.5vw,1.8rem)', fontWeight: '800', color: '#0f0f0f', margin: '0 0 4px' }}>
                            All Restaurants
                        </h2>
                        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>{filtered.length} restaurants available</p>
                    </div>

                    {/* Category pills */}
                    <div className="cat-scroll" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '2rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
                        {categories.map(cat => (
                            <button key={cat.label} onClick={() => setSelectedCategory(cat.label)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '9px 18px', borderRadius: '999px',
                                border: selectedCategory === cat.label ? 'none' : '1.5px solid #e5e7eb',
                                background: selectedCategory === cat.label ? 'linear-gradient(135deg, #ff4d2d, #ff7043)' : 'white',
                                color: selectedCategory === cat.label ? 'white' : '#374151',
                                fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                                whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                                transition: 'all 0.2s', flexShrink: 0,
                                boxShadow: selectedCategory === cat.label ? '0 4px 14px rgba(255,77,45,0.3)' : '0 1px 4px rgba(0,0,0,0.06)'
                            }}>
                                <span>{cat.icon}</span>{cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Restaurant Grid */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', background: 'white' }}>
                                    <div className="skeleton" style={{ height: '180px' }} />
                                    <div style={{ padding: '1rem' }}>
                                        <div className="skeleton" style={{ height: '18px', marginBottom: '8px', width: '60%' }} />
                                        <div className="skeleton" style={{ height: '13px', width: '40%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'clamp(3rem,8vw,5rem)', background: 'white', borderRadius: '24px', border: '1.5px solid #f3f4f6' }}>
                            <p style={{ fontSize: '3.5rem', margin: '0 0 16px' }}>🍽️</p>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#0f0f0f', margin: '0 0 8px' }}>No restaurants found</h3>
                            <p style={{ color: '#9ca3af' }}>Try a different search or increase the radius</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
                            {filtered.map((r, i) => (
                                <RestaurantCard key={r._id} restaurant={r} index={i} onClick={() => navigate(`/restaurant/${r._id}`)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── BESTSELLERS ──────────────────────────────────────── */}
            {bestSellers.length > 0 && (
                <div className="section-pad" style={{ background: 'white', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ background: '#fff5f3', color: '#ff4d2d', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', border: '1px solid #ffe8e3' }}>🔥 Most Ordered</span>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: '800', color: '#0f0f0f', margin: '10px 0 4px' }}>Bestseller Restaurants</h2>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>Our most popular picks loved by thousands</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '20px' }}>
                            {bestSellers.map((r, i) => (
                                <RestaurantCard key={r._id} restaurant={r} index={i} onClick={() => navigate(`/restaurant/${r._id}`)} badge="🔥 Bestseller" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOP RATED ────────────────────────────────────────── */}
            {topRated.length > 0 && (
                <div className="section-pad" style={{ background: 'linear-gradient(135deg, #fff8f6, #fafafa)', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ background: '#fefce8', color: '#92400e', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', border: '1px solid #fde68a' }}>⭐ Highest Rated</span>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: '800', color: '#0f0f0f', margin: '10px 0 4px' }}>Top Rated Restaurants</h2>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>Customers rate these 4.3 stars and above</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '20px' }}>
                            {topRated.map((r, i) => (
                                <RestaurantCard key={r._id} restaurant={r} index={i} onClick={() => navigate(`/restaurant/${r._id}`)} badge="⭐ Top Rated" badgeColor="linear-gradient(135deg, #f59e0b, #d97706)" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── NEW ARRIVALS ─────────────────────────────────────── */}
            {newArrivals.length > 0 && (
                <div className="section-pad" style={{ background: 'white', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ background: '#f0fdf4', color: '#15803d', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', border: '1px solid #bbf7d0' }}>🆕 Just Added</span>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.4rem,3.5vw,2rem)', fontWeight: '800', color: '#0f0f0f', margin: '10px 0 4px' }}>New Arrivals</h2>
                            <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>Freshly added — be the first to try!</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '20px' }}>
                            {newArrivals.map((r, i) => (
                                <RestaurantCard key={r._id} restaurant={r} index={i} onClick={() => navigate(`/restaurant/${r._id}`)} badge="🆕 New" badgeColor="linear-gradient(135deg, #10b981, #059669)" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── FEATURES ─────────────────────────────────────────── */}
            <div className="section-pad" style={{ background: '#0f0f0f', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span style={{ background: 'rgba(255,77,45,0.15)', color: '#ff7043', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', border: '1px solid rgba(255,77,45,0.2)' }}>Why FoodZito?</span>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: '800', color: 'white', margin: '14px 0 8px' }}>
                            Everything You Need
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>We make food delivery simple, fast and reliable</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '20px' }}>
                        {features.map((f, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                                padding: 'clamp(1.2rem,3vw,1.5rem)',
                                border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,45,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,77,45,0.3)'; e.currentTarget.style.transform = 'translateY(-6px)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: '700', color: 'white', margin: '0 0 8px' }}>{f.title}</h3>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CUSTOMER REVIEWS ─────────────────────────────────── */}
            <div className="section-pad" style={{ background: '#fafafa', padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span style={{ background: '#fefce8', color: '#92400e', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', border: '1px solid #fde68a' }}>⭐ Customer Reviews</span>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: '800', color: '#0f0f0f', margin: '14px 0 8px' }}>
                            What Our Customers Say
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: '15px' }}>Trusted by 5,000+ happy customers across Bihar</p>
                    </div>
                    <div className="review-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '20px' }}>
                        {customerReviews.map((review, i) => (
                            <div key={i} style={{
                                background: 'white', borderRadius: '20px',
                                padding: 'clamp(1.1rem,3vw,1.5rem)',
                                border: '1.5px solid #f3f4f6', transition: 'all 0.3s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#ffe8e3' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#f3f4f6' }}
                            >
                                <StarRow value={review.rating} size={16} />
                                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, margin: '12px 0', fontStyle: 'italic' }}>
                                    "{review.comment}"
                                </p>
                                <span style={{ background: '#fff5f3', color: '#ff4d2d', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600', display: 'inline-block', marginBottom: '14px' }}>
                                    🍽️ {review.dish}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid #f9fafb', paddingTop: '12px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: '700', fontSize: '15px',
                                        fontFamily: 'Syne, sans-serif', flexShrink: 0
                                    }}>{review.avatar}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.name}</p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>📍 {review.location}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                                        <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>Verified ✓</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA BANNER ───────────────────────────────────────── */}
            <div style={{
                background: 'linear-gradient(135deg, #ff4d2d 0%, #ff7043 50%, #ff8c42 100%)',
                padding: 'clamp(3rem,6vw,5rem) clamp(1rem,4vw,1.5rem)',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '250px', height: '250px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.6rem,4vw,3rem)', fontWeight: '800', color: 'white', margin: '0 0 16px' }}>
                        Hungry? We've Got You! 🚀
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(13px,2vw,16px)', margin: '0 0 2.5rem', lineHeight: 1.6 }}>
                        Join thousands of happy customers. Order now and get your food delivered in 30 minutes!
                    </p>
                    <div className="cta-btns" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/signup')} style={{
                            padding: 'clamp(12px,2vw,16px) clamp(24px,4vw,40px)',
                            background: 'white', color: '#ff4d2d', border: 'none', borderRadius: '14px',
                            fontFamily: 'Syne, sans-serif', fontWeight: '800',
                            fontSize: 'clamp(14px,2vw,16px)', cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >Order Now 🍕</button>
                        <button onClick={() => navigate('/signup')} style={{
                            padding: 'clamp(12px,2vw,16px) clamp(24px,4vw,40px)',
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            border: '2px solid rgba(255,255,255,0.4)', borderRadius: '14px',
                            fontFamily: 'Syne, sans-serif', fontWeight: '700',
                            fontSize: 'clamp(14px,2vw,16px)', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        >List Your Restaurant 🏪</button>
                    </div>
                </div>
            </div>

            {/* ── FOOTER ───────────────────────────────────────────── */}
            <footer style={{ background: '#0f0f0f', padding: 'clamp(2.5rem,5vw,4rem) clamp(1rem,4vw,1.5rem) 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ff4d2d, #ff7043)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🍕</div>
                                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '20px', background: 'linear-gradient(135deg, #ff4d2d, #ff7043)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FoodZito</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', lineHeight: 1.8, margin: '0 0 20px', maxWidth: '220px' }}>
                                Your favourite food delivered fast. Serving Muzaffarpur and nearby cities with love. 🍕
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                                    <div key={i} style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,45,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    >{icon}</div>
                                ))}
                            </div>
                        </div>
                        {[
                            { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
                            { title: 'For Restaurants', links: ['Partner With Us', 'Owner Dashboard', 'Restaurant App', 'Advertise'] },
                            { title: 'For Delivery', links: ['Deliver With Us', 'Delivery App', 'Safety', 'Earnings'] },
                            { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms'] }
                        ].map((section, i) => (
                            <div key={i}>
                                <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700', color: 'white', margin: '0 0 16px' }}>{section.title}</h4>
                                {section.links.map((link, j) => (
                                    <p key={j} style={{ margin: '0 0 10px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#ff7043'}
                                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                                    >{link}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>
                            © 2025 FoodZito. Made with ❤️ in Muzaffarpur, Bihar
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {['Privacy', 'Terms', 'Cookies'].map((item, i) => (
                                <span key={i} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', cursor: 'pointer' }}
                                    onMouseEnter={e => e.target.style.color = '#ff7043'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
                                >{item}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {showCart && <Cart onClose={() => setShowCart(false)} />}
            {showMap && (
                <MapPicker
                    userLocation={userLocation}
                    restaurants={restaurants}
                    onLocationSelect={handleMapLocationSelect}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    )
}

export default Home