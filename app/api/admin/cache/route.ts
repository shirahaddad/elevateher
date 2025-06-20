import { NextRequest, NextResponse } from 'next/server';
import appCache from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const stats = appCache.getStats();
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        hitRate: appCache.getHitRate(),
        hitRatePercentage: `${appCache.getHitRate().toFixed(2)}%`
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    appCache.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
} 