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
      url: `${SITE_URL}/products/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
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
    // {
    //   url: `${SITE_URL}/pricing/`,
    //   lastModified: currentDate,
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
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
  ];

  // Tool specific pages (all 22 canonical live tools)
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

  return [...staticPages, ...toolPages];
}
