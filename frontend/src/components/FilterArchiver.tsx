import { useState } from 'react'
import { convertToWebpIfLarge, objectUrlFromFile } from '../utils/image'
import { parseXmpFile } from '../utils/xmpParser'
import { type LightroomSettings, type FilterArchive } from '../../../shared/types'
import { useUIStore } from '../store/ui'
import FilterSettingsDisplay from './FilterSettingsDisplay'

export default function FilterArchiver() {
  const addFilter = useUIStore((s) => s.addFilter)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [filterFile, setFilterFile] = useState<File | null>(null)
  const [lightroomSettings, setLightroomSettings] = useState<LightroomSettings>({})
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    if (!beforeFile || !afterFile) return alert('Before/After 이미지를 모두 선택해 주세요')
    setSaving(true)
    try {
      const [bConv, aConv] = await Promise.all([
        convertToWebpIfLarge(beforeFile),
        convertToWebpIfLarge(afterFile),
      ])
      const payload: FilterArchive = {
        id: `${Date.now()}`,
        beforeObjectUrl: objectUrlFromFile(bConv),
        afterObjectUrl: objectUrlFromFile(aConv),
        filterFileObjectUrl: filterFile ? objectUrlFromFile(filterFile) : '',
        lightroomSettings: Object.keys(lightroomSettings).length > 0 ? lightroomSettings : undefined,
        createdAt: Date.now(),
      }
      addFilter(payload)
      setBeforeFile(null)
      setAfterFile(null)
      setFilterFile(null)
      setLightroomSettings({})
      alert('Saved (local only). Backend upload pending.')
    } finally {
      setSaving(false)
    }
  }

  const handleFilterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setFilterFile(null)
      setLightroomSettings({})
      return
    }

    setFilterFile(file)

    try {
      const settings = await parseXmpFile(file)
      setLightroomSettings(settings)
      console.log(settings)
    } catch (error) {
      console.error('Failed to parse XMP file:', error)
      alert('XMP 파일을 파싱하는데 실패했습니다.')
      setLightroomSettings({})
    }
  }

  return (
    <section className="container">
      <h2>Filter Archiving</h2>
      <div className="grid auto">
        <div className="grid auto" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <label>Before
            {beforeFile && <img src={objectUrlFromFile(beforeFile)} alt="Before" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />}
            <input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)} />
          </label>
          <label>After
            {afterFile && <img src={objectUrlFromFile(afterFile)} alt="After" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />}
            <input type="file" accept="image/*" onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)} />
          </label>
          <label>Filter File (.xmp)
            <input type="file" accept=".xmp" onChange={handleFilterFileChange} />
          </label>
        </div>
      </div>

      {Object.keys(lightroomSettings).length > 0 && (
        <FilterSettingsDisplay settings={lightroomSettings} />
      )}

      <div className="row">
        <button className="primary button-cta" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <p className="muted">Note: Saves locally, converts to WebP if images are large.</p>
    </section>
  )
}


