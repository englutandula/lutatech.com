import axios from 'axios';
import type { FaceDetectResult, PhotoRequirements, PhotoSpec, ProcessOptions, ProcessResult, AuthUser } from './types';
import { DEFAULT_SPECS } from '@/constants/photoRequirements';
import { optimizeImageForUpload } from './utils';

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return 'http://localhost:8000/api/v1';
    }
    return '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
}

export const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  config.baseURL = getApiBaseUrl();

  // Attach token from localStorage if available in browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 on auth verification routes, clear expired token
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || '';
      if (url.includes('/auth/profile') || url.includes('/auth/logout')) {
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('luta_auth_changed'));
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AI Tools (Proxied via Laravel to AWS Python)
// ==========================================

export async function removeBackground(file: File, bgColor = 'transparent'): Promise<string> {
  const optimizedFile = await optimizeImageForUpload(file);
  const form = new FormData();
  form.append('file', optimizedFile);
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
  const optimizedFile = await optimizeImageForUpload(file);
  const form = new FormData();
  form.append('file', optimizedFile);
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
  const res = await client.post('/detect-face/', form);
  return res.data;
}

export async function getHistory(): Promise<any[]> {
  try {
    const res = await client.get('/jobs');
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function deleteHistoryItem(jobId: number | string): Promise<boolean> {
  try {
    await client.delete(`/jobs/${jobId}`);
    return true;
  } catch {
    return false;
  }
}

export async function clearHistory(): Promise<boolean> {
  try {
    await client.delete('/jobs');
    return true;
  } catch {
    return false;
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
// Laravel Full-Stack Authentication APIs
// ==========================================

export function getSocialiteAuthUrl(provider: 'google' = 'google'): string {
  const base = getApiBaseUrl();
  return `${base}/auth/${provider}/redirect`;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await client.post('/auth/register', payload);
  if (res.data?.data?.token && typeof window !== 'undefined') {
    localStorage.setItem('auth_token', res.data.data.token);
  }
  return res.data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const res = await client.post('/auth/login', payload);
  if (res.data?.data?.token && typeof window !== 'undefined') {
    localStorage.setItem('auth_token', res.data.data.token);
  }
  return res.data;
}

export async function getUserProfile(): Promise<{ success: boolean; data: { user: AuthUser } }> {
  const res = await client.get('/auth/profile');
  return res.data;
}

export async function logoutUser(): Promise<void> {
  try {
    await client.post('/auth/logout');
  } catch (err) {
    console.warn('Logout request warning:', err);
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

export async function forgotPassword(payload: { email: string }) {
  const res = await client.post('/auth/password/forgot', payload);
  return res.data;
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await client.post('/auth/password/reset', payload);
  if (res.data?.data?.token && typeof window !== 'undefined') {
    localStorage.setItem('auth_token', res.data.data.token);
  }
  return res.data;
}

export async function resendVerificationEmail(payload?: { email?: string }) {
  const res = await client.post('/auth/email/resend', payload || {});
  return res.data;
}

export async function verifyEmailBySignedUrl(signedUrl: string) {
  const res = await axios.get(signedUrl, {
    headers: { Accept: 'application/json' },
  });
  return res.data;
}
