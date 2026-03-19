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
        if (sortByDistance && userLocation) {
            result = result.sort((a, b) => (a.distance || 999) - (b.distance || 999))
        }
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
                    } catch {
                        dispatch(setLocation({ coords, name: 'Your location', city: '' }))
                    }
                },
                () => {
                    const coords = { lat: 26.1197, lng: 85.3910 }
                    dispatch(setLocation({ coords, name: 'Muzaffarpur', city: 'Muzaffarpur' }))
                }
            )
        }
    }

    const handleMapLocationSelect = async (latlng) => {
        const coords = { lat: latlng.lat, lng: latlng.lng }
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
            const data = await res.json()
            const name = data.address?.suburb || data.address?.city || 'Selected location'
            dispatch(setLocation({ coords, name, city: data.address?.city || '' }))
        } catch {
            dispatch(setLocation({ coords, name: 'Selected location', city: '' }))
        }
        setShowMap(false)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => setShowCart(true)} />

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                padding: '4rem 1.5rem',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-60px', right: '-60px',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(255,77,45,0.25) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-40px', left: '10%',
                    width: '200px', height: '200px',
                    background: 'radial-gradient(circle, rgba(255,179,71,0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
                    <div className="animate-fadeInUp" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,77,45,0.15)',
                            border: '1px solid rgba(255,77,45,0.3)',
                            borderRadius: '999px', padding: '6px 16px', marginBottom: '1.5rem'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#ff4d2d', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                            <span style={{ color: '#ff7043', fontSize: '13px', fontWeight: '500' }}>
                                {locationName ? `Now delivering near ${locationName}` : 'Now delivering in your city'}
                            </span>
                        </div>

                        <h1 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            fontWeight: '800', color: 'white',
                            lineHeight: 1.1, margin: '0 0 1rem'
                        }}>
                            Order{' '}
                            <span style={{
                                background: 'linear-gradient(135deg, #ff4d2d, #ffb347)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                                {heroWords[heroWord]}
                            </span>
                            <br />Food Instantly 🍕
                        </h1>

                        <p style={{
                            color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem',
                            margin: '0 auto 2rem', maxWidth: '500px'
                        }}>
                            From the best restaurants near you
                        </p>

                        {/* Search bar */}
                        <div style={{ maxWidth: '560px', margin: '0 auto 1.5rem' }}>
                            <div style={{
                                display: 'flex', background: 'white',
                                borderRadius: '16px', overflow: 'hidden',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                            }}>
                                <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>🔍</div>
                                <input
                                    type="text"
                                    placeholder="Search restaurants or cuisines..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{
                                        flex: 1, border: 'none', outline: 'none',
                                        padding: '18px 0', fontSize: '15px',
                                        fontFamily: 'DM Sans, sans-serif', color: '#111', background: 'transparent'
                                    }}
                                />
                                <button style={{
                                    margin: '8px', padding: '10px 24px',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                    color: 'white', border: 'none', borderRadius: '10px',
                                    fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap'
                                }}>Search</button>
                            </div>
                        </div>

                        {/* Location Buttons */}
                        <div style={{
                            display: 'flex', gap: '10px', justifyContent: 'center',
                            flexWrap: 'wrap', maxWidth: '560px', margin: '0 auto'
                        }}>
                            <button onClick={handleGetLocation} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: userLocation ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
                                border: `1px solid ${userLocation ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.2)'}`,
                                borderRadius: '999px', padding: '10px 20px',
                                color: userLocation ? '#10b981' : 'white',
                                cursor: 'pointer', fontSize: '14px',
                                fontFamily: 'DM Sans, sans-serif', fontWeight: '500',
                                transition: 'all 0.2s'
                            }}>
                                <span>{userLocation ? '✅' : '📍'}</span>
                                {userLocation ? locationName || 'Location set' : 'Use my location'}
                            </button>

                            <button onClick={() => setShowMap(true)} style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '999px', padding: '10px 20px',
                                color: 'white', cursor: 'pointer', fontSize: '14px',
                                fontFamily: 'DM Sans, sans-serif', fontWeight: '500',
                                transition: 'all 0.2s'
                            }}>
                                🗺️ Pin on Map
                            </button>

                            {userLocation && (
                                <select
                                    value={radius}
                                    onChange={e => {
                                        setRadius(Number(e.target.value))
                                        if (userLocation) fetchRestaurants(userLocation.lat, userLocation.lng)
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '999px', padding: '10px 16px',
                                        color: 'white', cursor: 'pointer', fontSize: '14px',
                                        fontFamily: 'DM Sans, sans-serif', outline: 'none'
                                    }}
                                >
                                    <option value={2} style={{ color: '#111' }}>Within 2 km</option>
                                    <option value={5} style={{ color: '#111' }}>Within 5 km</option>
                                    <option value={10} style={{ color: '#111' }}>Within 10 km</option>
                                    <option value={20} style={{ color: '#111' }}>Within 20 km</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="animate-fadeInUp delay-2" style={{
                        display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap'
                    }}>
                        {[
                            { value: '50+', label: 'Restaurants' },
                            { value: '30 min', label: 'Avg delivery' },
                            { value: '5K+', label: 'Happy users' }
                        ].map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '1.6rem', fontWeight: '800',
                                    fontFamily: 'Syne, sans-serif',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ffb347)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>{stat.value}</div>
                                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* Location info bar */}
                {userLocation && (
                    <div className="animate-scaleIn" style={{
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: '14px', padding: '12px 20px',
                        marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        justifyContent: 'space-between', flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>📍</span>
                            <span style={{ fontSize: '14px', color: '#15803d', fontWeight: '600' }}>
                                Showing restaurants near {locationName || 'your location'} within {radius} km
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label style={{ fontSize: '13px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={sortByDistance}
                                    onChange={e => setSortByDistance(e.target.checked)}
                                    style={{ accentColor: '#10b981' }}
                                />
                                Sort by distance
                            </label>
                            <button onClick={() => {
                                setSortByDistance(false)
                                fetchRestaurants()
                                dispatch({ type: 'location/clearLocation' })
                            }} style={{
                                background: 'none', border: 'none',
                                color: '#6b7280', fontSize: '13px',
                                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                            }}>✕ Clear</button>
                        </div>
                    </div>
                )}

                {/* Category Pills */}
                <div style={{
                    display: 'flex', gap: '10px', overflowX: 'auto',
                    paddingBottom: '8px', marginBottom: '2rem', scrollbarWidth: 'none'
                }}>
                    {categories.map(cat => (
                        <button key={cat.label} onClick={() => setSelectedCategory(cat.label)} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 20px', borderRadius: '999px',
                            border: selectedCategory === cat.label ? 'none' : '1.5px solid #e5e7eb',
                            background: selectedCategory === cat.label
                                ? 'linear-gradient(135deg, #ff4d2d, #ff7043)' : 'white',
                            color: selectedCategory === cat.label ? 'white' : '#374151',
                            fontWeight: '500', fontSize: '14px', cursor: 'pointer',
                            whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
                            transition: 'all 0.2s',
                            boxShadow: selectedCategory === cat.label ? '0 4px 14px rgba(255,77,45,0.3)' : 'none'
                        }}>
                            <span>{cat.icon}</span>{cat.label}
                        </button>
                    ))}
                </div>

                {/* Section title */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '1.5rem',
                        fontWeight: '700', color: '#0f0f0f'
                    }}>
                        {search ? `Results for "${search}"` : selectedCategory === 'All' ? 'All Restaurants' : selectedCategory}
                    </h2>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>{filtered.length} restaurants</span>
                </div>

                {/* Restaurant Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', background: 'white' }}>
                                <div className="skeleton" style={{ height: '180px' }} />
                                <div style={{ padding: '1rem' }}>
                                    <div className="skeleton" style={{ height: '20px', marginBottom: '8px', width: '70%' }} />
                                    <div className="skeleton" style={{ height: '14px', width: '50%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '5rem 2rem',
                        background: 'white', borderRadius: '20px',
                        border: '1px solid #f3f4f6'
                    }}>
                        <p style={{ fontSize: '3.5rem', margin: '0 0 16px' }}>🍽️</p>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#111', margin: '0 0 8px' }}>No restaurants found</h3>
                        <p style={{ color: '#6b7280' }}>
                            {userLocation ? 'Try increasing the radius or change category' : 'Try a different search term'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
                        {filtered.map((restaurant, i) => (
                            <div key={restaurant._id}
                                className={`card animate-fadeInUp delay-${Math.min(i + 1, 5)}`}
                                onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                                style={{ cursor: 'pointer', overflow: 'hidden' }}
                            >
                                <div style={{
                                    height: '180px',
                                    background: restaurant.image
                                        ? `url(${restaurant.image}) center/cover`
                                        : 'linear-gradient(135deg, #fff5f3, #ffe8e3)',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', position: 'relative'
                                }}>
                                    {!restaurant.image && <span style={{ fontSize: '3.5rem', animation: 'float 3s ease-in-out infinite' }}>🍽️</span>}
                                    <span style={{
                                        position: 'absolute', top: '12px', left: '12px',
                                        padding: '4px 10px', borderRadius: '999px', fontSize: '11px',
                                        fontWeight: '600', color: 'white',
                                        background: restaurant.isOpen ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        {restaurant.isOpen ? '● Open' : '● Closed'}
                                    </span>
                                    <span style={{
                                        position: 'absolute', top: '12px', right: '12px',
                                        padding: '4px 10px', borderRadius: '999px', fontSize: '12px',
                                        fontWeight: '700', background: 'rgba(255,255,255,0.95)',
                                        color: restaurant.rating >= 4 ? '#15803d' : '#374151',
                                        backdropFilter: 'blur(4px)',
                                        display: 'flex', alignItems: 'center', gap: '3px'
                                    }}>
                                        ⭐ {restaurant.rating || 'New'}
                                    </span>
                                    {restaurant.distance !== undefined && (
                                        <span style={{
                                            position: 'absolute', bottom: '12px', left: '12px',
                                            padding: '4px 10px', borderRadius: '999px', fontSize: '11px',
                                            fontWeight: '600', color: 'white',
                                            background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(4px)'
                                        }}>
                                            📏 {restaurant.distance} km
                                        </span>
                                    )}
                                </div>

                                <div style={{ padding: '1.1rem' }}>
                                    <h3 style={{
                                        margin: '0 0 4px', fontSize: '17px', fontWeight: '700',
                                        fontFamily: 'Syne, sans-serif', color: '#0f0f0f'
                                    }}>{restaurant.name}</h3>
                                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#6b7280' }}>
                                        {restaurant.category} • {restaurant.address}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#374151' }}>
                                            ⏱️ {restaurant.deliveryTime} mins
                                        </span>
                                        <span style={{
                                            fontSize: '13px', color: '#ff4d2d', fontWeight: '600',
                                            background: '#fff5f3', padding: '4px 10px', borderRadius: '8px'
                                        }}>Order Now →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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