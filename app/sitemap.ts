import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Static routes
  const staticRoutes = [
    '',
    '/blog',
    '/services/coaching',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch blog posts directly from Supabase
  const { data: blogPosts, error } = await supabaseAdmin
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return staticRoutes;
  }

  // Blog post routes
  const blogPostRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogPostRoutes];
} 