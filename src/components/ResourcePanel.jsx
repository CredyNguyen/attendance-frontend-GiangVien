import useApiResource from '../hooks/useApiResource'

function renderValue(value) {
    if (value === null || value === undefined) {
        return '-'
    }

    if (typeof value === 'object') {
        return <pre>{JSON.stringify(value, null, 2)}</pre>
    }

    return String(value)
}

export default function ResourcePanel({ title, endpoint, description }) {
    const { data, loading, error, reload } = useApiResource(endpoint)

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

            {loading && <p className="info-note">Dang tai du lieu...</p>}
            {error && <p className="error-note">{error}</p>}

            {!loading && !error && (
                <div className="resource-body">
                    {Array.isArray(data) ? (
                        data.length > 0 ? (
                            data.map((item, idx) => (
                                <article className="json-card" key={idx}>
                                    {Object.entries(item).map(([k, v]) => (
                                        <div className="row" key={k}>
                                            <strong>{k}</strong>
                                            <div>{renderValue(v)}</div>
                                        </div>
                                    ))}
                                </article>
                            ))
                        ) : (
                            <p className="info-note">Khong co ban ghi nao.</p>
                        )
                    ) : (
                        <article className="json-card">
                            {data && typeof data === 'object' ? (
                                Object.entries(data).map(([k, v]) => (
                                    <div className="row" key={k}>
                                        <strong>{k}</strong>
                                        <div>{renderValue(v)}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="row">
                                    <strong>data</strong>
                                    <div>{renderValue(data)}</div>
                                </div>
                            )}
                        </article>
                    )}
                </div>
            )}
        </section>
    )
}
