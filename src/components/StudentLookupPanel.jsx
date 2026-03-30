import { useState } from 'react'
import api from '../api/client'

function pickSummary(data) {
    const source = data?.student ?? data

    return [
        ['Ho ten', source?.name || source?.student_name],
        ['Ma sinh vien', source?.student_code || source?.code],
        ['Mon hoc', source?.subject_name || source?.course_name || source?.exam_name],
        ['Phong thi', source?.room || source?.room_name],
        ['Trang thai', source?.status || source?.attendance_status],
    ].filter(([, value]) => value !== null && value !== undefined && value !== '')
}

export default function StudentLookupPanel() {
    const [studentCode, setStudentCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [summary, setSummary] = useState([])

    const handleSearch = async (event) => {
        event.preventDefault()
        setError('')
        setSummary([])

        if (!studentCode.trim()) {
            setError('Nhap student_code truoc khi tim')
            return
        }

        setLoading(true)
        try {
            const response = await api.get('/lecturer/students/today-exam', {
                params: { student_code: studentCode.trim() },
            })
            setSummary(pickSummary(response.data?.data ?? response.data))
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Khong tim thay thong tin')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="resource-panel">
            <div className="resource-head">
                <div>
                    <h2>Tra cuu sinh vien theo ma</h2>
                    <p>Kiem tra lich thi hom nay cua mot sinh vien cu the.</p>
                </div>
            </div>
            <p className="resource-endpoint">GET /lecturer/students/today-exam?student_code=...</p>

            <form className="lookup-form" onSubmit={handleSearch}>
                <input
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="VD: SV001"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Dang tim...' : 'Tra cuu'}
                </button>
            </form>

            {error ? <p className="error-note">{error}</p> : null}
            {summary.length > 0 ? (
                <article className="json-card">
                    {summary.map(([label, value]) => (
                        <div className="row" key={label}>
                            <strong>{label}</strong>
                            <span>{String(value)}</span>
                        </div>
                    ))}
                </article>
            ) : null}
        </section>
    )
}
