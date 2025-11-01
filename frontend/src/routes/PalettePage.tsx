import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUIStore } from '../store/ui'
import { colorApi } from '../utils/api'
import ColorCard from '../components/ColorCard'

interface ColorCode {
  id: string
  color_code: string
  hex_code: string
  name?: string
  description?: string
  created_by_user: {
    username: string
  }
}

interface ColorGroup {
  colorCode: string
  colors: ColorCode[]
}

export default function PalettePage() {
  const { taxonomy, setTaxonomy } = useUIStore()
  const [q, setQ] = useState('')
  const [colorCodes, setColorCodes] = useState<ColorCode[]>([])
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation() as any
  const fromBanner = location.state?.fromBanner

  useEffect(() => {
    fetchColorCodes()
  }, [q])

  // colorCodes가 변경되면 그룹화
  useEffect(() => {
    if (colorCodes.length > 0) {
      const grouped = colorCodes.reduce((acc, color) => {
        const code = color.color_code
        if (!acc[code]) {
          acc[code] = []
        }
        acc[code].push(color)
        return acc
      }, {} as Record<string, ColorCode[]>)

      const groups: ColorGroup[] = Object.entries(grouped).map(([colorCode, colors]) => ({
        colorCode,
        colors,
      }))

      // 컬러 개수가 많은 순서로 정렬 (선택사항)
      groups.sort((a, b) => b.colors.length - a.colors.length)

      setColorGroups(groups)
    } else {
      setColorGroups([])
    }
  }, [colorCodes])

  const fetchColorCodes = async () => {
    try {
      setLoading(true)
      const response = await colorApi.getColorCodes(1, 100, q || undefined)
      setColorCodes(response.colorCodes || [])
    } catch (err) {
      console.error('Error fetching color codes:', err)
      setError('컬러 코드를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container">
      <h1>Color Palettes</h1>
      <div className="grid auto">
        <label>Domain
          <select value={taxonomy.domain ?? ''} onChange={(e) => setTaxonomy({ domain: (e.target.value || undefined) as any })}>
            <option value="">Any</option>
            <option value="L">L</option>
            <option value="F">F</option>
            <option value="O">O</option>
            <option value="P">P</option>
            <option value="A">A</option>
            <option value="N">N</option>
          </select>
        </label>
        <label>Country (2)
          <input value={taxonomy.country ?? ''} onChange={(e) => setTaxonomy({ country: e.target.value })} placeholder="01" />
        </label>
        <label>City (3)
          <input value={taxonomy.city ?? ''} onChange={(e) => setTaxonomy({ city: e.target.value })} placeholder="SEL" />
        </label>
        <label>Detail (3)
          <input value={taxonomy.detail ?? ''} onChange={(e) => setTaxonomy({ detail: e.target.value })} placeholder="HND" />
        </label>
        <label>Weather
          <select value={taxonomy.weather ?? ''} onChange={(e) => setTaxonomy({ weather: (e.target.value || undefined) as any })}>
            <option value="">Any</option>
            {['CL', 'OV', 'RA', 'SN', 'FG', 'HZ', 'ST'].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
        <label>Time
          <select value={taxonomy.time ?? ''} onChange={(e) => setTaxonomy({ time: (e.target.value || undefined) as any })}>
            <option value="">Any</option>
            {['MR', 'DT', 'EV', 'NT', 'GD', 'BL'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Theme (opt)
          <input value={taxonomy.theme ?? ''} onChange={(e) => setTaxonomy({ theme: e.target.value || undefined })} placeholder="SK" />
        </label>
        <label>Search
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or slug" />
        </label>
      </div>

      {fromBanner && (
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <b>From Banner:</b>
            <span>{fromBanner.country}/{fromBanner.city}</span>
          </div>
          <div className="grid tight" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {fromBanner.colors.map((c: any) => (
              <div key={c.hex} style={{ display: 'grid', gap: 6, placeItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid var(--border)', background: c.hex }} />
                <code>{c.hex}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>컬러 코드를 불러오는 중...</div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#e74c3c' }}>{error}</div>
          <button
            onClick={fetchColorCodes}
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
      ) : colorGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>컬러 코드가 없습니다.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {colorGroups.map((group) => (
            <div key={group.colorCode} className="card" style={{ padding: 20 }}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                  <code style={{
                    background: '#f3f4f6',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: '16px',
                    fontFamily: 'monospace'
                  }}>
                    {group.colorCode}
                  </code>
                </h3>
                <span style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  background: '#f9fafb',
                  padding: '4px 12px',
                  borderRadius: 12
                }}>
                  {group.colors.length}개의 색상
                </span>
              </div>
              <div className="grid auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {group.colors.map((colorCode) => (
                  <ColorCard
                    key={colorCode.id}
                    hex={colorCode.hex_code}
                    name={colorCode.name || colorCode.color_code}
                    colorId={colorCode.id}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

