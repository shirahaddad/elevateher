import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase';
import { TEAM } from '@/lib/team';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Static routes
  const staticRoutes = [
    '',
    '/blog',
    '/services',
    '/services/career-advising',
    '/services/mentoring',
    '/services/exec-coaching',
    '/services/workshops',
    '/services/community',
    '/about',
    '/newsletter',
    '/privacy',
    '/learn-more',
    '/questionnaire',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/blog' ? 'weekly' : 'weekly') as const,
    priority: route === '' ? 1 : route === '/about' || route === '/services' ? 0.9 : 0.8,
  }));

  // About team member routes
  const aboutRoutes = TEAM.map((member) => ({
    url: `${baseUrl}/about/${member.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Fetch blog posts directly from Supabase
  const { data: blogPosts, error } = await supabaseAdmin
    .from('posts')
    .select('slug, updated_at, published_at')
    .eq('is_published', true);

  const blogPostRoutes =
    error || !blogPosts
      ? []
      : blogPosts.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at || post.published_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));

  if (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Fetch workshops (NEXT and PAST only)
  const { data: workshops, error: wError } = await supabaseAdmin
    .from('workshops')
    .select('slug, updated_at, start_at, status')
    .in('status', ['NEXT', 'PAST']);

  const workshopRoutes =
    wError || !workshops
      ? []
      : workshops.map((w) => {
          const src = w.updated_at ?? w.start_at;
          return {
            url: `${baseUrl}/services/workshops/${w.slug}`,
            lastModified: src ? new Date(src) : new Date(),
            changeFrequency: w.status === 'NEXT' ? ('daily' as const) : ('monthly' as const),
            priority: w.status === 'NEXT' ? 0.8 : 0.6,
          };
        });

  // Fetch public newsletter archive slugs
  const { data: newsletterItems } = await supabaseAdmin
    .from('newsletter_archive')
    .select('slug, published_at')
    .eq('is_public', true)
    .order('published_at', { ascending: false });

  const newsletterRoutes = (newsletterItems || []).map((item) => ({
    url: `${baseUrl}/newsletter/${item.slug}`,
    lastModified: item.published_at ? new Date(item.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...aboutRoutes,
    ...blogPostRoutes,
    ...workshopRoutes,
    ...newsletterRoutes,
  ];
} 