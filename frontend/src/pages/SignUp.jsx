import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import axios from "axios"
import { serverUrl } from '../App'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from "../../firebase"
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const roles = [
    { value: 'user', label: 'Customer', icon: '👤', desc: 'Order food' },
    { value: 'owner', label: 'Owner', icon: '🏪', desc: 'Manage restaurant' },
    { value: 'deliveryBoy', label: 'Delivery', icon: '🛵', desc: 'Deliver orders' }
]

function SignUp() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("user")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignUp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName, email, password, mobile, role
            }, { withCredentials: true })
            dispatch(setUserData(result.data))
            setErr("")
            setLoading(false)
            navigate("/")
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
        }
    }

    const handleGoogleAuth = async () => {
        if (!mobile) return setErr("Mobile number is required")
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                mobile, role
            }, { withCredentials: true })
            dispatch(setUserData(data))
            navigate("/")
        } catch (error) {
            setErr(error?.response?.data?.message || "Google sign up failed")
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '13px 16px',
        border: '1.5px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '15px',
        fontFamily: 'DM Sans, sans-serif',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        color: '#111',
        background: 'white'
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            fontFamily: 'DM Sans, sans-serif',
            background: '#f9fafb'
        }}>
            {/* Left Panel */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-80px', right: '-80px',
                    width: '350px', height: '350px',
                    background: 'radial-gradient(circle, rgba(255,77,45,0.2) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '-60px',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(255,179,71,0.15) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div className="animate-fadeInUp" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>🍔</div>
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '2.8rem',
                        fontWeight: '800',
                        color: 'white',
                        margin: '0 0 1rem',
                        lineHeight: 1.1
                    }}>
                        Join{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #ff4d2d, #ffb347)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>FoodZito</span>
                        <br />today!
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1rem',
                        maxWidth: '300px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.6
                    }}>
                        Get access to 500+ restaurants and fast delivery
                    </p>
                    {[
                        { icon: '🎉', text: 'Free delivery on first order' },
                        { icon: '🍕', text: '500+ restaurants available' },
                        { icon: '💳', text: 'Multiple payment options' }
                    ].map((f, i) => (
                        <div key={i} className={`animate-fadeInUp delay-${i + 2}`} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '12px 20px',
                            marginBottom: '10px',
                            textAlign: 'left'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>{f.icon}</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div style={{
                width: '520px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 2.5rem',
                background: 'white',
                overflowY: 'auto'
            }}>
                <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: '400px' }}>

                    {/* Logo */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px'
                            }}>🍕</div>
                            <span style={{
                                fontFamily: 'Syne, sans-serif',
                                fontWeight: '800',
                                fontSize: '24px',
                                background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>FoodZito</span>
                        </div>
                        <h2 style={{
                            fontFamily: 'Syne, sans-serif',
                            fontSize: '1.8rem',
                            fontWeight: '700',
                            color: '#0f0f0f',
                            margin: '0 0 6px'
                        }}>Create account</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                            Already have an account?{' '}
                            <span onClick={() => navigate('/signin')} style={{
                                color: '#ff4d2d', fontWeight: '600', cursor: 'pointer'
                            }}>Sign In</span>
                        </p>
                    </div>

                    {/* Role selector */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            I want to join as
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            {roles.map(r => (
                                <button key={r.value} onClick={() => setRole(r.value)} style={{
                                    padding: '12px 8px',
                                    borderRadius: '12px',
                                    border: role === r.value ? '2px solid #ff4d2d' : '1.5px solid #e5e7eb',
                                    background: role === r.value ? '#fff5f3' : 'white',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    fontFamily: 'DM Sans, sans-serif'
                                }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{r.icon}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: role === r.value ? '#ff4d2d' : '#374151' }}>{r.label}</div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Full Name */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                        <input type="text" placeholder="John Doe" value={fullName}
                            onChange={e => setFullName(e.target.value)} style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email</label>
                        <input type="email" placeholder="you@example.com" value={email}
                            onChange={e => setEmail(e.target.value)} style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Mobile */}
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Mobile</label>
                        <input type="text" placeholder="9876543210" value={mobile}
                            onChange={e => setMobile(e.target.value)} style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 characters" value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ ...inputStyle, paddingRight: '48px' }}
                                onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                            />
                            <button onClick={() => setShowPassword(p => !p)} style={{
                                position: 'absolute', right: '14px', top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none', border: 'none',
                                cursor: 'pointer', color: '#9ca3af', fontSize: '16px',
                                display: 'flex', alignItems: 'center'
                            }}>
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {err && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '10px', padding: '10px 14px',
                            marginBottom: '16px', color: '#dc2626', fontSize: '13px', fontWeight: '500'
                        }}>⚠️ {err}</div>
                    )}

                    {/* Sign Up Button */}
                    <button onClick={handleSignUp} disabled={loading} style={{
                        width: '100%', padding: '15px',
                        background: loading ? '#fca58e' : 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontSize: '16px', fontWeight: '700',
                        fontFamily: 'Syne, sans-serif',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginBottom: '16px',
                        boxShadow: '0 8px 24px rgba(255,77,45,0.3)',
                        transition: 'all 0.2s', letterSpacing: '0.3px'
                    }}
                        onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(255,77,45,0.4)' } }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(255,77,45,0.3)' }}
                    >
                        {loading ? '⏳ Creating account...' : 'Create Account →'}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>or</span>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    </div>

                    {/* Google */}
                    <button onClick={handleGoogleAuth} style={{
                        width: '100%', padding: '13px',
                        background: 'white', border: '1.5px solid #e5e7eb',
                        borderRadius: '12px', fontSize: '15px', fontWeight: '600',
                        fontFamily: 'DM Sans, sans-serif', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '10px', color: '#374151', transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white' }}
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignUp