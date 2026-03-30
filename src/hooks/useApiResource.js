import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'

export default function useApiResource(endpoint) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const response = await api.get(endpoint)
            setData(response.data?.data ?? response.data)
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Khong tai duoc du lieu')
        } finally {
            setLoading(false)
        }
    }, [endpoint])

    useEffect(() => {
        load()
    }, [load])

    return { data, loading, error, reload: load }
}
