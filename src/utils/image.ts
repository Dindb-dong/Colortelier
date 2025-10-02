export type WebpOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0..1
  sizeThresholdBytes?: number // convert only if original bigger than this
}

const defaultOptions: Required<WebpOptions> = {
  maxWidth: 2560,
  maxHeight: 2560,
  quality: 0.82,
  sizeThresholdBytes: 600 * 1024, // 600KB
}

export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  const blob = file.slice(0, file.size, file.type)
  return await createImageBitmap(blob)
}

export async function imageBitmapToCanvas(img: ImageBitmap, maxWidth: number, maxHeight: number): Promise<HTMLCanvasElement> {
  const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height)
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

export async function convertToWebpIfLarge(file: File, options?: WebpOptions): Promise<File> {
  const opts = { ...defaultOptions, ...(options ?? {}) }
  if (file.size <= opts.sizeThresholdBytes) return file
  try {
    const img = await fileToImageBitmap(file)
    const canvas = await imageBitmapToCanvas(img, opts.maxWidth, opts.maxHeight)
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to encode WebP'))), 'image/webp', opts.quality)
    })
    const webpFile = new File([blob], replaceExt(file.name, 'webp'), { type: 'image/webp' })
    return webpFile
  } catch {
    return file
  }
}

export function replaceExt(name: string, newExt: string): string {
  const idx = name.lastIndexOf('.')
  if (idx === -1) return `${name}.${newExt}`
  return `${name.slice(0, idx)}.${newExt}`
}

export function objectUrlFromFile(file: File): string {
  return URL.createObjectURL(file)
}


