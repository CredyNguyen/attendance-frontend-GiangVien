import useApiResource from '../hooks/useApiResource'

function toRows(data) {
    if (Array.isArray(data)) {
        return data
    }

    if (!data || typeof data !== 'object') {
        return []
    }

    if (Array.isArray(data.items)) {
        return data.items
    }

    if (Array.isArray(data.list)) {
        return data.list
    }

    return [data]
}

function getValueByPath(obj, path) {
    if (!obj || !path) {
        return null
    }

    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
        if (current == null) {
            return null
        }
        current = current[part]
    }

    return current
}

function pickFirst(item, keys) {
    for (const key of keys) {
        const value = getValueByPath(item, key)
        if (value !== null && value !== undefined && value !== '') {
            return value
        }
    }
    return null
}

function formatValue(value, type) {
    if (value === null || value === undefined || value === '') {
        return '-'
    }

    if (type === 'datetime') {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleString('vi-VN')
        }
    }

    if (type === 'date') {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString('vi-VN')
        }
    }

    if (type === 'status') {
        return String(value).replaceAll('_', ' ')
    }

    if (typeof value === 'object') {
        return '-'
    }

    return String(value)
}

export default function EndpointTable({
    title,
    description,
    endpoint,
    columns,
    emptyText = 'Khong co du lieu.',
}) {
    const { data, loading, error, reload } = useApiResource(endpoint)
    const rows = toRows(data)

    return (
        <section className="resource-panel">
            <div className="resource-head">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
                <button type="button" onClick={reload}>Tai lai</button>
            </div>
            <p className="resource-endpoint">GET {endpoint}</p>

            {loading ? <p className="info-note">Dang tai du lieu...</p> : null}
            {error ? <p className="error-note">{error}</p> : null}

            {!loading && !error && rows.length === 0 ? <p className="info-note">{emptyText}</p> : null}

            {!loading && !error && rows.length > 0 ? (
                <>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.header}>{col.header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={row.id || row.uuid || idx}>
                                        {columns.map((col) => {
                                            const raw = pickFirst(row, col.keys)
                                            return <td key={col.header}>{formatValue(raw, col.type)}</td>
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mobile-cards">
                        {rows.map((row, idx) => (
                            <article className="mobile-card" key={row.id || row.uuid || idx}>
                                {columns.map((col) => {
                                    const raw = pickFirst(row, col.keys)
                                    return (
                                        <div className="mobile-field" key={col.header}>
                                            <strong>{col.header}</strong>
                                            <span>{formatValue(raw, col.type)}</span>
                                        </div>
                                    )
                                })}
                            </article>
                        ))}
                    </div>
                </>
            ) : null}
        </section>
    )
}
