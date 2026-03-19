import React, { useState } from 'react'
import { useNavigate } from "react-router-dom"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import axios from "axios"
import { serverUrl } from '../App'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function SignIn() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignIn = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
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
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                mobile: "",
                role: "user"
            }, { withCredentials: true })
            dispatch(setUserData(data))
            navigate("/")
        } catch (error) {
            setErr(error?.response?.data?.message || "Google sign in failed")
        }
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
            }} className="hide-mobile">
                {/* Decorative blobs */}
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
                    <div style={{
                        fontSize: '5rem',
                        marginBottom: '1.5rem',
                        animation: 'float 3s ease-in-out infinite'
                    }}>🍕</div>
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '2.8rem',
                        fontWeight: '800',
                        color: 'white',
                        margin: '0 0 1rem',
                        lineHeight: 1.1
                    }}>
                        Welcome back to{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #ff4d2d, #ffb347)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>FoodZito</span>
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '1rem',
                        maxWidth: '300px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.6
                    }}>
                        Your favourite food is just a few clicks away
                    </p>

                    {/* Feature pills */}
                    {[
                        { icon: '⚡', text: 'Fast delivery in 30 mins' },
                        { icon: '🔒', text: 'Secure payments' },
                        { icon: '📍', text: 'Live order tracking' }
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

            {/* Right Panel - Form */}
            <div style={{
                width: '480px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2.5rem',
                background: 'white',
                overflowY: 'auto'
            }}>
                <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: '380px' }}>

                    {/* Logo */}
                    <div style={{ marginBottom: '2.5rem' }}>
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
                        }}>Sign In</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                            Don't have an account?{' '}
                            <span onClick={() => navigate('/signup')} style={{
                                color: '#ff4d2d', fontWeight: '600', cursor: 'pointer'
                            }}>Sign Up</span>
                        </p>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Email address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '13px 16px',
                                border: '1.5px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontFamily: 'DM Sans, sans-serif',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                color: '#111'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '6px'
                        }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '13px 48px 13px 16px',
                                    border: '1.5px solid #e5e7eb',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontFamily: 'DM Sans, sans-serif',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box',
                                    color: '#111'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                            />
                            <button
                                onClick={() => setShowPassword(p => !p)}
                                style={{
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

                    {/* Forgot Password */}
                    <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                        <span onClick={() => navigate('/forgot-password')} style={{
                            fontSize: '13px',
                            color: '#ff4d2d',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>Forgot password?</span>
                    </div>

                    {/* Error */}
                    {err && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            marginBottom: '16px',
                            color: '#dc2626',
                            fontSize: '13px',
                            fontWeight: '500'
                        }}>⚠️ {err}</div>
                    )}

                    {/* Sign In Button */}
                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: loading ? '#fca58e' : 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '700',
                            fontFamily: 'Syne, sans-serif',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '16px',
                            boxShadow: '0 8px 24px rgba(255,77,45,0.3)',
                            transition: 'all 0.2s',
                            letterSpacing: '0.3px'
                        }}
                        onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 32px rgba(255,77,45,0.4)' } }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 24px rgba(255,77,45,0.3)' }}
                    >
                        {loading ? '⏳ Signing in...' : 'Sign In →'}
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>or continue with</span>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    </div>

                    {/* Google */}
                    <button
                        onClick={handleGoogleAuth}
                        style={{
                            width: '100%',
                            padding: '13px',
                            background: 'white',
                            border: '1.5px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            fontFamily: 'DM Sans, sans-serif',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            color: '#374151',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SignIn