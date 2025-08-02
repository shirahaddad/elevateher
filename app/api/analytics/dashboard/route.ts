import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateISO = startDate.toISOString();

    // Get total page views (exclude admin pages and vercel previews)
    const { data: totalPageViews, error: pageViewsError } = await supabaseAdmin
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateISO)
      .not('page_url', 'like', '%/admin%')
      .not('page_url', 'like', '%.vercel.app%');

    if (pageViewsError) {
      console.error('Error fetching page views:', pageViewsError);
    }

    // Get unique visitors (exclude admin pages and vercel previews)
    const { data: uniqueVisitorsData, error: uniqueVisitorsError } = await supabaseAdmin
      .from('page_views')
      .select('session_id')
      .gte('created_at', startDateISO)
      .not('page_url', 'like', '%/admin%')
      .not('page_url', 'like', '%.vercel.app%');

    const uniqueVisitors = uniqueVisitorsData 
      ? new Set(uniqueVisitorsData.map(v => v.session_id)).size 
      : 0;

    if (uniqueVisitorsError) {
      console.error('Error fetching unique visitors:', uniqueVisitorsError);
    }

    // Get top pages
    const { data: topPagesData, error: topPagesError } = await supabaseAdmin
      .rpc('get_top_pages', { days_back: days });

    if (topPagesError) {
      console.error('Error fetching top pages:', topPagesError);
      // Fallback query
      const { data: fallbackTopPages } = await supabaseAdmin
        .from('page_views')
        .select('page_url, page_title')
        .gte('created_at', startDateISO)
        .not('page_url', 'like', '%/admin%')
        .not('page_url', 'like', '%.vercel.app%');
      
      const pageViewCounts = fallbackTopPages?.reduce((acc: any, view) => {
        const key = view.page_url;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const topPages = Object.entries(pageViewCounts || {})
        .map(([page, views]) => ({ page, views }))
        .sort((a: any, b: any) => b.views - a.views)
        .slice(0, 10);
    }

    // Get form submissions
    const { data: formSubmissionsData, error: formSubmissionsError } = await supabaseAdmin
      .from('analytics_events')
      .select('metadata')
      .eq('event_type', 'form_submission')
      .gte('created_at', startDateISO);

    const formSubmissions = formSubmissionsData?.reduce((acc: any, event) => {
      const formName = event.metadata?.form_name || 'unknown';
      acc[formName] = (acc[formName] || 0) + 1;
      return acc;
    }, {});

    const formSubmissionsArray = Object.entries(formSubmissions || {})
      .map(([form, count]) => ({ form, count }))
      .sort((a: any, b: any) => b.count - a.count);

    if (formSubmissionsError) {
      console.error('Error fetching form submissions:', formSubmissionsError);
    }

    // Get recent activity
    const { data: recentActivity, error: recentActivityError } = await supabaseAdmin
      .from('analytics_events')
      .select('event_type, created_at, page_url, metadata')
      .gte('created_at', startDateISO)
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentActivityError) {
      console.error('Error fetching recent activity:', recentActivityError);
    }

    // Get daily stats
    const { data: dailyStatsData, error: dailyStatsError } = await supabaseAdmin
      .rpc('get_daily_stats', { days_back: days });

    if (dailyStatsError) {
      console.error('Error fetching daily stats:', dailyStatsError);
    }

    // Get existing submission data
    const { data: questionnaireSubmissions } = await supabaseAdmin
      .from('questionnaire_submissions')
      .select('created_at, source')
      .gte('created_at', startDateISO);

    const { data: learnMoreSubmissions } = await supabaseAdmin
      .from('learn_more_submissions')
      .select('created_at')
      .gte('created_at', startDateISO);

    const { data: waitlistSubmissions } = await supabaseAdmin
      .from('workshop_waitlist')
      .select('created_at')
      .gte('created_at', startDateISO);

    // Combine existing submission data
    const existingFormStats = [
      { form: 'questionnaire', count: questionnaireSubmissions?.length || 0 },
      { form: 'learn_more', count: learnMoreSubmissions?.length || 0 },
      { form: 'workshop_waitlist', count: waitlistSubmissions?.length || 0 },
    ];

    // Merge with tracked form submissions
    const allFormSubmissions = [...formSubmissionsArray];
    existingFormStats.forEach(existing => {
      const found = allFormSubmissions.find(tracked => tracked.form === existing.form);
      if (!found) {
        allFormSubmissions.push(existing);
      }
    });

    const response = {
      totalPageViews: totalPageViews?.length || 0,
      uniqueVisitors,
      topPages: topPagesData || [],
      formSubmissions: allFormSubmissions,
      recentActivity: recentActivity || [],
      dailyStats: dailyStatsData || [],
      dateRange: {
        start: startDateISO,
        end: new Date().toISOString(),
        days
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analytics dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}