import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearCart } from '../redux/userSlice'
import axios from 'axios'
import { serverUrl } from '../App'

function PaymentSimulator() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { orderData, total } = location.state || {}

    const [step, setStep] = useState('method') // method, details, processing, success, failed
    const [method, setMethod] = useState('upi')
    const [upiId, setUpiId] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [cardName, setCardName] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [err, setErr] = useState('')
    const [progress, setProgress] = useState(0)
    const [orderId, setOrderId] = useState(null)

    useEffect(() => {
        if (!orderData) navigate('/')
    }, [])

    const handleProceed = () => {
        if (method === 'upi' && !upiId.includes('@')) {
            return setErr('Please enter a valid UPI ID (e.g. name@upi)')
        }
        if (method === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 16) return setErr('Enter valid 16 digit card number')
            if (!cardName) return setErr('Enter cardholder name')
            if (!expiry) return setErr('Enter expiry date')
            if (cvv.length < 3) return setErr('Enter valid CVV')
        }
        setErr('')
        processPayment()
    }

    const processPayment = async () => {
        setStep('processing')
        let prog = 0
        const interval = setInterval(() => {
            prog += Math.random() * 15
            if (prog > 95) prog = 95
            setProgress(Math.round(prog))
        }, 200)

        try {
            // Place order in backend
            const { data } = await axios.post(`${serverUrl}/api/order/place`, {
                ...orderData,
                paymentMethod: method,
                paymentStatus: 'paid'
            }, { withCredentials: true })

            clearInterval(interval)
            setProgress(100)
            setOrderId(data._id)

            setTimeout(() => {
                dispatch(clearCart())
                setStep('success')
            }, 500)
        } catch (error) {
            clearInterval(interval)
            setStep('failed')
        }
    }

    const formatCard = (val) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = (matches && matches[0]) || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        return parts.length ? parts.join(' ') : val
    }

    const formatExpiry = (val) => {
        const v = val.replace(/\D/g, '')
        if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4)
        return v
    }

    const inputStyle = {
        width: '100%', padding: '13px 16px',
        border: '1.5px solid #e5e7eb', borderRadius: '12px',
        fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box',
        color: '#111', transition: 'all 0.2s', background: 'white'
    }

    // Processing Screen
    if (step === 'processing') return (
        <div style={{
            minHeight: '100vh', background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Sans, sans-serif'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px',
                padding: '3rem', width: '100%', maxWidth: '420px',
                textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem', animation: 'float 1s ease-in-out infinite' }}>
                    {method === 'upi' ? '📱' : method === 'card' ? '💳' : '💵'}
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: '700', color: '#0f0f0f', margin: '0 0 8px' }}>
                    Processing Payment
                </h2>
                <p style={{ color: '#6b7280', margin: '0 0 2rem', fontSize: '14px' }}>
                    Please wait while we process your ₹{total} payment...
                </p>

                {/* Progress bar */}
                <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '8px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', borderRadius: '999px',
                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                        width: `${progress}%`, transition: 'width 0.3s ease'
                    }} />
                </div>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>{progress}% complete</p>

                {/* Steps */}
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { label: 'Verifying payment details', done: progress > 20 },
                        { label: 'Connecting to bank', done: progress > 50 },
                        { label: 'Authorizing transaction', done: progress > 75 },
                        { label: 'Confirming order', done: progress >= 100 }
                    ].map((s, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', borderRadius: '10px',
                            background: s.done ? '#f0fdf4' : '#f9fafb',
                            transition: 'all 0.3s'
                        }}>
                            <span style={{ fontSize: '16px' }}>{s.done ? '✅' : '⏳'}</span>
                            <span style={{ fontSize: '13px', color: s.done ? '#15803d' : '#6b7280', fontWeight: s.done ? '600' : '400' }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    // Success Screen
    if (step === 'success') return (
        <div style={{
            minHeight: '100vh', background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Sans, sans-serif'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px',
                padding: '3rem', width: '100%', maxWidth: '420px',
                textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'bounceIn 0.6s ease' }}>🎉</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: '#0f0f0f', margin: '0 0 8px' }}>
                    Payment Successful!
                </h2>
                <p style={{ color: '#6b7280', margin: '0 0 2rem', fontSize: '15px' }}>
                    Your order has been placed successfully
                </p>

                {/* Receipt */}
                <div style={{
                    background: '#f9fafb', borderRadius: '16px',
                    padding: '1.25rem', marginBottom: '2rem',
                    border: '1px dashed #e5e7eb', textAlign: 'left'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Amount paid</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f0f0f' }}>₹{total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Payment method</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f0f0f' }}>
                            {method === 'upi' ? `UPI • ${upiId}` : method === 'card' ? `Card •••• ${cardNumber.slice(-4)}` : 'Cash on Delivery'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Order ID</span>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#374151' }}>
                            #{orderId?.slice(-8).toUpperCase()}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Status</span>
                        <span style={{
                            fontSize: '12px', background: '#dcfce7',
                            color: '#15803d', padding: '2px 10px',
                            borderRadius: '999px', fontWeight: '600'
                        }}>✓ Paid</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/order/${orderId}`)} style={{
                        flex: 1, padding: '14px',
                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: '700',
                        fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(255,77,45,0.3)'
                    }}>Track Order 📍</button>
                    <button onClick={() => navigate('/')} style={{
                        padding: '14px 20px', background: 'white',
                        color: '#374151', border: '1.5px solid #e5e7eb',
                        borderRadius: '12px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                    }}>Home</button>
                </div>
            </div>
        </div>
    )

    // Failed Screen
    if (step === 'failed') return (
        <div style={{
            minHeight: '100vh', background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Sans, sans-serif'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px',
                padding: '3rem', width: '100%', maxWidth: '420px',
                textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>❌</div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: '800', color: '#0f0f0f', margin: '0 0 8px' }}>
                    Payment Failed
                </h2>
                <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>
                    Something went wrong. Please try again.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setStep('method')} style={{
                        flex: 1, padding: '14px',
                        background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontSize: '15px', fontWeight: '700',
                        fontFamily: 'Syne, sans-serif', cursor: 'pointer'
                    }}>Try Again</button>
                    <button onClick={() => navigate(-1)} style={{
                        padding: '14px 20px', background: 'white',
                        color: '#374151', border: '1.5px solid #e5e7eb',
                        borderRadius: '12px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                    }}>Back</button>
                </div>
            </div>
        </div>
    )

    // Payment Method Selection + Details
    return (
        <div style={{
            minHeight: '100vh', background: '#f9fafb',
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem'
        }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>

                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <button onClick={() => navigate(-1)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px',
                        fontFamily: 'DM Sans, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '12px', padding: 0
                    }}>← Back</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            borderRadius: '10px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                        }}>🍕</div>
                        <span style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '20px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>FoodZito Pay</span>
                    </div>
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', fontWeight: '800', color: '#0f0f0f', margin: 0 }}>
                        Complete Payment
                    </h1>
                </div>

                {/* Amount Card */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                    borderRadius: '20px', padding: '1.5rem',
                    marginBottom: '1.5rem', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: '-30px', right: '-30px',
                        width: '120px', height: '120px',
                        background: 'radial-gradient(circle, rgba(255,77,45,0.3) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }} />
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 4px' }}>
                        Total Amount
                    </p>
                    <p style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '2.5rem',
                        fontWeight: '800', color: 'white', margin: '0 0 12px'
                    }}>₹{total}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{
                            background: 'rgba(16,185,129,0.2)', color: '#10b981',
                            padding: '4px 12px', borderRadius: '999px',
                            fontSize: '12px', fontWeight: '600'
                        }}>🔒 Secure Payment</span>
                        <span style={{
                            background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                            padding: '4px 12px', borderRadius: '999px', fontSize: '12px'
                        }}>FREE Delivery</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={{
                    background: 'white', borderRadius: '20px',
                    padding: '1.5rem', marginBottom: '16px',
                    border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: '700', color: '#0f0f0f', margin: '0 0 14px' }}>
                        Choose Payment Method
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {[
                            { value: 'upi', label: 'UPI Payment', icon: '📱', desc: 'GPay, PhonePe, Paytm, BHIM' },
                            { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
                            { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when order arrives' }
                        ].map(m => (
                            <div key={m.value} onClick={() => setMethod(m.value)} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '14px 16px', borderRadius: '14px',
                                border: method === m.value ? '2px solid #ff4d2d' : '1.5px solid #e5e7eb',
                                background: method === m.value ? '#fff5f3' : 'white',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <span style={{ fontSize: '1.8rem' }}>{m.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111' }}>{m.label}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{m.desc}</p>
                                </div>
                                <div style={{
                                    width: '20px', height: '20px', borderRadius: '50%',
                                    border: method === m.value ? 'none' : '2px solid #d1d5db',
                                    background: method === m.value ? 'linear-gradient(135deg, #ff4d2d, #ff7043)' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {method === m.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* UPI Input */}
                    {method === 'upi' && (
                        <div className="animate-scaleIn" style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                UPI ID
                            </label>
                            <input type="text" placeholder="yourname@upi"
                                value={upiId} onChange={e => setUpiId(e.target.value)}
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                {['gpay@okaxis', 'phonepe@ybl', 'paytm@paytm'].map(id => (
                                    <button key={id} onClick={() => setUpiId(id)} style={{
                                        padding: '6px 12px', background: '#f9fafb',
                                        border: '1px solid #e5e7eb', borderRadius: '8px',
                                        fontSize: '11px', cursor: 'pointer',
                                        color: '#374151', fontFamily: 'DM Sans, sans-serif'
                                    }}>{id}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Card Input */}
                    {method === 'card' && (
                        <div className="animate-scaleIn" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Card Number
                                </label>
                                <input type="text" placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={e => setCardNumber(formatCard(e.target.value))}
                                    maxLength={19}
                                    style={{ ...inputStyle, letterSpacing: '2px' }}
                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Cardholder Name
                                </label>
                                <input type="text" placeholder="Name on card"
                                    value={cardName} onChange={e => setCardName(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        Expiry Date
                                    </label>
                                    <input type="text" placeholder="MM/YY"
                                        value={expiry}
                                        onChange={e => setExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                        CVV
                                    </label>
                                    <input type="password" placeholder="•••"
                                        value={cvv} onChange={e => setCvv(e.target.value)}
                                        maxLength={3}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                    />
                                </div>
                            </div>
                            {/* Test card hint */}
                            <div style={{
                                background: '#f0f9ff', border: '1px solid #bae6fd',
                                borderRadius: '10px', padding: '10px 14px',
                                fontSize: '12px', color: '#0369a1'
                            }}>
                                💡 Test card: <strong>4111 1111 1111 1111</strong> | Expiry: 12/25 | CVV: 123
                            </div>
                        </div>
                    )}

                    {method === 'cod' && (
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '12px', padding: '14px 16px',
                            marginBottom: '8px', fontSize: '13px', color: '#15803d'
                        }}>
                            ✅ Pay ₹{total} in cash when your order is delivered
                        </div>
                    )}

                    {err && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '10px', padding: '10px 14px',
                            marginBottom: '8px', color: '#dc2626', fontSize: '13px'
                        }}>⚠️ {err}</div>
                    )}
                </div>

                {/* Pay Button */}
                <button onClick={method === 'cod' ? processPayment : handleProceed} style={{
                    width: '100%', padding: '16px',
                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                    color: 'white', border: 'none', borderRadius: '14px',
                    fontSize: '17px', fontWeight: '800',
                    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(255,77,45,0.35)',
                    transition: 'all 0.2s', letterSpacing: '0.3px'
                }}
                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(255,77,45,0.45)' }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(255,77,45,0.35)' }}
                >
                    {method === 'cod' ? '📦 Place Order' : `🔒 Pay ₹${total}`}
                </button>

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: '12px 0 0' }}>
                    🔒 256-bit SSL encrypted • Safe & secure
                </p>
            </div>
        </div>
    )
}

export default PaymentSimulator