import AdminColorArchiver from '../components/AdminColorArchiver'
import ComplementRecommender from '../components/ComplementRecommender'
import ThemeArchiver from '../components/ThemeArchiver'
import FilterArchiver from '../components/FilterArchiver'
import ThemePreviewCard from '../components/ThemePreviewCard'
import { useAuthStore, useUIStore } from '../store/ui'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function AdminPage() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const themes = useUIStore((s) => s.themes)
  const [tab, setTab] = useState<1 | 2 | 3>(1)

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <h1>Admin Page</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        <aside className="card" style={{ padding: 12 }}>
          <div className="column" style={{ gap: 8 }}>
            <button className={tab === 1 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(1)}>1. Color Archive</button>
            <button className={tab === 2 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(2)}>2. Theme Archive</button>
            <button className={tab === 3 ? 'primary button-cta' : 'button-cta'} onClick={() => setTab(3)}>3. Filter Archive</button>
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          {tab === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <AdminColorArchiver />
                <ComplementRecommender />
              </div>
              <div className="container" style={{ display: 'grid', gap: 12 }}>
                <h3>Saved Themes</h3>
                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
                  {themes.length === 0 && <p className="muted">No themes yet. Add some in Tab 2.</p>}
                  {themes.map(t => (
                    <ThemePreviewCard key={t.id} item={t} />
                  ))}
                </div>
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

