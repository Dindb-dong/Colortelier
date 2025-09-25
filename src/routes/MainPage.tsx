export default function MainPage() {
  return (
    <section className="container" style={{ gap: 20, display: 'grid' }}>
      <header className="card" style={{ textAlign: 'center', padding: 32 }}>
        <h1 style={{ margin: 0 }}>Colortelier</h1>
        <p className="muted">Travel-inspired colors and Lightroom filters</p>
      </header>
      <div className="grid auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card" style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {["#4b6bfb", "#34d399", "#fbbf24", "#ef4444", "#111827"].map(c => <div key={c} style={{ background: c }} />)}
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
              <b>Destination {i + 1}</b>
              <span className="muted">L01-SEL-HND-CL-GD</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

