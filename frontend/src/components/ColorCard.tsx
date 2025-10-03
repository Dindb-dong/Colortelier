type Props = {
  hex: string
  name: string
}

export default function ColorCard({ hex, name }: Props) {
  return (
    <div className="color-card" style={{ display: 'grid', gap: 8, placeItems: 'center' }}>
      <div style={{ width: 120, height: 100, borderRadius: 10, background: hex, border: '1px solid rgba(255,255,255,0.8)' }} />
      <div style={{ textAlign: 'center', background: '#fff', borderRadius: 10, padding: '8px 10px', width: 160, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
        <div style={{ fontWeight: 800 }}>{hex.replace('#', '').toUpperCase()}</div>
        <div style={{ color: '#111827', fontSize: 14 }}>{name}</div>
      </div>
    </div>
  )
}


