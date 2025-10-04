import { useMemo, useState } from 'react'
import { hexToRgb, rgbToCmyk, rgbToHex } from '../utils/color'
import HelpModal from './HelpModal'
import SPcodes from '../SPcodes.json'
import CreatableSelect from 'react-select/creatable'
import { colorApi } from '../utils/api'
import type { SingleValue } from 'react-select'


type Option = { value: string; label: string }

export default function AdminColorArchiver() {
  const [hex, setHex] = useState('#3366ff')
  const [name, setName] = useState('')
  const [domain, setDomain] = useState<string>('L')
  const [country, setCountry] = useState<string>('KR')
  const [city, setCity] = useState<string>('SEL')
  const [detail, setDetail] = useState<string>('HNGD')
  const [weather, setWeather] = useState<string>('CL')
  const [time, setTime] = useState<string>('GD')
  const [theme, setTheme] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  const initialDomainOptions: Option[] = useMemo(() => SPcodes.domain.map((d: string) => ({ value: d.split('=')[0], label: d })), [])
  const initialCountryOptions: Option[] = useMemo(() => SPcodes.country.map((c: string) => ({ value: c.split('=')[0], label: c })), [])
  const initialCityOptions: Option[] = useMemo(() => SPcodes.city.map((c: string) => ({ value: c.split('=')[0], label: c })), [])
  const initialDetailOptions: Option[] = useMemo(() => SPcodes.detail.map((d: string) => ({ value: d.split('=')[0], label: d })), [])
  const initialWeatherOptions: Option[] = useMemo(() => SPcodes.weather.map((w: string) => ({ value: w.split('=')[0], label: w })), [])
  const initialTimeOptions: Option[] = useMemo(() => SPcodes.time.map((t: string) => ({ value: t.split('=')[0], label: t })), [])
  const initialThemeOptions: Option[] = useMemo(() => SPcodes.theme.map((t: string) => ({ value: t.split('=')[0], label: t })), [])

  const [domainOptions, setDomainOptions] = useState<Option[]>(initialDomainOptions)
  const [countryOptions, setCountryOptions] = useState<Option[]>(initialCountryOptions)
  const [cityOptions, setCityOptions] = useState<Option[]>(initialCityOptions)
  const [detailOptions, setDetailOptions] = useState<Option[]>(initialDetailOptions)
  const [weatherOptions, setWeatherOptions] = useState<Option[]>(initialWeatherOptions)
  const [timeOptions, setTimeOptions] = useState<Option[]>(initialTimeOptions)
  const [themeOptions, setThemeOptions] = useState<Option[]>(initialThemeOptions)

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const cmyk = useMemo(() => rgbToCmyk(rgb), [rgb])
  const taxonomy = useMemo(() => {
    const parts = [
      domain,
      country,
      city,
      detail,
      weather,
      time,
    ]
    const opt = theme ? `-${theme}` : ''
    return `${parts.join('-')}${opt}//${name}`
  }, [domain, country, city, detail, weather, time, theme, name])

  const registerColor = async () => {
    if (!name.trim()) {
      setMessage('색상 이름을 입력해주세요.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // HSL 계산
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

      // 컬러 코드 생성
      const colorCode = `${domain}-${country}-${city}-${detail}-${weather}-${time}${theme ? `-${theme}` : ''}`

      await colorApi.createColorCode({
        color_code: colorCode,
        hex_code: hex,
        rgb_r: rgb.r,
        rgb_g: rgb.g,
        rgb_b: rgb.b,
        cmyk_c: cmyk.c,
        cmyk_m: cmyk.m,
        cmyk_y: cmyk.y,
        cmyk_k: cmyk.k,
        hsl_h: hsl.h,
        hsl_s: hsl.s,
        hsl_l: hsl.l,
        name: name.trim(),
        description: `Generated color code: ${colorCode}`
      })

      setMessage('컬러 코드가 성공적으로 등록되었습니다!')

      // 폼 초기화
      setHex('#3366ff')
      setName('')
      setDomain('L')
      setCountry('KR')
      setCity('SEL')
      setDetail('HNGD')
      setWeather('CL')
      setTime('GD')
      setTheme('')
    } catch (error: any) {
      setMessage(`등록 실패: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // RGB를 HSL로 변환하는 함수
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(taxonomy)
      alert('Copied to clipboard')
    } catch { }
  }
  const openHelpModal = () => {
    setIsOpen(true)
  }
  const closeHelpModal = () => {
    setIsOpen(false)
  }

  const addIfMissing = (list: Option[], setList: (o: Option[]) => void, value: string) => {
    if (!value) return
    const exists = list.some(o => o.value === value)
    if (!exists) {
      setList([...list, { value: value.split('=')[0], label: value }])
    }
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
      </div>

      <div className="grid auto">
        <label>Domain (1)
          <CreatableSelect
            options={domainOptions}
            value={domainOptions.find(o => o.value === domain) || { value: domain, label: domain }}
            onChange={(opt: SingleValue<Option>) => setDomain(opt?.value ?? domain)}
            onCreateOption={(val: string) => { addIfMissing(domainOptions, setDomainOptions, val) }}
            isClearable={false}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
        </label>
        <label>Country (2)
          <CreatableSelect
            options={countryOptions}
            value={countryOptions.find(o => o.value === country) || { value: country, label: country }}
            onChange={(opt: SingleValue<Option>) => setCountry(opt?.value ?? country)}
            onCreateOption={(val: string) => { addIfMissing(countryOptions, setCountryOptions, val) }}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
        </label>
        <label>City (3)
          <CreatableSelect
            options={cityOptions}
            value={cityOptions.find(o => o.value === city) || { value: city, label: city }}
            onChange={(opt: SingleValue<Option>) => setCity(opt?.value ?? city)}
            onCreateOption={(val: string) => { addIfMissing(cityOptions, setCityOptions, val) }}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
        </label>
        <label>Detail (4)
          <CreatableSelect
            options={detailOptions}
            value={detailOptions.find(o => o.value === detail) || { value: detail, label: detail }}
            onChange={(opt: SingleValue<Option>) => setDetail(opt?.value ?? detail)}
            onCreateOption={(val: string) => { addIfMissing(detailOptions, setDetailOptions, val) }}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
        </label>
        <label>Weather (2)
          <CreatableSelect
            options={weatherOptions}
            value={weatherOptions.find(o => o.value === weather) || { value: weather, label: weather }}
            onChange={(opt: SingleValue<Option>) => setWeather(opt?.value ?? weather)}
            onCreateOption={(val: string) => { addIfMissing(weatherOptions, setWeatherOptions, val) }}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
        </label>
        <label>Time (2)
          <CreatableSelect
            options={timeOptions}
            value={timeOptions.find(o => o.value === time) || { value: time, label: time }}
            onChange={(opt: SingleValue<Option>) => setTime(opt?.value ?? time)}
            onCreateOption={(val: string) => { addIfMissing(timeOptions, setTimeOptions, val) }}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
        </label>
        <label>Theme (2, optional)
          <CreatableSelect
            isClearable
            options={themeOptions}
            value={theme ? (themeOptions.find(o => o.value === theme) || { value: theme, label: theme }) : null}
            onChange={(opt: SingleValue<Option>) => setTheme(opt?.value ?? '')}
            onCreateOption={(val: string) => { addIfMissing(themeOptions, setThemeOptions, val) }}
            formatCreateLabel={(val: string) => `Add "${val}"`}
            createOptionPosition="first"
          />
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
        <button
          className="primary button-cta"
          onClick={registerColor}
          disabled={loading}
        >
          {loading ? '등록 중...' : 'Register'}
        </button>
        <button className="primary button-cta" onClick={copy}>Copy</button>
      </div>

      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: message.includes('성공') ? '#d1fae5' : '#fee2e2',
          color: message.includes('성공') ? '#065f46' : '#dc2626',
          fontSize: '14px',
          marginTop: '12px'
        }}>
          {message}
        </div>
      )}
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

