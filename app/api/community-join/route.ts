import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { workshopWaitlistSchema } from '@/lib/validation/base';

// Validation middleware shared with waitlist flow
const validateCommunityJoin = createValidationMiddleware({
  schema: workshopWaitlistSchema,
  onError: (result) => {
    return NextResponse.json(
      { 
        success: false,
        errors: result.errors,
        message: 'Validation failed'
      },
      { status: 400 }
    );
  },
});

export async function POST(request: NextRequest) {
  try {
    // Validate request data
    const validationResponse = await validateCommunityJoin(request);
    if (validationResponse) return validationResponse;

    // Get validated data from request
    const data = (request as any).validatedData;
    console.log('Received community join data:', JSON.stringify(data, null, 2));

    // Save to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('waitlist')
      .insert([
        {
          name: data.name,
          email: data.email,
          mailing_list: data.mailingList,
          category: data.category,
          linkedin: data.linkedin,
        },
      ])
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission to database' },
        { status: 500 }
      );
    }

    // Send admin email (Vetting Needed)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const adminVettingLink = dbData?.id ? `${baseUrl}/admin/community-test?id=${dbData.id}` : undefined;
    // Only send email if env is configured; otherwise, log and continue
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      console.log('Attempting to send email to admin (community-join)...');
      const { sendWorkshopWaitlistEmail } = await import('@/lib/email');
      const resultAdmin = await sendWorkshopWaitlistEmail({
        ...data,
        adminVettingLink,
      });
      if (!resultAdmin.success) {
        console.error('Email sending to admin failed:', resultAdmin.error);
        return NextResponse.json(
          { 
            error: 'Failed to send email to admin',
            details: resultAdmin.error
          },
          { status: 500 }
        );
      }
    } else {
      console.warn('Email env not configured; skipping admin email for community-join.');
    }

    console.log('Community join processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing community join:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error details:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}


