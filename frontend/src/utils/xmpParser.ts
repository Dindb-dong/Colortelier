// LightroomSettings is now imported from shared/types
import type { LightroomSettings } from '../../../shared/types'

export function parseXmpFile(file: File): Promise<LightroomSettings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const settings = parseXmpContent(text)
        resolve(settings)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function parseXmpContent(xmpContent: string): LightroomSettings {
  const settings: LightroomSettings = {}

  // Adobe Camera Raw 설정들을 파싱
  const settingsMap: Record<string, keyof LightroomSettings> = {
    'crs:Exposure': 'exposure',
    'crs:Contrast': 'contrast',
    'crs:Highlights': 'highlights',
    'crs:Shadows': 'shadows',
    'crs:Whites': 'whites',
    'crs:Blacks': 'blacks',
    'crs:Temperature': 'temperature',
    'crs:Tint': 'tint',
    'crs:Vibrance': 'vibrance',
    'crs:Saturation': 'saturation',
    'crs:Clarity': 'clarity',
    'crs:Dehaze': 'dehaze',
    'crs:Sharpness': 'sharpening',
    'crs:LuminanceNoiseReduction': 'noiseReduction',
    'crs:ColorNoiseReduction': 'colorNoiseReduction',
    'crs:VignetteAmount': 'vignette',
    'crs:GrainAmount': 'grain'
  }

  // XML 파싱을 위한 정규식들
  for (const [xmpKey, settingKey] of Object.entries(settingsMap)) {
    const regex = new RegExp(`${xmpKey}="([^"]*)"`, 'i')
    const match = xmpContent.match(regex)

    if (match && match[1]) {
      const value = parseFloat(match[1])
      if (!isNaN(value)) {
        settings[settingKey] = value
      }
    }
  }

  // 추가적인 설정들도 파싱
  const additionalSettings = [
    'crs:Highlights2012',
    'crs:Shadows2012',
    'crs:Whites2012',
    'crs:Blacks2012',
    'crs:Vibrance2012',
    'crs:Saturation2012',
    'crs:Clarity2012',
    'crs:Dehaze2012'
  ]

  for (const setting of additionalSettings) {
    const regex = new RegExp(`${setting}="([^"]*)"`, 'i')
    const match = xmpContent.match(regex)

    if (match && match[1]) {
      const value = parseFloat(match[1])
      if (!isNaN(value)) {
        const key = setting.replace('crs:', '').replace('2012', '').toLowerCase()
        settings[key] = value
      }
    }
  }

  return settings
}

export function formatSettingValue(value: number, key: string): string {
  // 특정 설정값들의 단위나 포맷팅
  const unitMap: Record<string, string> = {
    temperature: 'K',
    tint: '',
    exposure: 'EV',
    contrast: '',
    highlights: '',
    shadows: '',
    whites: '',
    blacks: '',
    vibrance: '',
    saturation: '',
    clarity: '',
    dehaze: '',
    sharpening: '',
    noiseReduction: '',
    colorNoiseReduction: '',
    vignette: '',
    grain: ''
  }

  const unit = unitMap[key] || ''
  const formattedValue = value.toFixed(1)

  return unit ? `${formattedValue}${unit}` : formattedValue
}
