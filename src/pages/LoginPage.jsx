import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
    const { login, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    if (user?.role === 'lecturer') {
        return <Navigate to="/lecturer/exam-schedules" replace />
    }

    if (user?.role === 'student') {
        return <Navigate to="/student/exam-schedules" replace />
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const loggedInUser = await login({ email, password })
            const fallbackPath =
                loggedInUser?.role === 'lecturer'
                    ? '/lecturer/exam-schedules'
                    : '/student/exam-schedules'
            const nextPath = location.state?.from?.pathname || fallbackPath
            navigate(nextPath, { replace: true })
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Đăng nhập thất bại')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <p className="portal-kicker">Attendance Portal</p>
                <h1>Đăng nhập hệ thống</h1>


                <form onSubmit={handleSubmit} className="login-form">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    {error ? <p className="error-note">{error}</p> : null}

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    )
}