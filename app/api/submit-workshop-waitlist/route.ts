import { NextResponse, NextRequest } from 'next/server';
import { sendWorkshopWaitlistEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { workshopWaitlistSchema } from '@/lib/validation/base';

// Create validation middleware
const validateWorkshopWaitlist = createValidationMiddleware({
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
    const validationResponse = await validateWorkshopWaitlist(request);
    if (validationResponse) return validationResponse;

    // Get validated data from request
    const data = (request as any).validatedData;
    console.log('Received workshop waitlist data:', JSON.stringify(data, null, 2));

    // Save to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('waitlist')
      .insert([
        {
          name: data.name,
          email: data.email,
          mailing_list: data.mailingList,
          category: data.category,
        },
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission to database' },
        { status: 500 }
      );
    }

    // Send email to admin only
    console.log('Attempting to send email to admin...');
    const resultAdmin = await sendWorkshopWaitlistEmail(data);

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

    console.log('Waitlist form processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing waitlist data:', error);
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