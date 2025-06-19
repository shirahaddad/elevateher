import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceMetrics, connectionPool } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get performance metrics
    const metrics = getPerformanceMetrics();
    
    // Get pool status
    const poolStatus = connectionPool.getPoolStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        metrics,
        poolStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error getting connection pool metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get connection pool metrics',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'shutdown':
        await connectionPool.shutdown();
        return NextResponse.json({
          success: true,
          message: 'Connection pool shutdown initiated',
        });
      
      case 'reset':
        // Reset metrics (this would require adding a reset method)
        return NextResponse.json({
          success: true,
          message: 'Reset functionality not implemented yet',
        });
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing connection pool action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform action',
      },
      { status: 500 }
    );
  }
} 