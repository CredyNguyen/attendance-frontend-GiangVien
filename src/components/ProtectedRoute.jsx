import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="full-page-loading">Checking permission...</div>
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (role && user.role !== role) {
        return <Navigate to="/" replace />
    }

    return children
}
