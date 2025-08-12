import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // Server-side filtering: Skip admin pages, localhost, and Vercel preview deployments
    if (data.page_url) {
      const url = new URL(data.page_url);
      const isAdminPage = url.pathname.startsWith('/admin');
      const isVercelPreview = url.hostname.includes('.vercel.app') && 
        !url.hostname.includes('elevateher.tech');
      const isLocalhost = url.hostname === 'localhost' 
        || url.hostname === '127.0.0.1' 
        || url.hostname === '::1' 
        || url.hostname.endsWith('.local');
      
      if (isAdminPage || isVercelPreview || isLocalhost) {
        console.log('📊 Server: Skipping analytics for:', data.page_url, 
          isAdminPage ? '(admin page)' : isLocalhost ? '(localhost)' : '(vercel preview)');
        return NextResponse.json({ success: true, skipped: true });
      }
    }
    
    // Extract UTM parameters from URL if present
    const url = new URL(data.page_url || '');
    const utmParams = {
      utm_source: url.searchParams.get('utm_source'),
      utm_medium: url.searchParams.get('utm_medium'),
      utm_campaign: url.searchParams.get('utm_campaign'),
      utm_content: url.searchParams.get('utm_content'),
      utm_term: url.searchParams.get('utm_term'),
    };

    // Track the event
    const { error: eventError } = await supabaseAdmin
      .from('analytics_events')
      .insert([{
        event_type: data.event_type,
        page_url: data.page_url,
        page_title: data.page_title,
        user_agent: data.user_agent,
        referrer: data.referrer,
        session_id: data.session_id,
        metadata: data.metadata || {},
        ip_address: clientIP,
      }]);

    if (eventError) {
      console.error('Error inserting analytics event:', eventError);
    }

    // If it's a page view, also track in page_views table
    if (data.event_type === 'page_view') {
      const { error: pageViewError } = await supabaseAdmin
        .from('page_views')
        .insert([{
          page_url: data.page_url,
          page_title: data.page_title,
          session_id: data.session_id,
          user_agent: data.user_agent,
          referrer: data.referrer,
          ip_address: clientIP,
        }]);

      if (pageViewError) {
        console.error('Error inserting page view:', pageViewError);
      }

      // Update or create session
      await upsertSession(data, utmParams, clientIP);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

async function upsertSession(data: any, utmParams: any, clientIP: string) {
  try {
    // Check if session exists
    const { data: existingSession } = await supabaseAdmin
      .from('analytics_sessions')
      .select('*')
      .eq('session_id', data.session_id)
      .single();

    if (existingSession) {
      // Update existing session
      await supabaseAdmin
        .from('analytics_sessions')
        .update({
          updated_at: new Date().toISOString(),
          last_page: data.page_url,
          page_count: (existingSession.page_count || 0) + 1,
        })
        .eq('session_id', data.session_id);
    } else {
      // Create new session
      await supabaseAdmin
        .from('analytics_sessions')
        .insert([{
          session_id: data.session_id,
          first_page: data.page_url,
          last_page: data.page_url,
          page_count: 1,
          user_agent: data.user_agent,
          ip_address: clientIP,
          referrer: data.referrer,
          ...utmParams,
        }]);
    }
  } catch (error) {
    console.error('Error upserting session:', error);
  }
}