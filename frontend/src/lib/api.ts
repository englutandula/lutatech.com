import axios from 'axios'
import type { FaceDetectResult, PhotoRequirements, PhotoSpec, ProcessOptions, ProcessResult } from './types'

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (typeof window !== 'undefined') {
    // In local dev mode (Next.js on port 3000), point to local FastAPI backend on port 8000
    if (window.location.port === '3000') {
      return 'http://127.0.0.1:8000'
    }
    // When hosted on Vercel, automatically point to Render backend
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://luta-studio.onrender.com'
    }
    // In production web server (FastAPI serving static frontend or reverse proxy), use relative path
    return ''
  }
  return 'https://luta-studio.onrender.com'
}

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 75000, // 75s timeout to allow Render free tier backend to wake up from idle sleep
})

client.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  return config
})

export async function getRequirements(): Promise<PhotoRequirements> {
  const res = await client.get('/api/requirements')
  return res.data
}

export async function getCountrySpec(code: string): Promise<PhotoSpec> {
  const res = await client.get(`/api/requirements/${code}`)
  return res.data
}

export async function processPhoto(
  file: File,
  documentType: string,
  options: Partial<ProcessOptions> = {}
): Promise<ProcessResult> {
  const defaults: ProcessOptions = {
    brightness: 50,
    contrast: 50,
    saturation: 50,
    remove_background: true,
    auto_enhance: true,
  }
  const merged = { ...defaults, ...options }

  const form = new FormData()
  form.append('file', file)
  form.append('document_type', documentType)
  form.append('options', JSON.stringify(merged))

  const res = await client.post('/api/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function detectFaces(file: File): Promise<FaceDetectResult> {
  const form = new FormData()
  form.append('file', file)
  const res = await client.post('/api/detect-face', form)
  return res.data
}

export async function removeBackground(file: File, bgColor = '#FFFFFF'): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('background_color', bgColor)
  const res = await client.post('/api/remove-background', form)
  return res.data.processed_image
}
