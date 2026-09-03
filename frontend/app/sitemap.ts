import { MetadataRoute } from 'next';
import { getLiveTools } from '@/lib/tools';

export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tools/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/login/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/register/`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Tool specific pages
  const liveTools = getLiveTools();
  const toolPages: MetadataRoute.Sitemap = liveTools.map((tool) => {
    const path = tool.href || `/tools/${tool.slug}`;
    const cleanPath = path.endsWith('/') ? path : `${path}/`;
    return {
      url: `${SITE_URL}${cleanPath}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: tool.popular ? 0.9 : 0.8,
    };
  });

  // Dedicated alias routes that provide specific utility tools
  const additionalToolRoutes = [
    '/tools/passport/',
    '/tools/passport-photo-maker/',
    '/tools/remove-bg/',
    '/tools/background-remover/',
    '/tools/pdf/',
  ];

  const aliasPages: MetadataRoute.Sitemap = additionalToolRoutes
    .filter((route) => !toolPages.some((tp) => tp.url === `${SITE_URL}${route}`))
    .map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

  return [...staticPages, ...toolPages, ...aliasPages];
}
