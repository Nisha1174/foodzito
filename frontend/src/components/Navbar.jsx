import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import Logo from './Logo'
import LocationPicker from './LocationPicker'

/* ── Responsive CSS injected once ─────────────────────────────────── */
const navCSS = `
  @keyframes bounceIn { 0%{transform:scale(0.5);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.92) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .animate-scaleIn { animation: scaleIn 0.18s ease both; }

  /* hamburger lines */
  .ham-line { display:block; width:22px; height:2px; background:#374151; border-radius:2px; transition:all 0.3s; }

  /* hide/show helpers */
  .nav-location { display:flex; }
  .nav-search   { display:flex; }
  .nav-cart-label { display:inline; }

  /* hide search input on small screens — icon only */
  @media (max-width:900px) {
    .nav-location { display:none !important; }
  }
  @media (max-width:640px) {
    .nav-search { display:none !important; }
    .nav-cart-label { display:none !important; }
  }
`

function NavStyleInjector() {
    useEffect(() => {
        if (document.getElementById('fz-nav-css')) return
        const el = document.createElement('style')
        el.id = 'fz-nav-css'
        el.textContent = navCSS
        document.head.appendChild(el)
        return () => el.remove()
    }, [])
    return null
}

function Navbar({ onCartClick }) {
    const { userData, cartItems } = useSelector(state => state.user)
    const { locationName } = useSelector(state => state.location)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [showMenu, setShowMenu]         = useState(false)
    const [showLocation, setShowLocation] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [scrolled, setScrolled]         = useState(false)

    const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* close dropdowns on outside click */
    useEffect(() => {
        const close = () => { setShowMenu(false); setShowMobileMenu(false) }
        if (showMenu || showMobileMenu) document.addEventListener('click', close)
        return () => document.removeEventListener('click', close)
    }, [showMenu, showMobileMenu])

    const handleSignOut = async () => {
        try {
            await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true })
            dispatch(setUserData(null))
            navigate('/signin')
        } catch (e) { console.log(e) }
    }

    const menuItems = [
        { label: '📦  My Orders',  action: () => { navigate('/my-orders'); setShowMenu(false); setShowMobileMenu(false) } },
        { label: '👤  Profile',    action: () => { navigate('/profile');   setShowMenu(false); setShowMobileMenu(false) } },
    ]
    if (userData?.role === 'owner')
        menuItems.splice(1, 0, { label: '🏪  Owner Dashboard',    action: () => { navigate('/owner');    setShowMenu(false); setShowMobileMenu(false) } })
    if (userData?.role === 'deliveryBoy')
        menuItems.splice(1, 0, { label: '🛵  Delivery Dashboard', action: () => { navigate('/delivery'); setShowMenu(false); setShowMobileMenu(false) } })

    /* ── shared dropdown card ── */
    const ProfileDropdown = ({ style = {} }) => (
        <div className="animate-scaleIn" style={{
            background: 'white', borderRadius: '18px',
            padding: '8px', minWidth: '220px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.06)',
            ...style
        }} onClick={e => e.stopPropagation()}>
            {/* User card */}
            <div style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg,#fff5f3,white)',
                borderRadius: '12px', marginBottom: '6px',
                border: '1px solid #ffe8e3'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg,#ff4d2d,#ff7043)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0
                    }}>{userData?.fullName?.charAt(0).toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: '700', fontSize: '13px', margin: 0, color: '#111', fontFamily: 'Syne, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userData?.fullName}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userData?.email}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', background: '#fff5f3', color: '#ff4d2d', padding: '2px 8px', borderRadius: '999px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {userData?.role}
                    </span>
                    {locationName && (
                        <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: '999px', fontWeight: '600' }}>
                            📍 {locationName}
                        </span>
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
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px'
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
    )

    return (
        <>
            <NavStyleInjector />

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
                    padding: '0 clamp(0.75rem,3vw,1.5rem)',
                    height: '64px',
                    display: 'flex', alignItems: 'center', gap: 'clamp(8px,2vw,16px)'
                }}>

                    {/* ── Logo ── */}
                    <Logo size="md" onClick={() => navigate('/')} />

                    {/* ── Location bar (hidden ≤900px) ── */}
                    <button
                        className="nav-location"
                        onClick={() => setShowLocation(true)}
                        style={{
                            alignItems: 'center', gap: '8px',
                            background: '#f9fafb', border: '1.5px solid #e5e7eb',
                            borderRadius: '12px', padding: '8px 14px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            maxWidth: '200px', minWidth: '140px',
                            fontFamily: 'DM Sans, sans-serif', flexShrink: 0
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4d2d'; e.currentTarget.style.background = '#fff5f3' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb' }}
                    >
                        <span style={{ fontSize: '16px' }}>{locationName ? '📍' : '🗺️'}</span>
                        <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deliver to</p>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: locationName ? '#0f0f0f' : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {locationName || 'Set location'}
                            </p>
                        </div>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>▼</span>
                    </button>

                    {/* ── Search (hidden ≤640px) ── */}
                    <div className="nav-search" style={{ flex: 1, position: 'relative', alignItems: 'center', minWidth: 0 }}>
                        <span style={{ position: 'absolute', left: '14px', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
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

                    {/* ── Right actions ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px,1.5vw,10px)', flexShrink: 0, marginLeft: 'auto' }}>

                        {/* Location icon — visible ≤900px only */}
                        <button
                            onClick={() => setShowLocation(true)}
                            title="Set location"
                            style={{
                                display: 'none',
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#f9fafb', border: '1.5px solid #e5e7eb',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', cursor: 'pointer', transition: 'all 0.2s',
                                /* shown via inline override below */
                            }}
                            className="nav-location-icon"
                        >📍</button>

                        {/* Cart */}
                        <button onClick={onCartClick} style={{
                            position: 'relative',
                            background: 'linear-gradient(135deg,#ff4d2d,#ff7043)',
                            border: 'none', borderRadius: '12px',
                            padding: '9px clamp(10px,2vw,18px)',
                            cursor: 'pointer', color: 'white',
                            fontWeight: '700', fontSize: '14px',
                            fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 4px 12px rgba(255,77,45,0.3)',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,77,45,0.4)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,77,45,0.3)' }}
                        >
                            🛒 <span className="nav-cart-label">Cart</span>
                            {totalCartItems > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-7px', right: '-7px',
                                    background: '#0f0f0f', color: 'white',
                                    borderRadius: '50%', width: '19px', height: '19px',
                                    fontSize: '10px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', border: '2px solid white',
                                    animation: 'bounceIn 0.4s ease'
                                }}>{totalCartItems}</span>
                            )}
                        </button>

                        {/* ── Desktop: avatar + dropdown ── */}
                        {userData ? (
                            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}
                                className="desktop-avatar">
                                <button onClick={() => setShowMenu(!showMenu)} style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#ff4d2d,#ff7043)',
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
                                    <ProfileDropdown style={{
                                        position: 'absolute', right: 0, top: '50px',
                                        transformOrigin: 'top right', zIndex: 200
                                    }} />
                                )}
                            </div>
                        ) : (
                            /* Not signed in — show Sign In btn on desktop */
                            <button onClick={() => navigate('/signin')} style={{
                                padding: '9px 18px',
                                background: 'linear-gradient(135deg,#ff4d2d,#ff7043)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: '0 4px 12px rgba(255,77,45,0.3)',
                                whiteSpace: 'nowrap'
                            }}>Sign In</button>
                        )}

                        {/* ── Hamburger (mobile ≤640px) ── */}
                        <button
                            onClick={e => { e.stopPropagation(); setShowMobileMenu(p => !p) }}
                            aria-label="Menu"
                            style={{
                                display: 'none',          /* shown via CSS below */
                                flexDirection: 'column', gap: '5px',
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: '#f9fafb', border: '1.5px solid #e5e7eb',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', padding: 0,
                                flexShrink: 0
                            }}
                            className="hamburger-btn"
                        >
                            <span className="ham-line" style={{ transform: showMobileMenu ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
                            <span className="ham-line" style={{ opacity: showMobileMenu ? 0 : 1, transform: showMobileMenu ? 'scaleX(0)' : 'none' }} />
                            <span className="ham-line" style={{ transform: showMobileMenu ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
                        </button>
                    </div>
                </div>

                {/* ── Mobile menu drawer ── */}
                {showMobileMenu && (
                    <div
                        className="animate-scaleIn"
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderTop: '1px solid #f3f4f6',
                            padding: '16px clamp(0.75rem,3vw,1.5rem) 20px'
                        }}
                    >
                        {/* Mobile search */}
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search restaurants, cuisines..."
                                style={{
                                    width: '100%', padding: '11px 16px 11px 42px',
                                    border: '1.5px solid #e5e7eb', borderRadius: '12px',
                                    fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                                    outline: 'none', color: '#111',
                                    background: '#f9fafb', boxSizing: 'border-box'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.background = 'white' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb' }}
                            />
                        </div>

                        {/* Mobile location */}
                        <button onClick={() => { setShowLocation(true); setShowMobileMenu(false) }} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            width: '100%', background: '#f9fafb',
                            border: '1.5px solid #e5e7eb', borderRadius: '12px',
                            padding: '10px 14px', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif', marginBottom: '12px',
                            transition: 'all 0.2s', textAlign: 'left'
                        }}>
                            <span style={{ fontSize: '18px' }}>{locationName ? '📍' : '🗺️'}</span>
                            <div>
                                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Deliver to</p>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: locationName ? '#0f0f0f' : '#6b7280' }}>
                                    {locationName || 'Set your location'}
                                </p>
                            </div>
                            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>▼</span>
                        </button>

                        {/* Mobile user section */}
                        {userData ? (
                            <>
                                {/* User info strip */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', background: 'linear-gradient(135deg,#fff5f3,white)',
                                    borderRadius: '12px', border: '1px solid #ffe8e3', marginBottom: '6px'
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#ff4d2d,#ff7043)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0
                                    }}>{userData?.fullName?.charAt(0).toUpperCase()}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: '700', fontSize: '13px', margin: 0, color: '#111', fontFamily: 'Syne, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userData?.fullName}</p>
                                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userData?.email}</p>
                                    </div>
                                    <span style={{ marginLeft: 'auto', fontSize: '10px', background: '#fff5f3', color: '#ff4d2d', padding: '2px 8px', borderRadius: '999px', fontWeight: '700', textTransform: 'uppercase', flexShrink: 0 }}>
                                        {userData?.role}
                                    </span>
                                </div>

                                {menuItems.map((item, i) => (
                                    <button key={i} onClick={item.action} style={{
                                        width: '100%', textAlign: 'left',
                                        padding: '11px 14px', background: 'none',
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
                                    padding: '11px 14px', background: 'none',
                                    border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', fontSize: '14px',
                                    color: '#ef4444', fontFamily: 'DM Sans, sans-serif',
                                    transition: 'all 0.15s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                >🚪  Sign Out</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => navigate('/signin')} style={{
                                    flex: 1, padding: '12px',
                                    background: 'linear-gradient(135deg,#ff4d2d,#ff7043)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif'
                                }}>Sign In</button>
                                <button onClick={() => navigate('/signup')} style={{
                                    flex: 1, padding: '12px',
                                    background: 'white', color: '#ff4d2d',
                                    border: '1.5px solid #ff4d2d', borderRadius: '12px',
                                    fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif'
                                }}>Sign Up</button>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* ── Responsive show/hide overrides ── */}
            <style>{`
              @media (max-width:900px) {
                .nav-location-icon { display:flex !important; }
              }
              @media (max-width:640px) {
                .desktop-avatar { display:none !important; }
                .hamburger-btn  { display:flex !important; }
              }
            `}</style>

            {showLocation && <LocationPicker onClose={() => setShowLocation(false)} />}
        </>
    )
}

export default Navbar