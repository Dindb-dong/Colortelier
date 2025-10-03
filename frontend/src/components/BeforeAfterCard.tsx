type Props = {
  beforeUrl: string
  afterUrl: string
  title?: string
}

export default function BeforeAfterCard({ beforeUrl, afterUrl, title }: Props) {
  return (
    <figure className="card" style={{ display: 'grid', gap: 10 }}>
      {title && <figcaption style={{ fontWeight: 700 }}>{title}</figcaption>}
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <img src={beforeUrl} alt="Before" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
        <img src={afterUrl} alt="After" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
      </div>
      <div className="row muted" style={{ justifyContent: 'space-between' }}>
        <span>Before</span>
        <span>After</span>
      </div>
    </figure>
  )
}

