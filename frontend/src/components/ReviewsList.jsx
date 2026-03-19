import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

function StarDisplay({ value, size = 14 }) {
    return (
        <span style={{ display: 'inline-flex', gap: '1px' }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{
                    fontSize: `${size}px`,
                    color: s <= value ? '#f59e0b' : '#e5e7eb'
                }}>★</span>
            ))}
        </span>
    )
}

function ReviewsList({ restaurantId }) {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReviews()
    }, [restaurantId])

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/review/restaurant/${restaurantId}`)
            setReviews(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0

    if (loading) return (
        <div style={{ padding: '1rem' }}>
            <div className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
        </div>
    )

    return (
        <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {/* Rating Summary */}
            {reviews.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #fff5f3, white)',
                    borderRadius: '16px', padding: '1.25rem',
                    marginBottom: '1.5rem', border: '1px solid #ffe8e3',
                    display: 'flex', alignItems: 'center', gap: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontFamily: 'Syne, sans-serif', fontSize: '3rem',
                            fontWeight: '800', color: '#0f0f0f', margin: 0, lineHeight: 1
                        }}>{avgRating}</p>
                        <StarDisplay value={Math.round(avgRating)} size={18} />
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div style={{ flex: 1 }}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = reviews.filter(r => r.rating === star).length
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '12px' }}>{star}</span>
                                    <span style={{ fontSize: '12px', color: '#f59e0b' }}>★</span>
                                    <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${pct}%`, height: '100%',
                                            background: star >= 4 ? '#f59e0b' : star === 3 ? '#fb923c' : '#ef4444',
                                            borderRadius: '999px', transition: 'width 0.5s'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#9ca3af', minWidth: '20px' }}>{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '2rem',
                    background: '#f9fafb', borderRadius: '14px'
                }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>⭐</p>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                        No reviews yet. Be the first to review!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviews.map((review, i) => (
                        <div key={review._id} className={`animate-fadeInUp delay-${Math.min(i + 1, 5)}`} style={{
                            background: 'white', borderRadius: '16px',
                            padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: '700', fontSize: '15px',
                                        fontFamily: 'Syne, sans-serif'
                                    }}>
                                        {review.user?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111' }}>
                                            {review.user?.fullName}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <StarDisplay value={review.rating} size={16} />
                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
                                        {review.rating === 5 ? 'Excellent' : review.rating === 4 ? 'Very Good' : review.rating === 3 ? 'Good' : review.rating === 2 ? 'Fair' : 'Poor'}
                                    </p>
                                </div>
                            </div>

                            {review.comment && (
                                <p style={{
                                    margin: '0 0 10px', fontSize: '14px',
                                    color: '#374151', lineHeight: 1.6,
                                    background: '#f9fafb', borderRadius: '10px',
                                    padding: '10px 14px'
                                }}>
                                    "{review.comment}"
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <span style={{
                                    fontSize: '12px', color: '#6b7280',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    🍕 Food: <StarDisplay value={review.foodRating} size={12} />
                                </span>
                                <span style={{
                                    fontSize: '12px', color: '#6b7280',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    🛵 Delivery: <StarDisplay value={review.deliveryRating} size={12} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ReviewsList