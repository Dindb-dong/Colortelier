import { useState, useEffect } from 'react'
import { filterApi } from '../utils/api'
import BeforeAfterCard from '../components/BeforeAfterCard'

interface Filter {
  id: string
  name: string
  description?: string
  before_image_url?: string
  after_image_url?: string
  created_by_user: {
    username: string
  }
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<Filter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchFilters = async () => {
    try {
      setLoading(true)
      const response = await filterApi.getFilters(1, 20)
      setFilters(response.filters || [])
    } catch (err) {
      console.error('Error fetching filters:', err)
      setError('필터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <h1>Filters</h1>
      <p>Before/After Lightroom presets gallery.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>필터를 불러오는 중...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error}</div>
          <button
            onClick={fetchFilters}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      ) : filters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>필터가 없습니다.</div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {filters.map((filter) => (
            <BeforeAfterCard
              key={filter.id}
              title={filter.name}
              beforeUrl={filter.before_image_url || `https://picsum.photos/seed/b${filter.id}/600/400`}
              afterUrl={filter.after_image_url || `https://picsum.photos/seed/a${filter.id}/600/400`}
              filterId={filter.id}
              showActions={true}
            />
          ))}
        </div>
      )}

      <p className="muted">Exact LR parameters are paywalled (backend pending).</p>
    </section>
  )
}

