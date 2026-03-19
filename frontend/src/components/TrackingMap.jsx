import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { io } from 'socket.io-client'
import { serverUrl } from '../App'

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

const restaurantIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
})

function MapUpdater({ center }) {
    const map = useMap()
    useEffect(() => {
        if (center) map.setView(center, map.getZoom())
    }, [center])
    return null
}

function TrackingMap({ order }) {
    const [deliveryLocation, setDeliveryLocation] = useState(null)
    const [connected, setConnected] = useState(false)
    const socketRef = useRef(null)

    const restaurantLat = 26.1197
    const restaurantLng = 85.3910
    const deliveryLat = order?.deliveryLocation?.lat || 26.1220
    const deliveryLng = order?.deliveryLocation?.lng || 85.3930

    useEffect(() => {
        if (!order?._id) return

        // Connect to socket
        socketRef.current = io(serverUrl)

        socketRef.current.on('connect', () => {
            setConnected(true)
            socketRef.current.emit('join_order', order._id)
            socketRef.current.emit('get_delivery_location', order._id)
        })

        socketRef.current.on('location_updated', (location) => {
            setDeliveryLocation(location)
        })

        socketRef.current.on('disconnect', () => {
            setConnected(false)
        })

        return () => {
            if (socketRef.current) socketRef.current.disconnect()
        }
    }, [order?._id])

    const currentDeliveryLat = deliveryLocation?.lat || restaurantLat
    const currentDeliveryLng = deliveryLocation?.lng || restaurantLng

    const center = [
        (restaurantLat + deliveryLat) / 2,
        (restaurantLng + deliveryLng) / 2
    ]

    return (
        <div>
            {/* Live status bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '10px'
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: connected ? '#10b981' : '#9ca3af',
                    animation: connected ? 'pulse 2s infinite' : 'none'
                }} />
                <span style={{
                    fontSize: '13px', fontWeight: '500',
                    color: connected ? '#10b981' : '#9ca3af',
                    fontFamily: 'DM Sans, sans-serif'
                }}>
                    {connected ? 'Live tracking active' : 'Connecting...'}
                </span>
                {deliveryLocation && (
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>
                        🛵 Delivery boy location updated
                    </span>
                )}
            </div>

            <div style={{
                borderRadius: '16px', overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)', height: '320px'
            }}>
                <MapContainer
                    center={center} zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    {deliveryLocation && (
                        <MapUpdater center={[deliveryLocation.lat, deliveryLocation.lng]} />
                    )}

                    {/* Restaurant */}
                    <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
                        <Popup>🍽️ {order?.restaurant?.name || 'Restaurant'}</Popup>
                    </Marker>

                    {/* Customer location */}
                    <Marker position={[deliveryLat, deliveryLng]} icon={userIcon}>
                        <Popup>🏠 Your delivery location</Popup>
                    </Marker>

                    {/* Delivery boy - only show when on the way */}
                    {order?.status === 'on_the_way' && (
                        <Marker
                            position={[currentDeliveryLat, currentDeliveryLng]}
                            icon={deliveryIcon}
                        >
                            <Popup>🛵 Your delivery partner is here!</Popup>
                        </Marker>
                    )}

                    {/* Route line */}
                    <Polyline
                        positions={[
                            [restaurantLat, restaurantLng],
                            [currentDeliveryLat, currentDeliveryLng],
                            [deliveryLat, deliveryLng]
                        ]}
                        color="#ff4d2d" weight={3}
                        dashArray="8" opacity={0.7}
                    />
                </MapContainer>
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex', gap: '16px', marginTop: '10px',
                flexWrap: 'wrap', fontFamily: 'DM Sans, sans-serif'
            }}>
                {[
                    { color: '#f59e0b', label: 'Restaurant' },
                    { color: '#ef4444', label: 'Your location' },
                    { color: '#10b981', label: 'Delivery partner' }
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: item.color
                        }} />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrackingMap