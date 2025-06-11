import { revalidatePath } from 'next/cache';

/**
 * Invalidates the cache for blog-related paths
 * @param paths - Array of paths to invalidate
 */
export async function invalidateBlogCache(paths: string[] = []) {
  // Always invalidate the main blog paths
  const defaultPaths = [
    '/api/v1/blog',
    '/api/v1/blog/tags',
    '/blog',
  ];

  // Combine default paths with any additional paths
  const allPaths = Array.from(new Set([...defaultPaths, ...paths]));

  // Revalidate each path
  for (const path of allPaths) {
    revalidatePath(path);
  }
}

/**
 * Invalidates the cache for a specific blog post
 * @param slug - The slug of the blog post to invalidate
 */
export async function invalidateBlogPostCache(slug: string) {
  await invalidateBlogCache([
    `/api/blog/${slug}`,
    `/blog/${slug}`,
  ]);
}

/**
 * Invalidates the cache for all blog-related content
 * Used when making changes that affect multiple posts or the entire blog
 */
export async function invalidateAllBlogCache() {
  await invalidateBlogCache();
} 