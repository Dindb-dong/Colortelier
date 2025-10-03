import { useMemo, useState } from 'react'
import ColorCard from './ColorCard'
import type { Banner } from '../../../shared/types'
import { useNavigate } from 'react-router-dom'

type Props = {
  banner: Banner
  active: boolean
}

export default function HeroBanner({ banner, active }: Props) {
  const navigate = useNavigate()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: `url(${banner.imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 800ms ease',
    opacity: active ? 1 : 0,
  }), [banner.imageUrl, active])

  return (
    <div aria-hidden={!active} style={containerStyle}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%)' }} />

      <div style={{ position: 'absolute', top: 18, left: 20, color: '#fff', fontWeight: 800, fontSize: 22, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
        <span role="img" aria-label="pin">📍</span> {banner.country}/{banner.city}
      </div>

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {banner.colors.map((c, i) => (
          <div key={c.hex}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ transform: hoveredIndex === i ? 'scale(1.06)' : 'scale(1)', transition: 'transform 200ms ease' }}>
            <ColorCard hex={c.hex} name={c.name} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)' }}>
        <button style={{ backgroundColor: '#000', color: '#fff', borderColor: '#000', borderRadius: 9999, padding: '8px 16px' }} className="primary button-cta" onClick={() => navigate('/palettes', { state: { fromBanner: banner } })}>
          See All Color Codes
        </button>
      </div>
    </div>
  )
}


