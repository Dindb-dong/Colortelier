import { type LightroomSettings } from '../../../shared/types'
import { formatSettingValue } from '../utils/xmpParser'

interface FilterSettingsDisplayProps {
  settings: LightroomSettings
}

const settingLabels: Record<keyof LightroomSettings, string> = {
  exposure: '노출 (Exposure)',
  contrast: '대비 (Contrast)',
  highlights: '하이라이트 (Highlights)',
  shadows: '그림자 (Shadows)',
  whites: '흰색 (Whites)',
  blacks: '검은색 (Blacks)',
  temperature: '색온도 (Temperature)',
  tint: '색조 (Tint)',
  vibrance: '채도 (Vibrance)',
  saturation: '채도 (Saturation)',
  clarity: '선명도 (Clarity)',
  dehaze: '안개 제거 (Dehaze)',
  sharpening: '선명화 (Sharpening)',
  noiseReduction: '노이즈 감소 (Noise Reduction)',
  colorNoiseReduction: '컬러 노이즈 감소 (Color Noise Reduction)',
  vignette: '비네팅 (Vignette)',
  grain: '그레인 (Grain)'
}

export default function FilterSettingsDisplay({ settings }: FilterSettingsDisplayProps) {
  const hasSettings = Object.keys(settings).length > 0

  if (!hasSettings) {
    return (
      <div className="filter-settings">
        <h3>필터 설정</h3>
        <p className="muted">설정값이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="filter-settings">
      <h3>라이트룸 필터 설정</h3>
      <div className="settings-grid">
        {Object.entries(settings).map(([key, value]) => {
          if (value === undefined) return null

          const label = settingLabels[key as keyof LightroomSettings] || key
          const formattedValue = formatSettingValue(value, key)

          return (
            <div key={key} className="setting-item">
              <span className="setting-label">{label}</span>
              <span className="setting-value">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
