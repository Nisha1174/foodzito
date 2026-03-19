import React, { useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

function StarRating({ value, onChange, size = 28 }) {
    const [hover, setHover] = useState(0)
    return (
        <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    style={{
                        fontSize: `${size}px`, cursor: 'pointer',
                        color: star <= (hover || value) ? '#f59e0b' : '#e5e7eb',
                        transition: 'all 0.15s', transform: star <= (hover || value) ? 'scale(1.1)' : 'scale(1)'
                    }}>★</span>
            ))}
        </div>
    )
}

function ReviewModal({ order, onClose, onSuccess }) {
    const [rating, setRating] = useState(0)
    const [foodRating, setFoodRating] = useState(0)
    const [deliveryRating, setDeliveryRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    const quickComments = [
        "Amazing food! 🔥", "Delivered on time ⚡",
        "Great packaging 📦", "Will order again! 😍",
        "Good value for money 💰", "Hot and fresh food 🍕"
    ]

    const handleSubmit = async () => {
        if (!rating) return setErr("Please give an overall rating")
        if (!foodRating) return setErr("Please rate the food")
        if (!deliveryRating) return setErr("Please rate the delivery")
        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/review/add`, {
                restaurantId: order.restaurant?._id || order.restaurant,
                orderId: order._id,
                rating, comment, foodRating, deliveryRating
            }, { withCredentials: true })
            onSuccess()
            onClose()
        } catch (error) {
            setErr(error?.response?.data?.message || "Failed to submit review")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Overlay */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)', zIndex: 300
            }} />

            {/* Modal */}
            <div className="animate-scaleIn" style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white', borderRadius: '24px',
                padding: '2rem', width: '100%', maxWidth: '480px',
                zIndex: 301, maxHeight: '90vh', overflowY: 'auto',
                fontFamily: 'DM Sans, sans-serif',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: '800', color: '#0f0f0f', margin: 0 }}>
                            Rate your order 🌟
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            {order.restaurant?.name}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        border: '1px solid #e5e7eb', background: 'white',
                        cursor: 'pointer', fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>✕</button>
                </div>

                {/* Overall Rating */}
                <div style={{
                    background: 'linear-gradient(135deg, #fff5f3, white)',
                    borderRadius: '16px', padding: '1.25rem',
                    marginBottom: '1rem', textAlign: 'center',
                    border: '1px solid #ffe8e3'
                }}>
                    <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#374151', fontSize: '15px' }}>
                        Overall Experience
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <StarRating value={rating} onChange={setRating} size={36} />
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                        {rating === 0 ? 'Tap to rate' :
                            rating === 1 ? '😞 Poor' :
                                rating === 2 ? '😐 Fair' :
                                    rating === 3 ? '🙂 Good' :
                                        rating === 4 ? '😊 Very Good' : '🤩 Excellent!'}
                    </p>
                </div>

                {/* Sub Ratings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{
                        background: '#f9fafb', borderRadius: '14px',
                        padding: '1rem', border: '1px solid #f3f4f6'
                    }}>
                        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                            🍕 Food Quality
                        </p>
                        <StarRating value={foodRating} onChange={setFoodRating} size={22} />
                    </div>
                    <div style={{
                        background: '#f9fafb', borderRadius: '14px',
                        padding: '1rem', border: '1px solid #f3f4f6'
                    }}>
                        <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                            🛵 Delivery
                        </p>
                        <StarRating value={deliveryRating} onChange={setDeliveryRating} size={22} />
                    </div>
                </div>

                {/* Quick Comments */}
                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                        Quick tags
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {quickComments.map(qc => (
                            <button key={qc} onClick={() => setComment(prev =>
                                prev.includes(qc) ? prev.replace(qc, '').trim() : (prev + ' ' + qc).trim()
                            )} style={{
                                padding: '6px 12px',
                                background: comment.includes(qc) ? '#fff5f3' : '#f9fafb',
                                border: comment.includes(qc) ? '1.5px solid #ff4d2d' : '1px solid #e5e7eb',
                                borderRadius: '999px', fontSize: '12px',
                                color: comment.includes(qc) ? '#ff4d2d' : '#374151',
                                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                fontWeight: comment.includes(qc) ? '600' : '400',
                                transition: 'all 0.2s'
                            }}>{qc}</button>
                        ))}
                    </div>
                </div>

                {/* Comment Box */}
                <div style={{ marginBottom: '1rem' }}>
                    <textarea
                        placeholder="Tell us about your experience (optional)..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: '1.5px solid #e5e7eb', borderRadius: '12px',
                            fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                            outline: 'none', resize: 'none',
                            boxSizing: 'border-box', color: '#111',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                    />
                </div>

                {err && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '10px', padding: '10px 14px',
                        marginBottom: '12px', color: '#dc2626', fontSize: '13px'
                    }}>⚠️ {err}</div>
                )}

                <button onClick={handleSubmit} disabled={loading} style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                    color: 'white', border: 'none', borderRadius: '12px',
                    fontSize: '16px', fontWeight: '700',
                    fontFamily: 'Syne, sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                }}>
                    {loading ? '⏳ Submitting...' : '🌟 Submit Review'}
                </button>
            </div>
        </>
    )
}

export default ReviewModal