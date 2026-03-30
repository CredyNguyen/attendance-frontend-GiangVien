import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const navMap = {
    student: [
        { to: '/student/exam-schedules', label: 'Lich thi' },
        { to: '/student/attendance-results', label: 'Ket qua diem danh' },
        { to: '/student/face-registration', label: 'Dang ky khuon mat' },
    ],
    lecturer: [
        { to: '/lecturer/exam-schedules', label: 'Lich thi phu trach' },
        { to: '/lecturer/today-exams', label: 'Lich thi hom nay' },
        { to: '/lecturer/current-exam', label: 'Ca thi hien tai' },
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
                        {user?.role === 'lecturer' ? 'Khong gian giang vien' : 'Khong gian sinh vien'}
                    </h1>
                </div>
                <div className="profile-box">
                    <p>{user?.name || user?.full_name || user?.email || 'Unknown user'}</p>
                    <button type="button" onClick={logout}>Dang xuat</button>
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
