import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useUIStore } from '../store/ui'

export default function PalettePage() {
  const { taxonomy, setTaxonomy } = useUIStore()
  const [q, setQ] = useState('')
  const location = useLocation() as any
  const fromBanner = location.state?.fromBanner

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

      <p className="muted">Results are mocked for frontend-only build.</p>
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
      <div className="grid auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card" style={{ display: 'grid', gap: 8 }}>
            <div className="grid tight" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {["#4b6bfb", "#34d399", "#fbbf24", "#ef4444", "#111827"].map(c => <div key={c} style={{ background: c, height: 36, borderRadius: 6 }} />)}
            </div>
            <div className="row muted" style={{ justifyContent: 'space-between' }}>
              <span>Sample Palette {i + 1}</span>
              <code>L01-SEL-HND-CL-GD//sample-{i + 1}</code>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

