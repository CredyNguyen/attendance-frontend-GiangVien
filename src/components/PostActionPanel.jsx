import { useState } from 'react'
import api from '../api/client'

function extractDisplayFields(payload) {
    const body = payload?.data ?? payload

    const picks = [
        ['Trang thai', body?.status ?? body?.success],
        ['Thong bao', body?.message],
        ['File key', body?.file_key ?? body?.key],
        ['Upload URL', body?.upload_url ?? body?.url],
        ['Het han', body?.expires_at ?? body?.expired_at],
    ]

    return picks.filter(([, value]) => value !== null && value !== undefined && value !== '')
}

export default function PostActionPanel({ title, endpoint, description, payloadHint }) {
    const [payload, setPayload] = useState(payloadHint || '{}')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [responseData, setResponseData] = useState([])

    const submit = async (event) => {
        event.preventDefault()
        setError('')
        setResponseData([])

        let parsed = {}
        try {
            parsed = payload.trim() ? JSON.parse(payload) : {}
        } catch {
            setError('Payload JSON khong hop le')
            return
        }

        setLoading(true)
        try {
            const response = await api.post(endpoint, parsed)
            setResponseData(extractDisplayFields(response.data))
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Thuc hien POST that bai')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="resource-panel">
            <div className="resource-head">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </div>
            <p className="resource-endpoint">POST {endpoint}</p>

            <form className="post-form" onSubmit={submit}>
                <textarea
                    rows={5}
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    spellCheck="false"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Dang gui...' : 'Gui request'}
                </button>
            </form>

            {error ? <p className="error-note">{error}</p> : null}
            {responseData.length > 0 ? (
                <article className="json-card">
                    {responseData.map(([label, value]) => (
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
