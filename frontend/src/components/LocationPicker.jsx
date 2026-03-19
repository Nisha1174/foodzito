import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLocation, clearLocation } from '../redux/locationSlice'

const popularCities = [
    { name: 'Muzaffarpur', city: 'Muzaffarpur', lat: 26.1197, lng: 85.3910 },
    { name: 'Patna',       city: 'Patna',       lat: 25.5941, lng: 85.1376 },
    { name: 'Delhi',       city: 'Delhi',       lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai',      city: 'Mumbai',      lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore',   city: 'Bangalore',   lat: 12.9716, lng: 77.5946 },
    { name: 'Kolkata',     city: 'Kolkata',     lat: 22.5726, lng: 88.3639 }
]

function LocationPicker({ onClose }) {
    const dispatch = useDispatch()
    const { locationName } = useSelector(state => state.location)
    const [manualAddress, setManualAddress] = useState('')
    const [detecting, setDetecting] = useState(false)

    /* Responsive: bottom sheet on mobile, centred modal on larger screens */
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 540)
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 540)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    /* Lock body scroll */
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const handleDetectLocation = () => {
        setDetecting(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
                        )
                        const data = await res.json()
                        const name = data.address?.suburb || data.address?.city_district || data.address?.city || 'Your location'
                        const city = data.address?.city || data.address?.state_district || ''
                        dispatch(setLocation({ coords, name, city }))
                        onClose()
                    } catch {
                        dispatch(setLocation({ coords, name: 'Your location', city: '' }))
                        onClose()
                    }
                    setDetecting(false)
                },
                () => {
                    setDetecting(false)
                    alert('Location access denied. Please select manually.')
                }
            )
        }
    }

    const handleManualSubmit = async () => {
        if (!manualAddress.trim()) return
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`
            )
            const data = await res.json()
            if (data.length > 0) {
                const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
                dispatch(setLocation({ coords, name: manualAddress, city: data[0].display_name.split(',')[1]?.trim() || '' }))
                onClose()
            }
        } catch {
            dispatch(setLocation({ coords: null, name: manualAddress, city: '' }))
            onClose()
        }
    }

    const handleCitySelect = (cityData) => {
        dispatch(setLocation({
            coords: { lat: cityData.lat, lng: cityData.lng },
            name: cityData.name,
            city: cityData.city
        }))
        onClose()
    }

    /* ── layout vars ── */
    const modalStyle = isMobile
        ? {
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            top: 'auto',
            transform: 'none',
            borderRadius: '24px 24px 0 0',
            maxHeight: '90vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '0 1.25rem 1.5rem',
        }
        : {
            position: 'fixed',
            top: '80px', left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            padding: '1.5rem',
        }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 400
                }}
            />

            {/* Modal / Bottom sheet */}
            <div
                className="animate-scaleIn"
                style={{
                    background: 'white',
                    zIndex: 401,
                    boxShadow: isMobile
                        ? '0 -8px 40px rgba(0,0,0,0.18)'
                        : '0 20px 60px rgba(0,0,0,0.2)',
                    fontFamily: 'DM Sans, sans-serif',
                    ...modalStyle
                }}
            >
                {/* Mobile drag handle */}
                {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                        <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: '#e5e7eb' }} />
                    </div>
                )}

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '1.25rem',
                    paddingTop: isMobile ? '4px' : 0
                }}>
                    <div>
                        <h3 style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: '700',
                            fontSize: isMobile ? '17px' : '18px',
                            color: '#0f0f0f', margin: 0
                        }}>📍 Set Your Location</h3>
                        <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            {locationName ? `Current: ${locationName}` : 'Find restaurants near you'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: '1px solid #e5e7eb', background: 'white',
                            cursor: 'pointer', fontSize: '14px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >✕</button>
                </div>

                {/* Detect GPS */}
                <button
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    style={{
                        width: '100%', padding: '14px',
                        background: detecting ? '#f9fafb' : 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                        color: detecting ? '#6b7280' : 'white',
                        border: 'none', borderRadius: '14px',
                        fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', marginBottom: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                >
                    {detecting ? (
                        <>
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                border: '2px solid #e5e7eb', borderTopColor: '#ff4d2d',
                                animation: 'spin 1s linear infinite', flexShrink: 0
                            }} />
                            Detecting your location...
                        </>
                    ) : <>📡 Use my current location</>}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>or enter manually</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                {/* Manual input */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Type your area, city..."
                        value={manualAddress}
                        onChange={e => setManualAddress(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                        style={{
                            flex: 1, padding: '12px 16px',
                            border: '1.5px solid #e5e7eb', borderRadius: '12px',
                            fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                            outline: 'none', color: '#111', minWidth: 0
                        }}
                        onFocus={e => { e.target.style.borderColor = '#ff4d2d' }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb' }}
                    />
                    <button
                        onClick={handleManualSubmit}
                        style={{
                            padding: '12px 18px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontWeight: '600', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif', fontSize: '14px',
                            flexShrink: 0, whiteSpace: 'nowrap'
                        }}
                    >Search</button>
                </div>

                {/* Popular cities */}
                <p style={{
                    margin: '0 0 10px', fontSize: '12px', fontWeight: '600',
                    color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>Popular Cities</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: '8px'
                }}>
                    {popularCities.map(city => (
                        <button
                            key={city.name}
                            onClick={() => handleCitySelect(city)}
                            style={{
                                padding: '10px 8px',
                                background: '#f9fafb', border: '1px solid #f3f4f6',
                                borderRadius: '12px', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                                fontWeight: '500', color: '#374151',
                                transition: 'all 0.2s', textAlign: 'center'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fff5f3'; e.currentTarget.style.borderColor = '#ff4d2d'; e.currentTarget.style.color = '#ff4d2d' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.color = '#374151' }}
                        >
                            {city.name}
                        </button>
                    ))}
                </div>

                {locationName && (
                    <button
                        onClick={() => { dispatch(clearLocation()); onClose() }}
                        style={{
                            width: '100%', marginTop: '14px', padding: '10px',
                            background: 'none', border: 'none', color: '#ef4444',
                            fontSize: '13px', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif', fontWeight: '500'
                        }}
                    >🗑️ Clear saved location</button>
                )}
            </div>
        </>
    )
}

export default LocationPicker