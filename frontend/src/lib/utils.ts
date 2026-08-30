export function base64ToObjectUrl(base64: string, mimeType = 'image/jpeg'): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

export function downloadBase64(base64: string, filename: string, mimeType = 'image/jpeg') {
  const url = base64ToObjectUrl(base64, mimeType)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function formatFileSize(kb: number): string {
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function validateImageFile(file: File): string | null {
  if (file.type && !file.type.startsWith('image/')) return 'Please upload an image file.'
  if (file.size > 25 * 1024 * 1024) return 'File size must be under 25MB.'
  return null
}

/**
 * Automatically resize and compress oversized camera images before upload
 * Prevents HTTP 413 (Payload Too Large) and makes processing 10x faster
 */
export async function optimizeImageForUpload(file: File, maxDimension = 2048): Promise<File> {
  if (typeof window === 'undefined') return file
  if (file.size <= 1.5 * 1024 * 1024) return file

  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(optimizedFile)
          } else {
            resolve(file)
          }
        },
        'image/jpeg',
        0.92
      )
    }

    img.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
