import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})

const restaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})

function LocationMarker({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng)
        }
    })
    return null
}

function MapPicker({ userLocation, restaurants, onLocationSelect, onClose }) {
    const center = userLocation || { lat: 26.1197, lng: 85.3910 }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'DM Sans, sans-serif'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '750px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.2rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f3f4f6',
                    background: 'linear-gradient(135deg, #fff5f3, white)'
                }}>
                    <div>
                        <h3 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: '700', fontSize: '18px',
                            color: '#0f0f0f', margin: 0
                        }}>📍 Pin Your Location</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            Click anywhere on the map to set your delivery location
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#f3f4f6', border: 'none',
                        borderRadius: '10px', width: '36px', height: '36px',
                        cursor: 'pointer', fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>✕</button>
                </div>

                {/* Map */}
                <div style={{ height: '420px' }}>
                    <MapContainer
                        center={[center.lat, center.lng]}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        <LocationMarker onLocationSelect={onLocationSelect} />

                        {/* User location */}
                        {userLocation && (
                            <>
                                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                                    <Popup>📍 Your Location</Popup>
                                </Marker>
                                <Circle
                                    center={[userLocation.lat, userLocation.lng]}
                                    radius={5000}
                                    color="#ff4d2d"
                                    fillColor="#ff4d2d"
                                    fillOpacity={0.08}
                                    weight={1}
                                />
                            </>
                        )}

                        {/* Restaurant markers */}
                        {restaurants.map(r => (
                            <Marker
                                key={r._id}
                                position={[r.location?.lat || 26.1197, r.location?.lng || 85.3910]}
                                icon={restaurantIcon}
                            >
                                <Popup>
                                    <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: '150px' }}>
                                        <strong style={{ fontSize: '14px' }}>{r.name}</strong><br />
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.category}</span><br />
                                        {r.distance && (
                                            <span style={{ fontSize: '12px', color: '#ff4d2d', fontWeight: '600' }}>
                                                📏 {r.distance} km away
                                            </span>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    borderTop: '1px solid #f3f4f6'
                }}>
                    <div style={{ flex: 1, fontSize: '13px', color: '#6b7280' }}>
                        🔴 Red = Your location • 🟠 Orange = Restaurants
                    </div>
                    <button onClick={onClose} style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                        boxShadow: '0 4px 12px rgba(255,77,45,0.3)'
                    }}>
                        Confirm Location ✓
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MapPicker