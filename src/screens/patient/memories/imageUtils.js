import { LIMITS } from './memoryContent'

// Validates an uploaded file and downsizes very large photos. Returns
// { blob, type, name, width, height }. Throws an Error with a plain-language message.
export async function prepareImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error(`"${file.name}" is not a picture.`)
  }
  if (file.size > LIMITS.maxPhotoBytes) {
    throw new Error(`"${file.name}" is too large. Please choose a picture under 25 MB.`)
  }

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error(`"${file.name}" could not be opened. Try a JPEG, PNG or WebP picture.`)
  }

  const { width, height } = bitmap
  const longest = Math.max(width, height)
  if (longest <= LIMITS.maxPhotoEdge) {
    bitmap.close()
    return { blob: file, type: file.type, name: file.name, width, height }
  }

  const scale = LIMITS.maxPhotoEdge / longest
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  if (!blob) throw new Error(`"${file.name}" could not be prepared. Please try another picture.`)
  return { blob, type: 'image/jpeg', name: file.name, width: canvas.width, height: canvas.height }
}
