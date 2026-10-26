const MAX_BYTES = 5 * 1024 * 1024

export interface AvatarCrop {
  /** Zoom multiplier. 1 is the largest square crop that fits the image. */
  zoom: number
  /** Normalized focal point, from 0 to 100. */
  x: number
  y: number
}

/** Crops an image file to a square avatar and returns a small JPEG data URL. */
export async function fileToAvatarDataUrl(file: File, size = 192, crop: AvatarCrop = { zoom: 1, x: 50, y: 50 }): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file (PNG, JPG, GIF or WebP).')
  if (file.size > MAX_BYTES) throw new Error('Choose an image smaller than 5 MB.')

  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('That file could not be read as an image.'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image processing is not available in this browser.')

    const baseSide = Math.min(image.naturalWidth, image.naturalHeight)
    const zoom = Math.max(1, Math.min(3, crop.zoom))
    const side = baseSide / zoom
    const focalX = (Math.max(0, Math.min(100, crop.x)) / 100) * image.naturalWidth
    const focalY = (Math.max(0, Math.min(100, crop.y)) / 100) * image.naturalHeight
    const sx = Math.max(0, Math.min(image.naturalWidth - side, focalX - side / 2))
    const sy = Math.max(0, Math.min(image.naturalHeight - side, focalY - side / 2))

    context.drawImage(image, sx, sy, side, side, 0, 0, size, size)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
