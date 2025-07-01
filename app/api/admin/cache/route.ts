import { NextRequest, NextResponse } from 'next/server';
import appCache from '@/lib/cache';
import { ApplicationCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, postId, slug } = body;

    let invalidatedKeys: string[] = [];
    const stats = appCache.getStats();

    switch (type) {
      case 'blog_post':
        // Invalidate specific blog post cache
        if (slug) {
          const postKey = ApplicationCache.generateKey('blog_post', { slug });
          appCache.delete(postKey);
          invalidatedKeys.push(postKey);
        }
        break;

      case 'blog_posts':
        // Invalidate all blog posts list cache
        const blogPostKeys = stats.keys.filter(key => key.startsWith('blog_posts:'));
        blogPostKeys.forEach(key => appCache.delete(key));
        invalidatedKeys.push(...blogPostKeys);
        break;

      case 'blog_tags':
        // Invalidate blog tags cache
        const tagKeys = stats.keys.filter(key => key.startsWith('blog_tags:'));
        tagKeys.forEach(key => appCache.delete(key));
        invalidatedKeys.push(...tagKeys);
        break;

      case 'all':
        // Invalidate all blog-related cache
        const allBlogKeys = stats.keys.filter(key => 
          key.startsWith('blog_posts:') || 
          key.startsWith('blog_post:') || 
          key.startsWith('blog_tags:')
        );
        allBlogKeys.forEach(key => appCache.delete(key));
        invalidatedKeys.push(...allBlogKeys);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid cache invalidation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Cache invalidation completed for type: ${type}`,
      invalidatedKeys,
      invalidatedCount: invalidatedKeys.length
    });

  } catch (error) {
    console.error('Cache invalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = appCache.getStats();
    
    return NextResponse.json({
      success: true,
      stats: {
        size: stats.size,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: appCache.getHitRate(),
        keys: stats.keys
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    appCache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'All cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
} 