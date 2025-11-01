import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUIStore } from '../store/ui'
import { colorApi, themeApi } from '../utils/api'
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

interface Theme {
  id: string
  theme_code: string
  thumbnail_url: string
  name?: string
}

interface ColorGroup {
  colorCode: string
  colors: ColorCode[]
  theme?: Theme
}

export default function PalettePage() {
  const { taxonomy, setTaxonomy } = useUIStore()
  const [q, setQ] = useState('')
  const [colorCodes, setColorCodes] = useState<ColorCode[]>([])
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation() as any
  const fromBanner = location.state?.fromBanner

  useEffect(() => {
    fetchColorCodes()
  }, [q])

  // 테마 목록 불러오기
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await themeApi.getThemes(1, 100)
        setThemes(response.themes || [])
      } catch (err) {
        console.error('Error fetching themes:', err)
      }
    }
    fetchThemes()
  }, [])

  // 컬러 코드의 필수 부분만 추출 (L-KR-SEL-HNGD-CL-GD-SK -> L-KR-SEL-HNGD-CL-GD)
  const getBaseColorCode = (colorCode: string): string => {
    const parts = colorCode.split('-')
    // 필수 부분은 앞 6개 (domain, country, city, detail, weather, time)
    // 선택적 부분은 7번째 이후 (theme 등)
    return parts.slice(0, 6).join('-')
  }

  // colorCodes와 themes가 변경되면 그룹화 및 테마 매칭
  useEffect(() => {
    if (colorCodes.length > 0) {
      const grouped = colorCodes.reduce((acc, color) => {
        // 필수 부분만 사용하여 그룹화
        const baseCode = getBaseColorCode(color.color_code)
        if (!acc[baseCode]) {
          acc[baseCode] = []
        }
        acc[baseCode].push(color)
        return acc
      }, {} as Record<string, ColorCode[]>)

      const groups: ColorGroup[] = Object.entries(grouped).map(([colorCode, colors]) => {
        // 같은 baseColorCode를 가진 테마 찾기
        const matchingTheme = themes.find(theme => {
          const themeBaseCode = getBaseColorCode(theme.theme_code)
          return themeBaseCode === colorCode
        })

        return {
          colorCode,
          colors,
          theme: matchingTheme,
        }
      })

      // 컬러 개수가 많은 순서로 정렬 (선택사항)
      groups.sort((a, b) => b.colors.length - a.colors.length)

      setColorGroups(groups)
    } else {
      setColorGroups([])
    }
  }, [colorCodes, themes])

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
              <div style={{ display: 'grid', gridTemplateColumns: group.theme ? '1fr auto' : '1fr', gap: 20, alignItems: 'start' }}>
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
                {group.theme && (
                  <div style={{
                    display: 'grid',
                    gap: 8,
                    minWidth: 200,
                    maxWidth: 300
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: 4
                    }}>
                      테마 이미지
                    </div>
                    <img
                      src={group.theme.thumbnail_url}
                      alt={group.theme.name || 'Theme'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        objectFit: 'cover',
                        aspectRatio: '4/3'
                      }}
                    />
                    {group.theme.name && (
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        textAlign: 'center'
                      }}>
                        {group.theme.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

