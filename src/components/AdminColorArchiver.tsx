import { useMemo, useState } from 'react'
import { hexToRgb, rgbToCmyk, rgbToHex } from '../utils/color'
import HelpModal from './HelpModal'

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
  const [isOpen, setIsOpen] = useState(false)

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
  const openHelpModal = () => {
    setIsOpen(true)
  }
  const closeHelpModal = () => {
    setIsOpen(false)
  }
  return (
    <section className="container">
      <div className="row" style={{ alignItems: 'center' }}>
        <h2>Color Archiving</h2>
        <button className="primary button-cta" onClick={openHelpModal}>Help</button>
      </div>

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
        <button className="primary button-cta" onClick={copy}>Copy</button>
      </div>

      <p className="muted">Note: Upload/save is disabled in this frontend-only build.</p>
      {isOpen && <HelpModal
        title="컬러 코드 구조"
        content="
  <h3><code>[도메인1]-[국가2]-[도시3]-[세부4]-[날씨2]-[시간2](-[주제2, 선택])//[색상 이름]</code></h3>
  <br />
  <br />
  <code>[도메인1]</code> = L=장소(풍경/거리), F=음식, O=오브젝트/사물, P=사람/패션, A=예술/전시, N=자연(식물/바다/산)
  <br />
  <code>[국가2]</code> = 국가 코드(ISO 3166-1)<br />(예: 한국=KR, 미국=US 등. 참고: <a href='https://namu.wiki/w/ISO%203166#s-2' target='_blank'>https://namu.wiki/w/ISO%203166#s-2</a>)
  <br />
  <code>[도시3]</code> = 로마자 3자(도쿄=TYO, 서울=SEL, 오사카=OSA).
  <br />
  <code>[세부4]</code> = 동네/지구 4자(신주쿠=SHNJ, 홍대=HNGD). 모르면 XXX.
  <br />
  <code>[날씨2]</code> = CL(맑음), OV(흐림), RA(비), SN(눈), FG(안개), HZ(연무), ST(소나기/뇌우).
  <br />
  <code>[시간2]</code> = MR(아침), DT(한낮), EV(저녁), NT(밤), GD(골든아워), BL(블루아워)
  <br />
  <code>[주제2, 선택]</code> = SK(하늘), FD(음식), DR(음료), TX(텍스처), PT(패턴), PL(식물) 등
  <br />
  <code>[색상 이름]</code> = 네이밍 자유. 영문, 공백 대신 '-' 사용(예: shiroi-kumo)
  <br />
  <br />
  (예시)<일본-도쿄-신주쿠-흐릿함-저녁-하늘//시로이 쿠모> -> 
  <br /><code>L02-SEL-HND-CL-GD(PL)//shiroi-kumo</code>
  <br />
"
        onClose={closeHelpModal}
      />}
    </section>
  )
}

