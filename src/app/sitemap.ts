// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL
  const baseUrl = 'https://athonix.life';
  
  // Get current date for lastModified
  const currentDate = new Date();
  
  // Define your static routes
  const staticRoutes = [
    '/',
    ''.
    '/generate-program',
    '/profile',
    // Add all your static routes
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
  
  // For dynamic routes, you could fetch from your data source
  // const dynamicRoutes = fetchedPrograms.map(...)
  
  return [...staticRoutes];
}
