import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart, clearCart } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

function Cart({ onClose }) {
    const { cartItems } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    /* Responsive: full-width on mobile, 400px on larger screens */
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 480)
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 480)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    /* Prevent body scroll while cart is open */
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const drawerWidth = isMobile ? '100vw' : '400px'
    const drawerRadius = isMobile ? '20px 20px 0 0' : '20px 0 0 20px'
    const drawerTop = isMobile ? 'auto' : '0'
    const drawerBottom = '0'
    const drawerRight = isMobile ? '0' : '0'
    const drawerLeft = isMobile ? '0' : 'auto'
    const drawerMaxHeight = isMobile ? '92vh' : '100vh'

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="animate-fadeIn"
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 200
                }}
            />

            {/* Drawer */}
            <div
                className="animate-slideInRight"
                style={{
                    position: 'fixed',
                    right: drawerRight,
                    left: drawerLeft,
                    top: drawerTop,
                    bottom: drawerBottom,
                    width: drawerWidth,
                    maxHeight: drawerMaxHeight,
                    background: 'white',
                    zIndex: 201,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: drawerRadius,
                    boxShadow: isMobile
                        ? '0 -8px 40px rgba(0,0,0,0.18)'
                        : '-8px 0 40px rgba(0,0,0,0.15)',
                    fontFamily: 'DM Sans, sans-serif',
                    overflow: 'hidden'
                }}
            >
                {/* Mobile drag handle */}
                {isMobile && (
                    <div style={{
                        display: 'flex', justifyContent: 'center',
                        padding: '10px 0 2px'
                    }}>
                        <div style={{
                            width: '40px', height: '4px',
                            borderRadius: '999px',
                            background: '#e5e7eb'
                        }} />
                    </div>
                )}

                {/* Header */}
                <div style={{
                    padding: isMobile ? '12px 1.25rem 14px' : '1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #fff5f3, white)',
                    flexShrink: 0
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontFamily: 'Syne, sans-serif',
                            fontSize: isMobile ? '18px' : '20px',
                            fontWeight: '700',
                            color: '#0f0f0f'
                        }}>Your Cart 🛒</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '36px', height: '36px',
                            borderRadius: '10px',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                    >✕</button>
                </div>

                {/* Items — scrollable */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
                    WebkitOverflowScrolling: 'touch'
                }}>
                    {cartItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>🛒</div>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', color: '#111', marginBottom: '8px' }}>Cart is empty</h3>
                            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Add items from a restaurant to get started</p>
                            <button onClick={onClose} style={{
                                marginTop: '20px',
                                padding: '10px 24px',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '14px'
                            }}>Browse Restaurants</button>
                        </div>
                    ) : (
                        <>
                            {cartItems.map((item, i) => (
                                <div
                                    key={item._id}
                                    className="animate-fadeInUp"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: isMobile ? '10px 12px' : '14px',
                                        marginBottom: '10px',
                                        background: '#f9fafb',
                                        borderRadius: '14px',
                                        border: '1px solid #f3f4f6',
                                        animationDelay: `${i * 0.05}s`,
                                        gap: '10px'
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: '0 0 4px',
                                            fontWeight: '600',
                                            fontSize: isMobile ? '13px' : '14px',
                                            color: '#111',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>{item.name}</p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '14px',
                                            color: '#ff4d2d',
                                            fontWeight: '700'
                                        }}>₹{item.price}</p>
                                    </div>

                                    {/* Qty controls */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: isMobile ? '8px' : '12px',
                                        flexShrink: 0
                                    }}>
                                        <button
                                            onClick={() => dispatch(removeFromCart(item))}
                                            style={{
                                                width: isMobile ? '28px' : '30px',
                                                height: isMobile ? '28px' : '30px',
                                                borderRadius: '8px',
                                                border: '1.5px solid #ff4d2d',
                                                background: 'white',
                                                color: '#ff4d2d',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1,
                                                fontWeight: '600',
                                                transition: 'all 0.15s'
                                            }}
                                        >−</button>
                                        <span style={{
                                            fontWeight: '700',
                                            fontSize: '15px',
                                            minWidth: '20px',
                                            textAlign: 'center'
                                        }}>{item.quantity}</span>
                                        <button
                                            onClick={() => dispatch(addToCart(item))}
                                            style={{
                                                width: isMobile ? '28px' : '30px',
                                                height: isMobile ? '28px' : '30px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1,
                                                fontWeight: '600',
                                                transition: 'all 0.15s',
                                                boxShadow: '0 2px 8px rgba(255,77,45,0.3)'
                                            }}
                                        >+</button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => dispatch(clearCart())}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontWeight: '500'
                                }}
                            >🗑 Clear cart</button>
                        </>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div style={{
                        padding: isMobile ? '1rem 1.25rem' : '1.5rem',
                        borderTop: '1px solid #f3f4f6',
                        background: 'linear-gradient(135deg, #fff5f3, white)',
                        flexShrink: 0
                    }}>
                        {/* Bill summary */}
                        <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '14px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>Subtotal</span>
                                <span style={{ fontSize: '13px', color: '#374151' }}>₹{total}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>Delivery fee</span>
                                <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>FREE</span>
                            </div>
                            <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', color: '#111', fontFamily: 'Syne, sans-serif' }}>Total</span>
                                <span style={{ fontWeight: '800', fontSize: isMobile ? '18px' : '20px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif' }}>₹{total}</span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <button
                            onClick={() => { navigate('/checkout'); onClose() }}
                            style={{
                                width: '100%',
                                padding: isMobile ? '14px' : '16px',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: isMobile ? '15px' : '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                fontFamily: 'Syne, sans-serif',
                                boxShadow: '0 8px 24px rgba(255,77,45,0.35)',
                                transition: 'all 0.2s',
                                letterSpacing: '0.3px'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,77,45,0.45)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,77,45,0.35)' }}
                        >
                            Checkout → ₹{total}
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Cart