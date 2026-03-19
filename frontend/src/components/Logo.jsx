import React from 'react'

function Logo({ size = 'md', onClick }) {
    const sizes = {
        sm: { container: 28, font: 16, icon: 14 },
        md: { container: 36, font: 20, icon: 18 },
        lg: { container: 48, font: 26, icon: 24 }
    }
    const s = sizes[size]

    return (
        <div onClick={onClick} style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', cursor: onClick ? 'pointer' : 'default'
        }}>
            {/* Logo Mark */}
            <div style={{
                width: `${s.container}px`,
                height: `${s.container}px`,
                position: 'relative',
                flexShrink: 0
            }}>
                {/* Outer ring */}
                <div style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '35%',
                    background: 'linear-gradient(135deg, #ff4d2d 0%, #ff8c42 50%, #ffb347 100%)',
                    boxShadow: '0 4px 12px rgba(255,77,45,0.4)'
                }} />
                {/* Inner shape */}
                <div style={{
                    position: 'absolute', inset: '3px',
                    borderRadius: '32%',
                    background: 'linear-gradient(135deg, #ff6b35, #ff4d2d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: `${s.icon}px`, lineHeight: 1 }}>🍕</span>
                </div>
                {/* Shine effect */}
                <div style={{
                    position: 'absolute', top: '3px', left: '5px',
                    width: '40%', height: '35%',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    filter: 'blur(1px)'
                }} />
            </div>

            {/* Logo Text */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: '800',
                    fontSize: `${s.font}px`,
                    background: 'linear-gradient(135deg, #ff4d2d 0%, #ff8c42 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                }}>
                    Food<span style={{
                        background: 'linear-gradient(135deg, #0f0f0f, #374151)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Zito</span>
                </span>
                {size === 'lg' && (
                    <span style={{
                        fontSize: '10px', color: '#9ca3af',
                        fontFamily: 'DM Sans, sans-serif',
                        letterSpacing: '1.5px', textTransform: 'uppercase',
                        marginTop: '1px'
                    }}>Deliver Happiness</span>
                )}
            </div>
        </div>
    )
}

export default Logo