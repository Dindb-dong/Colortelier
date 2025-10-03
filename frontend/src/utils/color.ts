export type RGB = { r: number; g: number; b: number }
export type CMYK = { c: number; m: number; y: number; k: number }
export type HSL = { h: number; s: number; l: number }

export function normalizeHex(hex: string): string {
  const h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    return h.split('').map((ch) => ch + ch).join('')
  }
  return h.slice(0, 6)
}

export function hexToRgb(hex: string): RGB {
  const h = normalizeHex(hex)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rf = r / 255, gf = g / 255, bf = b / 255
  const k = 1 - Math.max(rf, gf, bf)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const c = ((1 - rf - k) / (1 - k)) * 100
  const m = ((1 - gf - k) / (1 - k)) * 100
  const y = ((1 - bf - k) / (1 - k)) * 100
  return { c: round1(c), m: round1(m), y: round1(y), k: round1(k * 100) }
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rf = r / 255, gf = g / 255, bf = b / 255
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf)
  let h = 0, s = 0
  const l = (max + min) / 2
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rf: h = 60 * (((gf - bf) / d) % 6); break
      case gf: h = 60 * (((bf - rf) / d) + 2); break
      default: h = 60 * (((rf - gf) / d) + 4)
    }
  }
  if (h < 0) h += 360
  return { h, s, l }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rf = 0, gf = 0, bf = 0
  if (0 <= h && h < 60) { rf = c; gf = x; bf = 0 }
  else if (60 <= h && h < 120) { rf = x; gf = c; bf = 0 }
  else if (120 <= h && h < 180) { rf = 0; gf = c; bf = x }
  else if (180 <= h && h < 240) { rf = 0; gf = x; bf = c }
  else if (240 <= h && h < 300) { rf = x; gf = 0; bf = c }
  else { rf = c; gf = 0; bf = x }
  return { r: Math.round((rf + m) * 255), g: Math.round((gf + m) * 255), b: Math.round((bf + m) * 255) }
}

export function rotateHue(hex: string, deg: number): string {
  const hsl = rgbToHsl(hexToRgb(hex))
  const h = (hsl.h + deg + 360) % 360
  return rgbToHex(hslToRgb({ h, s: hsl.s, l: hsl.l }))
}

export function generateComplements(hex: string) {
  // 4 free: 180° complement, and two analogous around complement, plus base? Use four complement variants
  const base = normalizeHex(hex)
  const hx = `#${base}`
  const comp = rotateHue(hx, 180)
  const compAnalog1 = rotateHue(hx, 160)
  const compAnalog2 = rotateHue(hx, 200)
  const free = [comp, compAnalog1, compAnalog2, rotateHue(hx, 180 + 30)]

  // Paid extended set: add triadic and tetradic around
  const paid = [
    ...free,
    rotateHue(hx, 120), rotateHue(hx, 240),
    rotateHue(hx, 90), rotateHue(hx, 270),
    rotateHue(hx, 150), rotateHue(hx, 210),
    rotateHue(hx, 30), rotateHue(hx, 330),
    rotateHue(hx, 15), rotateHue(hx, 345),
    rotateHue(hx, 60), rotateHue(hx, 300),
    rotateHue(hx, 75), rotateHue(hx, 285)
  ].slice(0, 16)

  return { free, paid }
}

function round1(v: number) { return Math.round(v * 10) / 10 }

