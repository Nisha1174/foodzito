import axios from 'axios'
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'

function ForgotPassword() {
    const [step, setStep] = useState(1)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSendOtp = async () => {
        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true })
            setErr("")
            setLoading(false)
            setStep(2)
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
            setErr("")
            setLoading(false)
            setStep(3)
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) return setErr("Passwords do not match")
        setLoading(true)
        try {
            await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true })
            setErr("")
            setLoading(false)
            navigate("/signin")
        } catch (error) {
            setErr(error?.response?.data?.message)
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%', padding: '13px 16px',
        border: '1.5px solid #e5e7eb', borderRadius: '12px',
        fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box', color: '#111',
        transition: 'all 0.2s', background: 'white'
    }

    const steps = [
        { num: 1, label: 'Email' },
        { num: 2, label: 'OTP' },
        { num: 3, label: 'Reset' }
    ]

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            fontFamily: 'DM Sans, sans-serif', background: '#f9fafb'
        }}>
            {/* Left Panel */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '3rem', position: 'relative', overflow: 'hidden'
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
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>🔐</div>
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '2.8rem',
                        fontWeight: '800', color: 'white', margin: '0 0 1rem', lineHeight: 1.1
                    }}>
                        Reset your{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #ff4d2d, #ffb347)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>password</span>
                    </h1>
                    <p style={{
                        color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
                        maxWidth: '300px', margin: '0 auto 2.5rem', lineHeight: 1.6
                    }}>
                        Follow the 3 simple steps to reset your password securely
                    </p>
                    {[
                        { icon: '📧', text: 'Enter your registered email' },
                        { icon: '🔢', text: 'Verify OTP sent to email' },
                        { icon: '🔒', text: 'Set your new password' }
                    ].map((f, i) => (
                        <div key={i} className={`animate-fadeInUp delay-${i + 2}`} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: step > i ? 'rgba(255,77,45,0.15)' : 'rgba(255,255,255,0.06)',
                            border: step > i ? '1px solid rgba(255,77,45,0.3)' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', padding: '12px 20px',
                            marginBottom: '10px', textAlign: 'left',
                            transition: 'all 0.3s'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>{step > i ? '✅' : f.icon}</span>
                            <span style={{
                                color: step > i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                                fontSize: '14px', fontWeight: '500'
                            }}>{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div style={{
                width: '480px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '3rem 2.5rem', background: 'white', overflowY: 'auto'
            }}>
                <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: '380px' }}>

                    {/* Back button */}
                    <button onClick={() => navigate('/signin')} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px',
                        fontFamily: 'DM Sans, sans-serif', marginBottom: '2rem', padding: 0
                    }}>
                        <IoIosArrowRoundBack size={22} />
                        Back to Sign In
                    </button>

                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            borderRadius: '12px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                        }}>🍕</div>
                        <span style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '24px',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>FoodZito</span>
                    </div>

                    <h2 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '1.8rem',
                        fontWeight: '700', color: '#0f0f0f', margin: '0 0 6px'
                    }}>Forgot Password</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 2rem' }}>
                        Step {step} of 3 — {step === 1 ? 'Enter your email' : step === 2 ? 'Enter OTP' : 'Set new password'}
                    </p>

                    {/* Step Progress */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                        {steps.map(s => (
                            <div key={s.num} style={{ flex: 1 }}>
                                <div style={{
                                    height: '4px', borderRadius: '999px',
                                    background: step >= s.num
                                        ? 'linear-gradient(135deg, #ff4d2d, #ff7043)'
                                        : '#e5e7eb',
                                    transition: 'all 0.4s'
                                }} />
                                <p style={{
                                    margin: '4px 0 0', fontSize: '11px',
                                    color: step >= s.num ? '#ff4d2d' : '#9ca3af',
                                    fontWeight: step >= s.num ? '600' : '400',
                                    transition: 'all 0.3s'
                                }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Step 1 - Email */}
                    {step === 1 && (
                        <div className="animate-scaleIn">
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                Email address
                            </label>
                            <input type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                                style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                            />
                            {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', margin: '14px 0', color: '#dc2626', fontSize: '13px' }}>⚠️ {err}</div>}
                            <button onClick={handleSendOtp} disabled={loading} style={{
                                width: '100%', padding: '15px', marginTop: '20px',
                                background: loading ? '#fca58e' : 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '16px', fontWeight: '700', fontFamily: 'Syne, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                            }}>
                                {loading ? '⏳ Sending OTP...' : 'Send OTP →'}
                            </button>
                        </div>
                    )}

                    {/* Step 2 - OTP */}
                    {step === 2 && (
                        <div className="animate-scaleIn">
                            <div style={{
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                borderRadius: '12px', padding: '12px 16px', marginBottom: '20px',
                                fontSize: '13px', color: '#15803d', fontWeight: '500'
                            }}>
                                ✅ OTP sent to <strong>{email}</strong>
                            </div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                Enter 4-digit OTP
                            </label>
                            <input type="text" placeholder="• • • •"
                                value={otp} onChange={e => setOtp(e.target.value)}
                                maxLength={4} style={{ ...inputStyle, fontSize: '24px', letterSpacing: '12px', textAlign: 'center' }}
                                onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                            />
                            {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', margin: '14px 0', color: '#dc2626', fontSize: '13px' }}>⚠️ {err}</div>}
                            <button onClick={handleVerifyOtp} disabled={loading} style={{
                                width: '100%', padding: '15px', marginTop: '20px',
                                background: loading ? '#fca58e' : 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '16px', fontWeight: '700', fontFamily: 'Syne, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                            }}>
                                {loading ? '⏳ Verifying...' : 'Verify OTP →'}
                            </button>
                            <button onClick={() => setStep(1)} style={{
                                width: '100%', padding: '12px', marginTop: '10px',
                                background: 'none', border: 'none', color: '#6b7280',
                                fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                            }}>← Change email</button>
                        </div>
                    )}

                    {/* Step 3 - New Password */}
                    {step === 3 && (
                        <div className="animate-scaleIn">
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    New Password
                                </label>
                                <input type="password" placeholder="Min. 6 characters"
                                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Confirm Password
                                </label>
                                <input type="password" placeholder="Repeat your password"
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    style={{
                                        ...inputStyle,
                                        borderColor: confirmPassword && newPassword !== confirmPassword ? '#fca5a5' : '#e5e7eb'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                    onBlur={e => {
                                        e.target.style.boxShadow = 'none'
                                        e.target.style.borderColor = confirmPassword && newPassword !== confirmPassword ? '#fca5a5' : '#e5e7eb'
                                    }}
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#dc2626' }}>
                                        ⚠️ Passwords don't match
                                    </p>
                                )}
                            </div>
                            {err && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', margin: '14px 0', color: '#dc2626', fontSize: '13px' }}>⚠️ {err}</div>}
                            <button onClick={handleResetPassword} disabled={loading} style={{
                                width: '100%', padding: '15px', marginTop: '16px',
                                background: loading ? '#fca58e' : 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '16px', fontWeight: '700', fontFamily: 'Syne, sans-serif',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 24px rgba(255,77,45,0.3)', transition: 'all 0.2s'
                            }}>
                                {loading ? '⏳ Resetting...' : '🔒 Reset Password →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword