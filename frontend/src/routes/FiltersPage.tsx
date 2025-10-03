import BeforeAfterCard from '../components/BeforeAfterCard'

export default function FiltersPage() {
  return (
    <section className="container">
      <h1>Filters</h1>
      <p>Before/After Lightroom presets gallery.</p>
      <div className="grid" style={{ gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {[...Array(6)].map((_, i) => (
          <BeforeAfterCard
            key={i}
            title={`Preset ${i + 1}`}
            beforeUrl={`https://picsum.photos/seed/b${i}/600/400`}
            afterUrl={`https://picsum.photos/seed/a${i}/600/400`}
          />
        ))}
      </div>
      <p className="muted">Exact LR parameters are paywalled (backend pending).</p>
    </section>
  )
}

