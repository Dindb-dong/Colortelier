import { useMemo, useState } from 'react'
import SPcodes from '../SPcodes.json'
import CreatableSelect from 'react-select/creatable'
import type { SingleValue } from 'react-select'
import { convertToWebpIfLarge, objectUrlFromFile } from '../utils/image'
import { type ThemeArchive, useUIStore } from '../store/ui'

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

  const domainOptions: Option[] = useMemo(() => SPcodes.domain.map((d: string) => ({ value: d.split('=')[0], label: d })), [])
  const countryOptions: Option[] = useMemo(() => SPcodes.country.map((c: string) => ({ value: c.split('=')[0], label: c })), [])
  const cityOptions: Option[] = useMemo(() => SPcodes.city.map((c: string) => ({ value: c.split('=')[0], label: c })), [])
  const detailOptions: Option[] = useMemo(() => SPcodes.detail.map((d: string) => ({ value: d.split('=')[0], label: d })), [])
  const weatherOptions: Option[] = useMemo(() => SPcodes.weather.map((w: string) => ({ value: w.split('=')[0], label: w })), [])
  const timeOptions: Option[] = useMemo(() => SPcodes.time.map((t: string) => ({ value: t.split('=')[0], label: t })), [])
  const themeOptions: Option[] = useMemo(() => SPcodes.theme.map((t: string) => ({ value: t.split('=')[0], label: t })), [])

  const addIfMissing = (list: Option[], setList: (o: Option[]) => void, value: string) => {
    const exists = list.some(o => o.value === value)
    if (!exists) {
      setList([...list, { value: value.split('=')[0], label: value }])
    }
  }

  const onSave = async () => {
    if (!file) return alert('이미지를 선택해 주세요')
    setSaving(true)
    try {
      const converted = await convertToWebpIfLarge(file)
      const url = objectUrlFromFile(converted)
      const payload: ThemeArchive = {
        id: `${Date.now()}`,
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
      setFile(null)
      alert('Saved (local only). Backend upload pending.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="container">
      <h2>Theme Archiving</h2>
      <div className="grid auto">
        <label>Image
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
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
      <div className="row">
        <button className="primary button-cta" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <p className="muted">Note: Saves locally, converts to WebP if image is large.</p>
    </section>
  )
}


