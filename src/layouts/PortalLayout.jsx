import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navMap = {
    student: [
        { to: '/student/exam-schedules', label: 'Lịch thi' },
        { to: '/student/attendance-results', label: 'Kết quả điểm danh' },
        { to: '/student/face-registration', label: 'Đăng ký khuôn mặt' },
    ],
    lecturer: [
        { to: '/lecturer/exam-schedules', label: 'Lịch thi phụ trách' },
        { to: '/lecturer/current-exam', label: 'Ca thi hiện tại' },
    ],
}

export default function PortalLayout() {
    const { user, logout } = useAuth()
    const items = navMap[user?.role] || []

    return (
        <div className="portal-shell">
            <header className="portal-header">
                <div>
                    <p className="portal-kicker">Attendance Portal</p>
                    <h1>
                        {user?.role === 'lecturer' ? 'Không gian giảng viên' : 'Không gian sinh viên'}
                    </h1>
                </div>
                <div className="profile-box">
                    <p>{user?.name || user?.full_name || user?.email || 'Unknown user'}</p>
                    <button type="button" onClick={logout}>Đăng xuất</button>
                </div>
            </header>

            <nav className="portal-nav">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => (isActive ? 'active-nav' : '')}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <main className="portal-main">
                <Outlet />
            </main>
        </div>
    )
}