import type { ThemeArchive } from '../../../shared/types'

type Props = {
  item: ThemeArchive
}

export default function ThemePreviewCard({ item }: Props) {
  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
      <div style={{
        backgroundImage: `url(${item.imageObjectUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        paddingTop: '56%',
        filter: 'saturate(0.96)',
        borderRadius: 10,
        border: '1px solid var(--border)'
      }} />
      <div style={{
        display: 'grid',
        gap: 6,
        position: 'absolute',
        left: 12,
        bottom: 12,
        right: 12,
        background: 'rgba(0,0,0,0.35)',
        color: '#fff',
        padding: 10,
        borderRadius: 8,
      }}>
        <div style={{ fontWeight: 700 }}>{item.domain} • {item.country} • {item.city}</div>
        <div style={{ fontSize: 12 }}>{item.detail} • {item.weather} • {item.time}{item.theme ? ` • ${item.theme}` : ''}</div>
      </div>
    </div>
  )
}


