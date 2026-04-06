import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import PortalLayout from './layouts/PortalLayout'
import LoginPage from './pages/LoginPage'
import LecturerCurrentExamPage from './pages/lecturer/LecturerCurrentExamPage'
import LecturerExamSchedulesPage from './pages/lecturer/LecturerExamSchedulesPage'
import LecturerProfilePage from './pages/lecturer/LecturerProfilePage'
import StudentAttendanceResultsPage from './pages/student/StudentAttendanceResultsPage'
import StudentExamSchedulesPage from './pages/student/StudentExamSchedulesPage'
import StudentFaceRegistrationPage from './pages/student/StudentFaceRegistrationPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function HomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="full-page-loading">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return user.role === 'lecturer'
    ? <Navigate to="/lecturer/exam-schedules" replace />
    : <Navigate to="/student/exam-schedules" replace />
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return <div className="full-page-loading">Loading session...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/student"
        element={(
          <ProtectedRoute role="student">
            <PortalLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="exam-schedules" element={<StudentExamSchedulesPage />} />
        <Route path="attendance-results" element={<StudentAttendanceResultsPage />} />
        <Route path="face-registration" element={<StudentFaceRegistrationPage />} />
      </Route>

      <Route
        path="/lecturer"
        element={(
          <ProtectedRoute role="lecturer">
            <PortalLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="exam-schedules" element={<LecturerExamSchedulesPage />} />
        <Route path="current-exam" element={<LecturerCurrentExamPage />} />
        <Route path="profile" element={<LecturerProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App