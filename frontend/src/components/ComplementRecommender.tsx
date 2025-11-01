import { useMemo, useState } from 'react'
import { generateComplements, normalizeHex } from '../utils/color'

export default function ComplementRecommender() {
  const [hex, setHex] = useState('#3366ff')
  const { free, paid } = useMemo(() => generateComplements(hex), [hex])

  const swatch = (h: string) => (
    <div key={h} style={{ display: 'grid', gap: 4, placeItems: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 8, border: '1px solid #eee', background: h }} />
      <code>{h}</code>
    </div>
  )

  return (
    <section className="container complement-recommender">
      <h2>Complement Colors</h2>
      <label>Base Color
        <input value={`#${normalizeHex(hex)}`} onChange={(e) => setHex(e.target.value)} />
      </label>
      <div className="card">
        <h3>Free (4)</h3>
        <div className="complement-grid complement-grid-free">
          {free.map(swatch)}
        </div>
      </div>
      <div className="card">
        <h3>Premium Preview (16)</h3>
        <div className="complement-grid complement-grid-premium">
          {paid.map(swatch)}
        </div>
        <p className="muted">Unlock details via purchase (backend pending).</p>
      </div>
    </section>
  )
}

