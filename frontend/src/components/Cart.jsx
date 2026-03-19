import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart, clearCart } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

function Cart({ onClose }) {
    const { cartItems } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <>
            <div onClick={onClose} className="animate-fadeIn" style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 200
            }} />

            <div className="animate-slideInRight" style={{
                position: 'fixed',
                right: 0, top: 0, bottom: 0,
                width: '400px',
                background: 'white',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '20px 0 0 20px',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
                fontFamily: 'DM Sans, sans-serif'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #fff5f3, white)'
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontFamily: 'Syne, sans-serif',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#0f0f0f'
                        }}>Your Cart 🛒</h2>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#6b7280' }}>
                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        width: '36px', height: '36px',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.target.style.background = '#f3f4f6' }}
                        onMouseLeave={e => { e.target.style.background = 'white' }}
                    >✕</button>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
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
                                fontFamily: 'DM Sans, sans-serif'
                            }}>Browse Restaurants</button>
                        </div>
                    ) : (
                        <>
                            {cartItems.map((item, i) => (
                                <div key={item._id} className="animate-fadeInUp" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px',
                                    marginBottom: '10px',
                                    background: '#f9fafb',
                                    borderRadius: '14px',
                                    border: '1px solid #f3f4f6',
                                    animationDelay: `${i * 0.05}s`
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px', color: '#111' }}>{item.name}</p>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#ff4d2d', fontWeight: '700' }}>₹{item.price}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button onClick={() => dispatch(removeFromCart(item))} style={{
                                            width: '30px', height: '30px',
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
                                        }}>−</button>
                                        <span style={{ fontWeight: '700', fontSize: '15px', minWidth: '20px', textAlign: 'center' }}>
                                            {item.quantity}
                                        </span>
                                        <button onClick={() => dispatch(addToCart(item))} style={{
                                            width: '30px', height: '30px',
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
                                        }}>+</button>
                                    </div>
                                </div>
                            ))}

                            <button onClick={() => dispatch(clearCart())} style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: '4px 0',
                                fontFamily: 'DM Sans, sans-serif',
                                fontWeight: '500'
                            }}>🗑 Clear cart</button>
                        </>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div style={{
                        padding: '1.5rem',
                        borderTop: '1px solid #f3f4f6',
                        background: 'linear-gradient(135deg, #fff5f3, white)'
                    }}>
                        <div style={{
                            background: '#f9fafb',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            marginBottom: '16px'
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
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '700', color: '#111', fontFamily: 'Syne, sans-serif' }}>Total</span>
                                <span style={{ fontWeight: '800', fontSize: '20px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif' }}>₹{total}</span>
                            </div>
                        </div>

                        <button onClick={() => { navigate('/checkout'); onClose() }} style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontFamily: 'Syne, sans-serif',
                            boxShadow: '0 8px 24px rgba(255,77,45,0.35)',
                            transition: 'all 0.2s',
                            letterSpacing: '0.3px'
                        }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(255,77,45,0.45)' }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(255,77,45,0.35)' }}
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