import { NextResponse, NextRequest } from 'next/server';
import { sendLearnMoreEmail } from '@/lib/email';
import { sendLearnMoreEmailProspect } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';
import { createValidationMiddleware } from '@/lib/validation/middleware';
import { learnMoreFormSchema } from '@/lib/validation/base';

// Create validation middleware
const validateLearnMore = createValidationMiddleware({
  schema: learnMoreFormSchema,
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
    const validationResponse = await validateLearnMore(request);
    if (validationResponse) return validationResponse;

    // Get validated data from request
    const data = (request as any).validatedData;
    console.log('Received learn-more data:', JSON.stringify(data, null, 2));

    // Save to database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('learn_more_submissions')
      .insert([
        {
          name: data.name,
          email: data.email,
          mailing_list: data.mailingList,
        },
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission to database' },
        { status: 500 }
      );
    }

    // Send email to admin
    console.log('Attempting to send email to admin...');
    const resultAdmin = await sendLearnMoreEmail(data);

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

    // Send email to prospect
    console.log('Attempting to send welcome email to prospect...');
    const resultWelcome = await sendLearnMoreEmailProspect({
      email: data.email,
      name: data.name
    });

    if (!resultWelcome.success) {
      console.error('Email sending to prospect failed:', resultWelcome.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email to prospect',
          details: resultWelcome.error
        },
        { status: 500 }
      );
    }

    console.log('Form processed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing learn more data:', error);
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