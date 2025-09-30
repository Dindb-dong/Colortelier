import { useEffect, useState } from 'react'
import { useUIStore } from '../store/ui'
import HeroBanner from '../components/HeroBanner'

export default function MainPage() {
  const banners = useUIStore((s) => s.banners)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length)
    }, 5000)
    return () => clearInterval(id)
  }, [banners.length])

  return (
    <section style={{ padding: 0 }}>
      <div style={{ position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', height: '40vw', minHeight: 420 }}>
        {banners.map((b, i) => (
          <HeroBanner key={b.id} banner={b} active={i === index} />
        ))}
      </div>
      <div className="container" style={{ gap: 20, display: 'grid', padding: 28 }}>
        <header className="card" style={{ textAlign: 'center', padding: 32 }}>
          <h1 style={{ margin: 0 }}>Colortelier</h1>
          <p className="muted">Travel-inspired colors and Lightroom filters</p>
        </header>
      </div>
    </section>
  )
}

