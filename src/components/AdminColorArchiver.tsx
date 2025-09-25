import { useMemo, useState } from 'react'
import { hexToRgb, rgbToCmyk, rgbToHex } from '../utils/color'

const DOMAIN = [
  { v: 'L', label: 'L - Place' },
  { v: 'F', label: 'F - Food' },
  { v: 'O', label: 'O - Object' },
  { v: 'P', label: 'P - People' },
  { v: 'A', label: 'A - Art' },
  { v: 'N', label: 'N - Nature' },
]
const WEATHER = ['CL', 'OV', 'RA', 'SN', 'FG', 'HZ', 'ST'] as const
const TIME = ['MR', 'DT', 'EV', 'NT', 'GD', 'BL'] as const

function pad2(n: string) { return n.padStart(2, '0').slice(-2) }
function pad3(n: string) { return (n.toUpperCase().replace(/[^A-Z]/g, '') + 'XXX').slice(0, 3) }

export default function AdminColorArchiver() {
  const [hex, setHex] = useState('#3366ff')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [domain, setDomain] = useState('L')
  const [country, setCountry] = useState('01')
  const [city, setCity] = useState('SEL')
  const [detail, setDetail] = useState('HND')
  const [weather, setWeather] = useState<(typeof WEATHER)[number]>('CL')
  const [time, setTime] = useState<(typeof TIME)[number]>('GD')
  const [theme, setTheme] = useState('')

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const cmyk = useMemo(() => rgbToCmyk(rgb), [rgb])
  const taxonomy = useMemo(() => {
    const parts = [
      `${domain}${pad2(country)}`,
      pad3(city),
      pad3(detail),
      weather,
      time,
    ]
    const opt = theme.trim() ? `(${pad3(theme).slice(0, 2)})` : ''
    return `${parts.join('-')}${opt}//${slug}`
  }, [domain, country, city, detail, weather, time, theme, slug])

  const copy = async () => { try { await navigator.clipboard.writeText(taxonomy) } catch { } }

  return (
    <section className="container">
      <h2>Admin: Color Archiving</h2>
      <div className="grid auto">
        <label>Hex
          <input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#FFFFFF" />
        </label>
        <label>Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shibuya Ramune" />
        </label>
        <label>Slug
          <input value={slug} onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-'))} placeholder="shibuya-ramune" />
        </label>
      </div>

      <div className="grid auto">
        <label>Domain
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            {DOMAIN.map(d => <option key={d.v} value={d.v}>{d.label}</option>)}
          </select>
        </label>
        <label>Country (2)
          <input value={country} onChange={(e) => setCountry(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="01" />
        </label>
        <label>City (3)
          <input value={city} onChange={(e) => setCity(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="SEL" />
        </label>
        <label>Detail (3)
          <input value={detail} onChange={(e) => setDetail(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3))} placeholder="HND" />
        </label>
        <label>Weather (2)
          <select value={weather} onChange={(e) => setWeather(e.target.value as any)}>
            {WEATHER.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
        <label>Time (2)
          <select value={time} onChange={(e) => setTime(e.target.value as any)}>
            {TIME.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Theme (2, optional)
          <input value={theme} onChange={(e) => setTheme(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))} placeholder="SK" />
        </label>
      </div>

      <div className="row" style={{ alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 12, border: '1px solid var(--border)', background: rgbToHex(rgb) }} />
        <div className="row" style={{ gap: 20 }}>
          <div><b>RGB</b>: {rgb.r}, {rgb.g}, {rgb.b}</div>
          <div><b>CMYK</b>: {cmyk.c}% {cmyk.m}% {cmyk.y}% {cmyk.k}%</div>
        </div>
      </div>

      <div className="row">
        <label style={{ flex: 1 }}>Generated Code
          <input value={taxonomy} readOnly />
        </label>
        <button className="primary" onClick={copy}>Copy</button>
      </div>

      <p className="muted">Note: Upload/save is disabled in this frontend-only build.</p>
    </section>
  )
}

