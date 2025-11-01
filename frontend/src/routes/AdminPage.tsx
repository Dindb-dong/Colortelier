import AdminColorArchiver from '../components/AdminColorArchiver'
import ComplementRecommender from '../components/ComplementRecommender'
import ThemeArchiver from '../components/ThemeArchiver'
import FilterArchiver from '../components/FilterArchiver'
import ThemePreviewCard from '../components/ThemePreviewCard'
import { useAuthStore } from '../store/ui'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { themeApi } from '../utils/api'
import type { ThemeArchive } from '../../../shared/types'

interface Theme {
  id: string
  name: string
  theme_code: string
  thumbnail_url: string
  created_at: string
}

export default function AdminPage() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [tab, setTab] = useState<1 | 2 | 3>(1)
  const [savedThemes, setSavedThemes] = useState<ThemeArchive[]>([])
  const [selectedTheme, setSelectedTheme] = useState<ThemeArchive | null>(null)
  const [loadingThemes, setLoadingThemes] = useState(false)

  // 테마 목록 불러오기
  useEffect(() => {
    const fetchThemes = async () => {
      setLoadingThemes(true)
      try {
        const response = await themeApi.getThemes(1, 100)
        // API 응답을 ThemeArchive 형식으로 변환
        const themesData: ThemeArchive[] = (response.themes || []).map((theme: Theme) => {
          // theme_code 파싱: domain-country-city-detail-weather-time(-theme)
          const parts = theme.theme_code.split('-')
          return {
            id: theme.id,
            imageObjectUrl: theme.thumbnail_url,
            domain: parts[0] || '',
            country: parts[1] || '',
            city: parts[2] || '',
            detail: parts[3] || '',
            weather: parts[4] || '',
            time: parts[5] || '',
            theme: parts[6] || undefined,
            createdAt: new Date(theme.created_at).getTime(),
          }
        })
        setSavedThemes(themesData)
      } catch (error) {
        console.error('Failed to fetch themes:', error)
      } finally {
        setLoadingThemes(false)
      }
    }

    fetchThemes()
  }, [])

  // 테마 클릭 핸들러
  const handleThemeClick = (theme: ThemeArchive) => {
    setSelectedTheme(theme)
  }

  return (
    <section className="admin-page" style={{ display: 'grid', gap: 16, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header with title and tabs */}
      <div className="admin-header" style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0
      }}>
        <h1 style={{ margin: 0 }}>Admin Page</h1>
        {/* Desktop tabs - on the side */}
        <aside className="card admin-tabs-desktop" style={{ padding: 12 }}>
          <div className="column" style={{ gap: 8 }}>
            <button className={tab === 1 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(1)}>1. Color Archive</button>
            <button className={tab === 2 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(2)}>2. Theme Archive</button>
            <button className={tab === 3 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(3)}>3. Filter Archive</button>
          </div>
        </aside>
        {/* Mobile tabs - next to title */}
        <div className="admin-tabs-mobile" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={tab === 1 ? 'primary button-cta' : 'button-cta'}
            onClick={() => setTab(1)}
            style={{ fontSize: '14px', padding: '8px 12px' }}
          >
            1. Color
          </button>
          <button
            className={tab === 2 ? 'primary button-cta' : 'button-cta'}
            onClick={() => setTab(2)}
            style={{ fontSize: '14px', padding: '8px 12px' }}
          >
            2. Theme
          </button>
          <button
            className={tab === 3 ? 'primary button-cta' : 'button-cta'}
            onClick={() => setTab(3)}
            style={{ fontSize: '14px', padding: '8px 12px' }}
          >
            3. Filter
          </button>
        </div>
      </div>

      <div className="admin-content" style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: 16,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0
      }}>
        {/* Desktop sidebar - hidden on mobile */}
        <aside className="card admin-tabs-desktop" style={{ padding: 12 }}>
          <div className="column" style={{ gap: 8 }}>
            <button className={tab === 1 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(1)}>1. Color Archive</button>
            <button className={tab === 2 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(2)}>2. Theme Archive</button>
            <button className={tab === 3 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(3)}>3. Filter Archive</button>
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16, minWidth: 0, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
          {tab === 1 && (
            <div style={{ display: 'grid', gap: 16, width: '100%', maxWidth: '100%', minWidth: 0 }}>
              {/* Saved Themes - Now at the top, horizontally scrollable */}
              <div className="container" style={{ display: 'grid', gap: 12, width: '100%', maxWidth: '100%', minWidth: 0 }}>
                <h3 style={{ margin: 0 }}>Saved Themes</h3>
                {loadingThemes ? (
                  <p className="muted">Loading themes...</p>
                ) : (
                  <div style={{
                    display: 'flex',
                    gap: 12,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: '8px',
                    scrollbarWidth: 'thin',
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0
                  }}>
                    {savedThemes.length === 0 && (
                      <p className="muted" style={{ minWidth: '100%', textAlign: 'center', padding: '20px' }}>
                        No themes yet. Add some in Tab 2.
                      </p>
                    )}
                    {savedThemes.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleThemeClick(t)}
                        style={{
                          cursor: 'pointer',
                          border: selectedTheme?.id === t.id ? '2px solid #0066ff' : '1px solid var(--border)',
                          borderRadius: 12,
                          transition: 'all 0.2s',
                          minWidth: '200px',
                          flexShrink: 0
                        }}
                      >
                        <ThemePreviewCard item={t} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Archiving and Complement Recommender */}
              <div style={{ display: 'grid', gap: 16 }}>
                <AdminColorArchiver selectedTheme={selectedTheme} onThemeClear={() => setSelectedTheme(null)} />
                <ComplementRecommender />
              </div>
            </div>
          )}

          {tab === 2 && (
            <ThemeArchiver />
          )}

          {tab === 3 && (
            <FilterArchiver />
          )}

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button
              style={{ backgroundColor: '#000', color: '#fff', borderColor: '#000', borderRadius: 9999, padding: '8px 16px', width: '40%', margin: '0 auto' }}
              onClick={() => {
                logout()
                navigate('/')
              }}>Logout</button>
          </div>
        </main>
      </div>
    </section>
  )
}

