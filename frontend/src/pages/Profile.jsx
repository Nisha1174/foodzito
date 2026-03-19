import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import Navbar from '../components/Navbar'

function Profile() {
    const { userData } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [editing, setEditing] = useState(false)
    const [fullName, setFullName] = useState(userData?.fullName || '')
    const [mobile, setMobile] = useState(userData?.mobile || '')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [err, setErr] = useState('')

    const handleSave = async () => {
        setLoading(true)
        try {
            const { data } = await axios.put(`${serverUrl}/api/user/update`,
                { fullName, mobile }, { withCredentials: true })
            dispatch(setUserData(data))
            setEditing(false)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            setErr(error?.response?.data?.message || 'Update failed')
        } finally {
            setLoading(false)
        }
    }

    const roleConfig = {
        user: { label: 'Customer', icon: '👤', color: '#ff4d2d', bg: '#fff5f3' },
        owner: { label: 'Restaurant Owner', icon: '🏪', color: '#0369a1', bg: '#e0f2fe' },
        deliveryBoy: { label: 'Delivery Partner', icon: '🛵', color: '#6d28d9', bg: '#ede9fe' }
    }
    const role = roleConfig[userData?.role] || roleConfig.user

    const inputStyle = {
        width: '100%', padding: '13px 16px',
        border: '1.5px solid #e5e7eb', borderRadius: '12px',
        fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
        outline: 'none', boxSizing: 'border-box', color: '#111',
        transition: 'all 0.2s', background: 'white'
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'DM Sans, sans-serif' }}>
            <Navbar onCartClick={() => {}} />

            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Header */}
                <div className="animate-fadeInUp" style={{ marginBottom: '2rem' }}>
                    <button onClick={() => navigate('/')} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '12px', padding: 0
                    }}>← Back to Home</button>
                    <h1 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '2rem',
                        fontWeight: '800', color: '#0f0f0f', margin: 0
                    }}>My Profile 👤</h1>
                </div>

                {/* Profile Card */}
                <div className="animate-fadeInUp delay-1" style={{
                    background: 'white', borderRadius: '24px',
                    overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)',
                    marginBottom: '20px'
                }}>
                    {/* Banner */}
                    <div style={{
                        height: '120px',
                        background: 'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-40px', right: '-40px',
                            width: '200px', height: '200px',
                            background: 'radial-gradient(circle, rgba(255,77,45,0.3) 0%, transparent 70%)',
                            borderRadius: '50%'
                        }} />
                    </div>

                    <div style={{ padding: '0 2rem 2rem' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '80px', height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Syne, sans-serif', fontWeight: '800',
                            fontSize: '32px', color: 'white',
                            marginTop: '-40px', marginBottom: '16px',
                            border: '4px solid white',
                            boxShadow: '0 4px 20px rgba(255,77,45,0.3)'
                        }}>
                            {userData?.fullName?.charAt(0).toUpperCase()}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{
                                    fontFamily: 'Syne, sans-serif', fontSize: '1.5rem',
                                    fontWeight: '800', color: '#0f0f0f', margin: '0 0 6px'
                                }}>{userData?.fullName}</h2>
                                <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: '14px' }}>
                                    {userData?.email}
                                </p>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    background: role.bg, color: role.color,
                                    padding: '5px 14px', borderRadius: '999px',
                                    fontSize: '13px', fontWeight: '600'
                                }}>
                                    {role.icon} {role.label}
                                </span>
                            </div>
                            {!editing && (
                                <button onClick={() => setEditing(true)} style={{
                                    padding: '9px 20px',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                    color: 'white', border: 'none', borderRadius: '10px',
                                    fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                    boxShadow: '0 4px 12px rgba(255,77,45,0.3)'
                                }}>✏️ Edit</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info / Edit Card */}
                <div className="animate-fadeInUp delay-2" style={{
                    background: 'white', borderRadius: '20px',
                    padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '1rem',
                        fontWeight: '700', color: '#0f0f0f', margin: '0 0 20px'
                    }}>Personal Information</h3>

                    {success && (
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '10px', padding: '12px 16px',
                            marginBottom: '16px', color: '#15803d',
                            fontSize: '14px', fontWeight: '500',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            ✅ Profile updated successfully!
                        </div>
                    )}

                    {!editing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { label: 'Full Name', value: userData?.fullName, icon: '👤' },
                                { label: 'Email', value: userData?.email, icon: '📧' },
                                { label: 'Mobile', value: userData?.mobile || 'Not provided', icon: '📞' },
                                { label: 'Role', value: role.label, icon: role.icon },
                                { label: 'Member Since', value: new Date(userData?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '📅' }
                            ].map((item, i) => (
                                <div key={i} style={{
                                    background: '#f9fafb', borderRadius: '12px',
                                    padding: '14px', border: '1px solid #f3f4f6'
                                }}>
                                    <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                                        {item.icon} {item.label}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#111', fontWeight: '600' }}>
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Full Name
                                </label>
                                <input type="text" value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Mobile Number
                                </label>
                                <input type="text" value={mobile}
                                    onChange={e => setMobile(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#ff4d2d'; e.target.style.boxShadow = '0 0 0 4px rgba(255,77,45,0.08)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>
                            <div style={{
                                background: '#f9fafb', borderRadius: '12px', padding: '12px 16px',
                                border: '1px solid #f3f4f6'
                            }}>
                                <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>EMAIL (cannot be changed)</p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{userData?.email}</p>
                            </div>
                            {err && (
                                <div style={{
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    borderRadius: '10px', padding: '10px 14px',
                                    color: '#dc2626', fontSize: '13px'
                                }}>⚠️ {err}</div>
                            )}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleSave} disabled={loading} style={{
                                    flex: 1, padding: '13px',
                                    background: 'linear-gradient(135deg, #ff4d2d, #ff7043)',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    fontSize: '15px', fontWeight: '700',
                                    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(255,77,45,0.3)'
                                }}>
                                    {loading ? '⏳ Saving...' : 'Save Changes →'}
                                </button>
                                <button onClick={() => { setEditing(false); setErr('') }} style={{
                                    padding: '13px 20px', background: 'white',
                                    color: '#374151', border: '1.5px solid #e5e7eb',
                                    borderRadius: '12px', fontWeight: '600',
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                                }}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="animate-fadeInUp delay-3" style={{
                    background: 'white', borderRadius: '20px',
                    padding: '1.5rem', border: '1px solid rgba(0,0,0,0.06)'
                }}>
                    <h3 style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '1rem',
                        fontWeight: '700', color: '#0f0f0f', margin: '0 0 16px'
                    }}>Quick Links</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: '📦 My Orders', path: '/my-orders' },
                            ...(userData?.role === 'owner' ? [{ label: '🏪 Owner Dashboard', path: '/owner' }] : []),
                            ...(userData?.role === 'deliveryBoy' ? [{ label: '🛵 Delivery Dashboard', path: '/delivery' }] : [])
                        ].map((link, i) => (
                            <button key={i} onClick={() => navigate(link.path)} style={{
                                width: '100%', padding: '13px 16px',
                                background: '#f9fafb', border: '1px solid #f3f4f6',
                                borderRadius: '12px', cursor: 'pointer',
                                textAlign: 'left', fontSize: '14px',
                                fontWeight: '500', color: '#374151',
                                fontFamily: 'DM Sans, sans-serif',
                                transition: 'all 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fff5f3'; e.currentTarget.style.color = '#ff4d2d'; e.currentTarget.style.borderColor = '#ff4d2d' }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#f3f4f6' }}
                            >
                                {link.label}
                                <span>→</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile