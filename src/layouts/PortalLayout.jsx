import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import stuLogo from '../assets/images/STU_logo.webp'
import { useAuth } from '../auth/AuthContext'

const navMap = {
    student: [
        {
            to: '/student/exam-schedules', label: 'Lịch thi', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        },
        {
            to: '/student/attendance-results', label: 'Kết quả điểm danh', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            )
        },
        {
            to: '/student/face-registration', label: 'Đăng ký khuôn mặt', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
            )
        },
    ],
    lecturer: [
        {
            to: '/lecturer/exam-schedules', label: 'Ca Thi Của Bạn', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            )
        },
        {
            to: '/lecturer/current-exam', label: 'Điểm Danh', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            )
        },
    ],
}

export default function PortalLayout() {
    const { user, logout } = useAuth()
    const items = navMap[user?.role] || []
    const [collapsed, setCollapsed] = useState(false)

    return (
        <div className="sidebar-shell">
            {/* ── SIDEBAR ── */}
            <aside className={`sidebar${collapsed ? " sidebar-collapsed" : ""}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <img src={stuLogo} alt="STU Logo" className="sidebar-logo-img" />
                </div>

                {/* Nav */}
                <nav className="sidebar-nav">
                    {items.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => 'sidebar-link' + (isActive ? ' sidebar-link-active' : '')}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

            
            </aside>

            {/* ── MAIN AREA ── */}
            <div className={`sidebar-main${collapsed ? " sidebar-main-collapsed" : ""}`}>
                {/* Top bar */}
           {/* Top bar */}
                <header className="sidebar-topbar">
                    <button
                        onClick={() => setCollapsed(c => !c)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px 8px', borderRadius: 8, color: '#475569',
                            display: 'flex', alignItems: 'center',
                            transition: 'background 0.15s',
                        }}
                        title={collapsed ? "Mở sidebar" : "Đóng sidebar"}
                    >
                        {collapsed ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="3" x2="9" y2="21" />
                                <polyline points="13 9 17 12 13 15" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <line x1="9" y1="3" x2="9" y2="21" />
                                <polyline points="15 9 11 12 15 15" />
                            </svg>
                        )}
                    </button>

                    <div className="sidebar-topbar-right">
                        {/* 2. Bọc NavLink quanh khối sidebar-user */}
                        <NavLink 
                            to={`/${user?.role}/profile`} 
                            className="sidebar-user-navlink"
                            style={{ 
                                textDecoration: 'none', 
                                display: 'flex', 
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                transition: 'background 0.2s'
                            }}
                            // Hiệu ứng hover nhẹ để người dùng biết có thể click
                            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseOut={e => e.currentTarget.style.background = 'none'}
                        >
                            <div className="sidebar-user" style={{ cursor: 'pointer' }}>
                                <div className="sidebar-avatar">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                        {user?.name || user?.full_name || user?.email || 'Unknown'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>
                                        {user?.role}
                                    </div>
                                </div>
                            </div>
                        </NavLink>

                        <button
                            type="button"
                            onClick={logout}
                            style={{
                                background: '#f1f5f9', border: 'none', cursor: 'pointer',
                                padding: '8px 16px', borderRadius: 9, color: '#475569',
                                fontSize: 13, fontWeight: 600, transition: 'background 0.15s',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            Đăng xuất
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="sidebar-content">
                    <Outlet />
                </main>

      
            </div>
        </div>
    )
}