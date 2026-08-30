import axios from 'axios';
import type { FaceDetectResult, PhotoRequirements, PhotoSpec, ProcessOptions, ProcessResult } from './types';
import { auth } from './firebase';
import { DEFAULT_SPECS } from '@/constants/photoRequirements';

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // In local dev mode, Next.js calls Laravel API Gateway on port 8000
    if (window.location.port === '3000') {
      return 'http://127.0.0.1:8000/api/v1';
    }
    // Production (served from Laravel / Namecheap shared hosting)
    return '/api/v1';
  }
  return 'http://127.0.0.1:8000/api/v1';
}

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  config.baseURL = getApiBaseUrl();

  // Attach local auth token if present
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Firebase auth fallback if present
  if (auth?.currentUser) {
    try {
      const fbToken = await auth.currentUser.getIdToken();
      if (fbToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${fbToken}`;
      }
    } catch {
      // Ignored
    }
  }

  return config;
});

// ==========================================
// AI Tools (Proxied via Laravel to AWS Python)
// ==========================================

export async function removeBackground(file: File, bgColor = 'transparent'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('bg_color', bgColor);

  const res = await client.post('/ai/remove-background', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (res.data?.data?.image_data_url) {
    return res.data.data.image_data_url;
  }
  if (res.data?.image_data_url) {
    return res.data.image_data_url;
  }
  if (res.data?.processed_image) {
    return res.data.processed_image;
  }
  throw new Error(res.data?.message || 'Failed to remove background.');
}

export async function getRequirements(): Promise<PhotoRequirements> {
  try {
    const res = await client.get('/requirements');
    if (res.data?.countries && typeof res.data.countries === 'object' && !Array.isArray(res.data.countries)) {
      return res.data;
    }
    return { countries: DEFAULT_SPECS as any };
  } catch {
    return { countries: DEFAULT_SPECS as any };
  }
}

export async function getCountrySpec(code: string): Promise<PhotoSpec> {
  const res = await client.get(`/requirements/${code}`);
  return res.data;
}

export async function processPhoto(
  file: File,
  documentType: string,
  options: Partial<ProcessOptions> = {}
): Promise<ProcessResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('document_type', documentType);
  form.append('options', JSON.stringify(options));

  const res = await client.post('/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function detectFaces(file: File): Promise<FaceDetectResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await client.post('/detect-face', form);
  return res.data;
}

export async function getHistory(): Promise<any[]> {
  try {
    const res = await client.get('/jobs');
    return res.data;
  } catch {
    return [];
  }
}

// ==========================================
// Normal Tools (Executed 100% in Laravel / PHP)
// ==========================================

export async function generateQrCode(params: {
  text: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
}): Promise<{ svg: string; text: string }> {
  const res = await client.post('/tools/qr/generate', {
    text: params.text,
    size: params.size || 300,
    color: params.color,
    background_color: params.backgroundColor,
  });
  return res.data.data;
}

// ==========================================
// Laravel Authentication APIs
// ==========================================

export async function registerUser(payload: { name: string; email: string; password: string; password_confirmation: string }) {
  const res = await client.post('/auth/register', payload);
  if (res.data?.data?.token) {
    localStorage.setItem('auth_token', res.data.data.token);
  }
  return res.data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const res = await client.post('/auth/login', payload);
  if (res.data?.data?.token) {
    localStorage.setItem('auth_token', res.data.data.token);
  }
  return res.data;
}

export async function getUserProfile() {
  const res = await client.get('/auth/profile');
  return res.data;
}

export async function logoutUser() {
  try {
    await client.post('/auth/logout');
  } finally {
    localStorage.removeItem('auth_token');
  }
}
