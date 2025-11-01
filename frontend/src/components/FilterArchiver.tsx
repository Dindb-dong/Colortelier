import { useState } from 'react'
import { convertToWebpIfLarge, objectUrlFromFile } from '../utils/image'
import { parseXmpFile } from '../utils/xmpParser'
import { type LightroomSettings, type FilterArchive } from '../../../shared/types'
import { useUIStore } from '../store/ui'
import { filterApi } from '../utils/api'
import FilterSettingsDisplay from './FilterSettingsDisplay'

export default function FilterArchiver() {
  const addFilter = useUIStore((s) => s.addFilter)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [filterFile, setFilterFile] = useState<File | null>(null)
  const [lightroomSettings, setLightroomSettings] = useState<LightroomSettings>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string>('')

  const onSave = async () => {
    if (!beforeFile || !afterFile) {
      setMessage('Before/After 이미지를 모두 선택해 주세요')
      return
    }

    if (!filterFile) {
      setMessage('XMP 필터 파일을 선택해 주세요')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      // 이미지 변환
      const [bConv, aConv] = await Promise.all([
        convertToWebpIfLarge(beforeFile),
        convertToWebpIfLarge(afterFile),
      ])

      // 필터 이름 생성
      const filterName = `Filter ${new Date().toISOString().split('T')[0]}`
      const filterDescription = Object.keys(lightroomSettings).length > 0
        ? `Lightroom settings applied: ${Object.keys(lightroomSettings).join(', ')}`
        : 'Custom filter preset'

      // 백엔드 API로 필터 등록
      const result = await filterApi.createFilter(
        filterName,
        filterDescription,
        bConv, // before image
        aConv, // after image
        filterFile // xmp file
      )

      // 로컬 스토어에도 추가 (기존 기능 유지)
      const payload: FilterArchive = {
        id: result.filter.id,
        beforeObjectUrl: objectUrlFromFile(bConv),
        afterObjectUrl: objectUrlFromFile(aConv),
        filterFileObjectUrl: objectUrlFromFile(filterFile),
        lightroomSettings: Object.keys(lightroomSettings).length > 0 ? lightroomSettings : undefined,
        createdAt: Date.now(),
      }
      addFilter(payload)

      setMessage('필터가 성공적으로 등록되었습니다!')

      // 폼 초기화
      setBeforeFile(null)
      setAfterFile(null)
      setFilterFile(null)
      setLightroomSettings({})
    } catch (error: any) {
      setMessage(`등록 실패: ${error.message}`)
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
    <section className="container filter-archiver">
      <h2>Filter Archiving</h2>
      <div className="grid auto">
        <div className="filter-image-grid">
          <label>Before
            {beforeFile && <img src={objectUrlFromFile(beforeFile)} alt="Before" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />}
            <input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] ?? null)} />
          </label>
          <label>After
            {afterFile && <img src={objectUrlFromFile(afterFile)} alt="After" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />}
            <input type="file" accept="image/*" onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="filter-file-label">Filter File (.xmp)
            <input type="file" accept=".xmp" onChange={handleFilterFileChange} />
          </label>
        </div>
      </div>

      {Object.keys(lightroomSettings).length > 0 && (
        <FilterSettingsDisplay settings={lightroomSettings} />
      )}

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


