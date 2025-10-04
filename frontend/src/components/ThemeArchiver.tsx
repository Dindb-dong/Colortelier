import { useMemo, useState } from 'react'
import SPcodes from '../SPcodes.json'
import CreatableSelect from 'react-select/creatable'
import type { SingleValue } from 'react-select'
import { convertToWebpIfLarge, objectUrlFromFile } from '../utils/image'
import { useUIStore } from '../store/ui'
import { themeApi } from '../utils/api'
import { type ThemeArchive } from '../../../shared/types'

type Option = { value: string; label: string }

export default function ThemeArchiver() {
  const addTheme = useUIStore((s) => s.addTheme)

  const [file, setFile] = useState<File | null>(null)
  const [domain, setDomain] = useState<string>('L')
  const [country, setCountry] = useState<string>('KR')
  const [city, setCity] = useState<string>('SEL')
  const [detail, setDetail] = useState<string>('HNGD')
  const [weather, setWeather] = useState<string>('CL')
  const [time, setTime] = useState<string>('GD')
  const [theme, setTheme] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>('')

  const domainOptions: Option[] = useMemo(() => SPcodes.domain.map((d: string) => ({ value: d.split('=')[0], label: d })), [])
  const countryOptions: Option[] = useMemo(() => SPcodes.country.map((c: string) => ({ value: c.split('=')[0], label: c })), [])
  const cityOptions: Option[] = useMemo(() => SPcodes.city.map((c: string) => ({ value: c.split('=')[0], label: c })), [])
  const detailOptions: Option[] = useMemo(() => SPcodes.detail.map((d: string) => ({ value: d.split('=')[0], label: d })), [])
  const weatherOptions: Option[] = useMemo(() => SPcodes.weather.map((w: string) => ({ value: w.split('=')[0], label: w })), [])
  const timeOptions: Option[] = useMemo(() => SPcodes.time.map((t: string) => ({ value: t.split('=')[0], label: t })), [])
  const themeOptions: Option[] = useMemo(() => SPcodes.theme.map((t: string) => ({ value: t.split('=')[0], label: t })), [])

  const onSave = async () => {
    if (!file) {
      setMessage('이미지를 선택해 주세요')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      // 이미지 변환
      const converted = await convertToWebpIfLarge(file)

      // 테마 코드 생성
      const themeCode = `${domain}-${country}-${city}-${detail}-${weather}-${time}${theme ? `-${theme}` : ''}`

      // 백엔드 API로 테마 등록
      const result = await themeApi.createTheme(
        `Theme ${themeCode}`, // 이름
        `Generated theme with code: ${themeCode}`, // 설명
        themeCode, // 테마 코드
        converted // 썸네일 파일
      )

      // 로컬 스토어에도 추가 (기존 기능 유지)
      const url = objectUrlFromFile(converted)
      const payload: ThemeArchive = {
        id: result.theme.id,
        imageObjectUrl: url,
        domain,
        country,
        city,
        detail,
        weather,
        time,
        theme: theme || undefined,
        createdAt: Date.now(),
      }
      addTheme(payload)

      setMessage('테마가 성공적으로 등록되었습니다!')
      setFile(null)

      // 폼 초기화
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
      setSaving(false)
    }
  }

  return (
    <section className="container">
      <h2>Theme Archiving</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="grid auto">
          <label>Domain
            <CreatableSelect options={domainOptions} value={domainOptions.find(o => o.value === domain) || { value: domain, label: domain }} onChange={(opt: SingleValue<Option>) => setDomain(opt?.value ?? domain)} isClearable={false} />
          </label>
          <label>Country
            <CreatableSelect options={countryOptions} value={countryOptions.find(o => o.value === country) || { value: country, label: country }} onChange={(opt: SingleValue<Option>) => setCountry(opt?.value ?? country)} />
          </label>
          <label>City
            <CreatableSelect options={cityOptions} value={cityOptions.find(o => o.value === city) || { value: city, label: city }} onChange={(opt: SingleValue<Option>) => setCity(opt?.value ?? city)} />
          </label>
          <label>Detail
            <CreatableSelect options={detailOptions} value={detailOptions.find(o => o.value === detail) || { value: detail, label: detail }} onChange={(opt: SingleValue<Option>) => setDetail(opt?.value ?? detail)} />
          </label>
          <label>Weather
            <CreatableSelect options={weatherOptions} value={weatherOptions.find(o => o.value === weather) || { value: weather, label: weather }} onChange={(opt: SingleValue<Option>) => setWeather(opt?.value ?? weather)} />
          </label>
          <label>Time
            <CreatableSelect options={timeOptions} value={timeOptions.find(o => o.value === time) || { value: time, label: time }} onChange={(opt: SingleValue<Option>) => setTime(opt?.value ?? time)} />
          </label>
          <label>Theme (optional)
            <CreatableSelect isClearable options={themeOptions} value={theme ? (themeOptions.find(o => o.value === theme) || { value: theme, label: theme }) : null} onChange={(opt: SingleValue<Option>) => setTheme(opt?.value ?? '')} />
          </label>
        </div>
        <div>
          <label>Image
            {file && <img style={{ maxWidth: 300, maxHeight: 400, objectFit: 'cover' }} src={objectUrlFromFile(file)} alt="Theme" />}
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <button className="primary button-cta" onClick={() => setFile(null)}>Remove</button>}
          </label>
        </div>
      </div>
      <div className="row">
        <button className="primary button-cta" onClick={onSave} disabled={saving}>
          {saving ? '등록 중...' : 'Save'}
        </button>
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

      <p className="muted">Note: 백엔드에 업로드되고 로컬에도 저장됩니다. 큰 이미지는 WebP로 변환됩니다.</p>
    </section>
  )
}


