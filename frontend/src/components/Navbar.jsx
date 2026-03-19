import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import Logo from './Logo'
import LocationPicker from './LocationPicker'

function Navbar({ onCartClick }) {
    const { userData, cartItems } = useSelector(state => state.user)
    const { locationName, city } = useSelector(state => state.location)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [showLocation, setShowLocation] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close menus on outside click
    useEffect(() => {
        const handler = () => { setShowMenu(false) }
        if (showMenu) document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [showMenu])

    const handleSignOut = async () => {
        try {
            await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true })
            dispatch(setUserData(null))
            navigate("/signin")
        } catch (error) {
            console.log(error)
        }
    }

    const menuItems = [
        { label: '📦  My Orders', action: () => { navigate('/my-orders'); setShowMenu(false) } },
        { label: '👤  Profile', action: () => { navigate('/profile'); setShowMenu(false) } },
    ]
    if (userData?.role === 'owner') {
        menuItems.splice(1, 0, { label: '🏪  Owner Dashboard', action: () => { navigate('/owner'); setShowMenu(false) } })
    }
    if (userData?.role === 'deliveryBoy') {
        menuItems.splice(1, 0, { label: '🛵  Delivery Dashboard', action: () => { navigate('/delivery'); setShowMenu(false) } })
    }

    return (
        <>
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none'
            }}>
                <div style={{
                    maxWidth: '1300px', margin: '0 auto',
                    padding: '0 1.5rem', height: '68px',
                    display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                    {/* Logo */}
                    <Logo size="md" onClick={() => navigate('/')} />

                    {/* Location Bar */}
                    <button onClick={() => setShowLocation(true)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#f9fafb', border: '1.5px solid #e5e7eb',
                        borderRadius: '12px', padding: '8px 14px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        maxWidth: '220px', minWidth: '160px',
                        fontFamily: 'DM Sans, sans-serif'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4d2d'; e.currentTarget.style.background = '#fff5f3' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
                    >
                        <span style={{ fontSize: '16px' }}>{locationName ? '📍' : '🗺️'}</span>
                        <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Deliver to
                            </p>
                            <p style={{
                                margin: 0, fontSize: '13px', fontWeight: '600',
                                color: locationName ? '#0f0f0f' : '#6b7280',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {locationName || 'Set location'}
                            </p>
                        </div>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>▼</span>
                    </button>

                    {/* Search - flex grow */}
                    <div style={{
                        flex: 1, position: 'relative',
                        display: 'flex', alignItems: 'center'
                    }}>
                        <span style={{
                            position: 'absolute', left: '14px',
                            fontSize: '16px', pointerEvents: 'none'
                        }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search restaurants, cuisines..."
                            style={{
                                width: '100%', padding: '10px 16px 10px 42px',
                                border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                                outline: 'none', color: '#111',
                                background: '#f9fafb', transition: 'all 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

                        {/* Cart */}
                        <button onClick={onCartClick} style={{
                            position: 'relative',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            border: 'none', borderRadius: '12px',
                            padding: '9px 18px', cursor: 'pointer',
                            color: 'white', fontWeight: '700', fontSize: '14px',
                            fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 4px 12px rgba(255,77,45,0.3)',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,77,45,0.4)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,77,45,0.3)' }}
                        >
                            🛒
                            {totalCartItems > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-7px', right: '-7px',
                                    background: '#0f0f0f', color: 'white',
                                    borderRadius: '50%', width: '19px', height: '19px',
                                    fontSize: '10px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', border: '2px solid white',
                                    animation: 'bounceIn 0.4s ease'
                                }}>
                                    {totalCartItems}
                                </span>
                            )}
                        </button>

                        {/* Profile Avatar */}
                        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowMenu(!showMenu)} style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white', border: '2.5px solid white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '800', fontSize: '15px', cursor: 'pointer',
                                fontFamily: 'Syne, sans-serif',
                                boxShadow: showMenu ? '0 0 0 3px rgba(255,77,45,0.3)' : '0 4px 12px rgba(255,77,45,0.3)',
                                transition: 'all 0.2s'
                            }}>
                                {userData?.fullName?.charAt(0).toUpperCase()}
                            </button>

                            {showMenu && (
                                <div className="animate-scaleIn" style={{
                                    position: 'absolute', right: 0, top: '50px',
                                    background: 'white', borderRadius: '18px',
                                    padding: '8px', minWidth: '220px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    transformOrigin: 'top right', zIndex: 200
                                }}>
                                    {/* User card */}
                                    <div style={{
                                        padding: '12px 14px',
                                        background: 'linear-gradient(135deg, #fff5f3, white)',
                                        borderRadius: '12px', marginBottom: '6px',
                                        border: '1px solid #ffe8e3'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: '700', fontSize: '15px',
                                                flexShrink: 0
                                            }}>{userData?.fullName?.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '13px', margin: 0, color: '#111', fontFamily: 'Syne, sans-serif' }}>
                                                    {userData?.fullName}
                                                </p>
                                                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '1px 0 0' }}>
                                                    {userData?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                            <span style={{
                                                fontSize: '10px', background: '#fff5f3',
                                                color: '#ff4d2d', padding: '2px 8px',
                                                borderRadius: '999px', fontWeight: '700',
                                                textTransform: 'uppercase', letterSpacing: '0.5px'
                                            }}>{userData?.role}</span>
                                            {locationName && (
                                                <span style={{
                                                    fontSize: '10px', background: '#f0fdf4',
                                                    color: '#15803d', padding: '2px 8px',
                                                    borderRadius: '999px', fontWeight: '600'
                                                }}>📍 {locationName}</span>
                                            )}
                                        </div>
                                    </div>

                                    {menuItems.map((item, i) => (
                                        <button key={i} onClick={item.action} style={{
                                            width: '100%', textAlign: 'left',
                                            padding: '10px 14px', background: 'none',
                                            border: 'none', borderRadius: '10px',
                                            cursor: 'pointer', fontSize: '14px',
                                            color: '#374151', fontFamily: 'DM Sans, sans-serif',
                                            transition: 'all 0.15s', display: 'flex',
                                            alignItems: 'center', gap: '4px'
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#ff4d2d' }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151' }}
                                        >{item.label}</button>
                                    ))}

                                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                                    <button onClick={handleSignOut} style={{
                                        width: '100%', textAlign: 'left',
                                        padding: '10px 14px', background: 'none',
                                        border: 'none', borderRadius: '10px',
                                        cursor: 'pointer', fontSize: '14px',
                                        color: '#ef4444', fontFamily: 'DM Sans, sans-serif',
                                        transition: 'all 0.15s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >🚪  Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Location Picker Modal */}
            {showLocation && <LocationPicker onClose={() => setShowLocation(false)} />}
        </>
    )
}

export default Navbar