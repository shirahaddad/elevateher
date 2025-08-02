import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// API endpoint to clean up existing admin/vercel data
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Starting analytics cleanup...');
    
    // Delete existing admin page views
    const { error: adminError } = await supabaseAdmin
      .from('page_views')
      .delete()
      .like('page_url', '%/admin%');
    
    if (adminError) {
      console.error('Error deleting admin page views:', adminError);
    } else {
      console.log('✅ Cleaned up admin page views');
    }
    
    // Delete existing vercel preview page views
    const { error: vercelError } = await supabaseAdmin
      .from('page_views')
      .delete()
      .like('page_url', '%.vercel.app%');
    
    if (vercelError) {
      console.error('Error deleting vercel page views:', vercelError);
    } else {
      console.log('✅ Cleaned up vercel preview page views');
    }
    
    // Delete admin events
    const { error: adminEventsError } = await supabaseAdmin
      .from('analytics_events')
      .delete()
      .like('page_url', '%/admin%');
    
    if (adminEventsError) {
      console.error('Error deleting admin events:', adminEventsError);
    } else {
      console.log('✅ Cleaned up admin events');
    }
    
    // Delete vercel events
    const { error: vercelEventsError } = await supabaseAdmin
      .from('analytics_events')
      .delete()
      .like('page_url', '%.vercel.app%');
    
    if (vercelEventsError) {
      console.error('Error deleting vercel events:', vercelEventsError);
    } else {
      console.log('✅ Cleaned up vercel preview events');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analytics cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup analytics data' },
      { status: 500 }
    );
  }
}